import { CardType, VirtualCard } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'wenji', description: 'wenji_description' })
export class WenJi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PlayCardStageStart &&
      room.getOtherPlayers(owner.Id).find(player => player.getPlayerCards().length > 0) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner && room.getPlayerById(targetId).getPlayerCards().length > 0;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: you can let anothor player give you a card',
      this.Name,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = event;
    const toId = Precondition.exists(toIds, 'Unable to get wenji target')[0];
    const to = room.getPlayerById(toId);
    const wholeCards = to.getPlayerCards();

    if (wholeCards.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
          cardAmount: 1,
          toId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give a card to {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        }),
        toId,
      );

      response.selectedCards = response.selectedCards || wholeCards[Math.floor(Math.random() * wholeCards.length)];

      await room.moveCards({
        movingCards: [{ card: response.selectedCards[0], fromArea: to.cardFrom(response.selectedCards[0]) }],
        moveReason: CardMoveReason.ActiveMove,
        fromId: toId,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        proposer: fromId,
      });

      let card = Sanguosha.getCardById(response.selectedCards[0]);
      while (card.isVirtualCard()) {
        const virtualCard = card as VirtualCard;
        card = Sanguosha.getCardById(virtualCard.ActualCardIds[0]);
      }

      const originalTypes = room.getFlag<CardType[]>(fromId, this.Name) || [];
      if (!originalTypes.includes(card.BaseType)) {
        originalTypes.push(card.BaseType);
      }

      let originalText = '{0}：';
      for (let i = 1; i <= originalTypes.length; i++) {
        originalText = originalText + '[{' + i + '}]';
      }

      room.setFlag<CardType[]>(
        fromId,
        this.Name,
        originalTypes,
        TranslationPack.translationJsonPatcher(
          originalText,
          this.Name,
          ...originalTypes.map(type => Functional.getCardBaseTypeAbbrRawText(type)),
        ).toString(),
      );
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WenJi.Name, description: WenJi.Description })
export class WenJiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const card = Sanguosha.getCardById(cardUseEvent.cardId);
      const wenjiTypes = owner.getFlag<CardType[]>(this.GeneralName);
      return (
        cardUseEvent.fromId === owner.Id &&
        !card.is(CardType.DelayedTrick) &&
        !card.is(CardType.Equip) &&
        wenjiTypes?.includes(card.BaseType)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        owner.getFlag<CardType[]>(this.GeneralName) !== undefined && phaseChangeEvent.from === PlayerPhase.PhaseFinish
      );
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const targets = room
        .getAllPlayersFrom()
        .map(player => player.Id)
        .filter(playerId => playerId !== fromId);

      cardUseEvent.disresponsiveList = targets;
    } else {
      room.removeFlag(fromId, this.GeneralName);
    }

    return true;
  }
}
