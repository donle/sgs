import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'pindi', description: 'pindi_description' })
export class PinDi extends ActiveSkill {
  public static readonly PinDiType = 'pindi_type';

  public canUse(room: Room, owner: Player) {
    return owner.getPlayerCards().length > 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && !room.getFlag<PlayerId[]>(owner, this.Name)?.includes(target);
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return (
      room.canDropCard(owner, cardId) &&
      !room.getFlag<CardType[]>(owner, PinDi.PinDiType)?.includes(Sanguosha.getCardById(cardId).BaseType)
    );
  }

  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    const originalTargets = room.getFlag<PlayerId[]>(fromId, this.Name) || [];
    originalTargets.includes(toIds[0]) || originalTargets.push(toIds[0]);
    room.setFlag<PlayerId[]>(fromId, this.Name, originalTargets);

    const originalTypes = room.getFlag<CardType[]>(fromId, PinDi.PinDiType) || [];
    const type = Sanguosha.getCardById(cardIds[0]).BaseType;
    originalTypes.includes(type) || originalTypes.push(type);
    room.setFlag<CardType[]>(fromId, PinDi.PinDiType, originalTypes);

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const options = ['pindi:draw'];
    room.getPlayerById(toIds[0]).getPlayerCards().length > 0 && options.push('pindi:discard');

    let chosen = options[0];
    const x = room.getPlayerById(fromId).hasUsedSkillTimes(this.Name);
    if (options.length > 1) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose pindi options: {1} {2}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
            x,
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      response.selectedOption && (chosen = response.selectedOption);
    }

    if (chosen === options[0]) {
      await room.drawCards(x, toIds[0], 'top', fromId, this.Name);
    } else {
      const response = await room.askForCardDrop(
        toIds[0],
        x,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );

      if (response && response.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name);
      }
    }

    if (!room.getPlayerById(toIds[0]).Dead && room.getPlayerById(toIds[0]).LostHp > 0) {
      room.getPlayerById(fromId).ChainLocked || (await room.chainedOn(fromId));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: PinDi.Name, description: PinDi.Description })
export class PinDiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PlayCardStage &&
      (owner.getFlag<PlayerId[]>(this.GeneralName) !== undefined ||
        owner.getFlag<CardType[]>(PinDi.PinDiType) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.getFlag<PlayerId[]>(event.fromId, this.GeneralName) && room.removeFlag(event.fromId, this.GeneralName);
    room.getFlag<CardType[]>(event.fromId, PinDi.PinDiType) && room.removeFlag(event.fromId, PinDi.PinDiType);

    return true;
  }
}
