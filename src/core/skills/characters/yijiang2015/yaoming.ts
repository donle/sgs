import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

const enum YaoMingEffect {
  Draw,
  Discard,
  ZhiHeng,
}

@CommonSkill({ name: 'yaoming', description: 'yaoming_description' })
export class YaoMing extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      ((owner.getFlag<YaoMingEffect[]>(this.Name) || []).length < 3 &&
        stage === DamageEffectStage.AfterDamageEffect &&
        content.fromId === owner.Id) ||
      (stage === DamageEffectStage.AfterDamagedEffect && content.toId === owner.Id)
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;
    let players = room.getAlivePlayersFrom();
    const handcards = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length;
    const used = room.getFlag<YaoMingEffect[]>(fromId, this.Name);

    used &&
      (players = players.filter(player => {
        const playerHandcards = player.getCardIds(PlayerCardsArea.HandArea).length;
        return (
          !(used.includes(YaoMingEffect.Draw) && playerHandcards < handcards) &&
          !(used.includes(YaoMingEffect.Discard) && playerHandcards > handcards) &&
          !(used.includes(YaoMingEffect.ZhiHeng) && playerHandcards === handcards)
        );
      }));

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: players.map(player => player.Id),
        toId: fromId,
        requiredAmount: 1,
        conversation: 'do you want choose a target to use YaoMing?',
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      event.toIds = response.selectedPlayers;
      return true;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds[0]);
    const fromHandcards = from.getCardIds(PlayerCardsArea.HandArea).length;
    const toHandcards = to.getCardIds(PlayerCardsArea.HandArea).length;

    if (fromHandcards > toHandcards) {
      const used = from.getFlag<YaoMingEffect[]>(this.Name) || [];
      used.push(YaoMingEffect.Draw);
      from.setFlag<YaoMingEffect[]>(this.Name, used);

      await room.drawCards(1, toIds[0], 'top', fromId, this.Name);
    } else if (fromHandcards < toHandcards) {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId: toIds[0],
        options,
        triggeredBySkills: [this.Name],
      };

      const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
      if (!resp) {
        return false;
      }

      const used = from.getFlag<YaoMingEffect[]>(this.Name) || [];
      used.push(YaoMingEffect.Discard);
      from.setFlag<YaoMingEffect[]>(this.Name, used);

      await room.dropCards(CardMoveReason.PassiveDrop, [resp.selectedCard!], toIds[0], fromId, this.Name);
    } else {
      const used = from.getFlag<YaoMingEffect[]>(this.Name) || [];
      used.push(YaoMingEffect.ZhiHeng);
      from.setFlag<YaoMingEffect[]>(this.Name, used);

      const resp = await room.askForCardDrop(
        toIds[0],
        [1, 2],
        [PlayerCardsArea.HandArea],
        false,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: you can discard at most 2 cards, and then draw the same amount of cards',
          this.GeneralName,
        ).extract(),
      );
      if (resp.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, toIds[0], toIds[0], this.Name);
        await room.drawCards(resp.droppedCards.length, toIds[0], 'top', toIds[0], this.Name);
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YaoMing.Name, description: YaoMing.Description })
export class YaoMingShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<YaoMingEffect[]>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
