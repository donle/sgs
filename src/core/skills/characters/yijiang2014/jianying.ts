import { CardSuit } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'jianying', description: 'jianying_description' })
export class JianYing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    if (event.fromId !== owner.Id) {
      return false;
    }

    const card = Sanguosha.getCardById(event.cardId);
    const cardRecord = room.Analytics.getUsedCard(event.fromId, 'phase');
    const lastCardId = cardRecord[cardRecord.length - 2];

    if (lastCardId !== undefined) {
      const lastCard = Sanguosha.getCardById(lastCardId);
      if (
        lastCard.Suit !== CardSuit.NoSuit &&
        lastCard.CardNumber !== undefined &&
        (lastCard.Suit === card.Suit || lastCard.CardNumber === card.CardNumber)
      ) {
        return true;
      }
    }

    return false;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    return true;
  }
}
