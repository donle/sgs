import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardLostStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'xiaoji', description: 'xiaoji_description' })
export class XiaoJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardLostEvent>, stage?: AllStage) {
    return stage === CardLostStage.AfterCardLostEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardLostEvent>) {
    if (owner.Id !== content.fromId) {
      return false;
    }

    const equipCards = content.cards.filter((card) => card.fromArea === PlayerCardsArea.EquipArea);
    if (equipCards.length > 0) {
      owner.addInvisibleMark(this.Name, equipCards.length * 2);
      return true;
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardLostEvent>;
    const from = room.getPlayerById(fromId);
    const drawAmount = from.getInvisibleMark(this.Name);
    from.removeInvisibleMark(this.Name);

    await room.drawCards(drawAmount, fromId, 'top', undefined, this.Name);
    return true;
  }
}
