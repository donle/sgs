import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'guanwei', description: 'guanwei_description' })
export class GuanWei extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>): boolean {
    let canUse = content.toStage === PlayerPhaseStages.PlayCardStageEnd && !owner.hasUsedSkill(this.Name);
    if (canUse) {
      const events = room.Analytics.getCardUseRecord(content.playerId, 'round');
      if (events.length > 1) {
        let suit: CardSuit = Sanguosha.getCardById(events[0].cardId).Suit;
        events.shift();
        for (const event of events) {
          const nowSuit = Sanguosha.getCardById(event.cardId).Suit;
          if (suit === CardSuit.NoSuit || suit !== nowSuit) {
            canUse = false;
            break;
          }
          suit = nowSuit;
        }
      } else {
        canUse = false;
      }
    }
    
    return canUse;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard() {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }
    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    
    await room.drawCards(2, toId, 'top', fromId, this.Name);
    room.insertPlayerPhase(toId, PlayerPhase.PlayCardStage);

    return true;
  }
}
