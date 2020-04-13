import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardLostStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill
export class XiaoJi extends TriggerSkill {
  constructor() {
    super('xiaoji', 'xiaoji_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardLostEvent>, stage?: AllStage) {
    return stage === CardLostStage.AfterCardLostEffect || stage === CardLostStage.BeforeCardLoseEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardLostEvent>) {
    if (owner.Id !== content.fromId) {
      return false;
    }

    if (owner.getInvisibleMark(this.name) > 0) {
      return true;
    }

    const equipCards = content.cardIds.filter(cardId => owner.cardFrom(cardId) === PlayerCardsArea.EquipArea);
    if (equipCards.length > 0) {
      owner.addInvisibleMark(this.name, equipCards.length * 2);
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
    const drawAmount = from.getInvisibleMark(this.name);
    from.removeInvisibleMark(this.name);

    await room.drawCards(drawAmount, fromId, 'top', undefined, this.name);
    return true;
  }
}
