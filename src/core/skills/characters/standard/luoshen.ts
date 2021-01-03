import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  JudgeEffectStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { JudgeMatcher, JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'luoshen', description: 'luoshen_description' })
export class LuoShen extends TriggerSkill {
  isAutoTrigger(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return identifier === GameEventIdentifiers.JudgeEvent;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
    stage?: AllStage,
  ) {
    return stage === PhaseStageChangeStage.StageChanged || stage === JudgeEffectStage.AfterJudgeEffect;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.JudgeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return owner.Id === content.playerId && PlayerPhaseStages.PrepareStage === content.toStage;
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      return owner.Id === content.toId && content.bySkill === this.GeneralName;
    }

    return false;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = event;
    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    if (identifier === GameEventIdentifiers.JudgeEvent) {
      event.translationsMessage = undefined;
    }
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;

    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      do {
        const judge = await room.judge(skillUseEvent.fromId, undefined, this.Name, JudgeMatcherEnum.LuoShen);
        if (JudgeMatcher.onJudge(JudgeMatcherEnum.LuoShen, Sanguosha.getCardById(judge.judgeCardId))) {
          room.notify(
            GameEventIdentifiers.AskForSkillUseEvent,
            {
              invokeSkillNames: [this.Name],
              toId: skillUseEvent.fromId,
            },
            skillUseEvent.fromId,
          );
          const { invoke } = await room.onReceivingAsyncResponseFrom(
            GameEventIdentifiers.AskForSkillUseEvent,
            skillUseEvent.fromId,
          );
          if (!invoke) {
            break;
          }
        } else {
          break;
        }
      } while (true);
    } else if (identifier === GameEventIdentifiers.JudgeEvent) {
      const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      const player = room.getPlayerById(skillUseEvent.fromId);
      const luoshenCards = player.getFlag<CardId[]>(this.Name) || [];
      luoshenCards.push(judgeEvent.judgeCardId);
      player.setFlag<CardId[]>(this.Name, luoshenCards);

      if (Sanguosha.getCardById(judgeEvent.judgeCardId).isBlack()) {
        await room.moveCards({
          movingCards: [{ card: judgeEvent.judgeCardId, fromArea: CardMoveArea.ProcessingArea }],
          moveReason: CardMoveReason.ActivePrey,
          toId: skillUseEvent.fromId,
          toArea: CardMoveArea.HandArea,
          movedByReason: this.Name,
        });
      }
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: 'luoshen', description: 'luoshen_description' })
export class LuoShenShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>): boolean {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent;
  }

  public canUse(room: Room, owner: Player) {
    return room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const askForCardDropEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const player = room.getPlayerById(askForCardDropEvent.toId);
    const luoshenCards = player.getFlag<CardId[]>(this.GeneralName) || [];
    player.removeFlag(this.GeneralName);

    const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !luoshenCards.includes(card));
    const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

    askForCardDropEvent.cardAmount = discardAmount;
    askForCardDropEvent.except = askForCardDropEvent.except
      ? [...askForCardDropEvent.except, ...luoshenCards]
      : luoshenCards;

    return true;
  }
}
