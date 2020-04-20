import { CardLostReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class TieJi extends TriggerSkill {
  constructor() {
    super('tieji', 'tieji_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.Id === event.fromId;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    room.setFlag(aimEvent.toIds[0], this.name, true, true);
    const to = room.getPlayerById(aimEvent.toIds[0]);

    const judge = await room.judge(skillUseEvent.fromId, undefined, this.name);
    const judgeCard = Sanguosha.getCardById(judge.judgeCardId);

    const askForCardDrop: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      toId: aimEvent.toIds[0],
      cardAmount: 1,
      except: to.getPlayerCards().filter(cardId => Sanguosha.getCardById(cardId).Suit !== judgeCard.Suit),
      triggeredBySkills: [this.name],
      conversation: TranslationPack.translationJsonPatcher(
        "please drop a {0} card, otherwise you can't do response of slash",
        Functional.getCardSuitRawText(judgeCard.Suit),
      ).extract(),
    };

    room.notify(GameEventIdentifiers.AskForCardDropEvent, askForCardDrop, aimEvent.toIds[0]);
    const { droppedCards } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForCardDropEvent,
      aimEvent.toIds[0],
    );

    if (!droppedCards || droppedCards.length === 0) {
      EventPacker.setDisresponsiveEvent(aimEvent);
    } else {
      await room.dropCards(
        CardLostReason.PassiveDrop,
        droppedCards,
        aimEvent.toIds[0],
        skillUseEvent.fromId,
        this.name,
      );
    }

    return true;
  }
}

@CompulsorySkill
@ShadowSkill({ remainStatus: true })
export class TieJiShadow extends TriggerSkill {
  constructor() {
    super('tieji', 'tieji_description');
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: PhaseChangeStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.from === PlayerPhase.FinishStage;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.fromPlayer === owner.Id;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    for (const player of room.AlivePlayers) {
      room.removeFlag(player.Id, this.GeneralName);
    }
    return true;
  }
}
