import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'fenji', description: 'fenji_description' })
export class FenJi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    if (!event.movingCards.find(card => card.fromArea === PlayerCardsArea.HandArea)) {
      return false;
    }

    if (event.moveReason === CardMoveReason.ActivePrey) {
      return !!event.fromId && !!event.toId && event.fromId !== event.toId;
    } else if (event.moveReason === CardMoveReason.PassiveDrop) {
      return !!event.fromId;
    } else if (event.moveReason === CardMoveReason.PassiveMove) {
      return !!event.toId && event.toArea === CardMoveArea.HandArea;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    await room.loseHp(skillUseEvent.fromId, 1);
    await room.drawCards(2, moveCardEvent.fromId, 'top', undefined, this.Name);

    return true;
  }
}
