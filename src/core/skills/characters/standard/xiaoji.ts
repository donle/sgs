import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'xiaoji', description: 'xiaoji_description' })
export class XiaoJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    if (owner.Id !== content.fromId) {
      return false;
    }

    const equipCards = content.movingCards.filter(card => card.fromArea === PlayerCardsArea.EquipArea);
    return owner.Id === content.fromId && equipCards.length > 0;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return event.movingCards.filter(card => card.fromArea === CardMoveArea.EquipArea).length;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;

    await room.drawCards(2, fromId, 'top', undefined, this.Name);
    return true;
  }
}
