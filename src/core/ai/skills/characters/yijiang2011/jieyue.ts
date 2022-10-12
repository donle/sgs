import { AiLibrary } from 'core/ai/ai_lib';
import { TriggerSkillTriggerClass } from 'core/ai/skills/base/trigger_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea } from 'core/player/player_props';
import { JieYue } from 'core/skills';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';

export class JieYueSkillTrigger extends TriggerSkillTriggerClass<JieYue> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: JieYue) => {
    const cards = ai.getPlayerCards();
    if (cards.length <= 2) {
      return {
        fromId: ai.Id,
      };
    }

    const enemies = AiLibrary.sortEnemiesByRole(room, ai);
    return {
      fromId: ai.Id,
      invoke: skill.Name,
      toIds: [enemies[0].Id],
      cardIds: [AiLibrary.sortCardbyValue(cards, true)[0]],
    };
  };

  onAskForChoosingOptionsEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent>,
    room: Room,
  ) {
    const ai = room.getPlayerById(content.toId);
    if (ai.getCardIds(PlayerCardsArea.HandArea).length >= 4 || ai.getCardIds(PlayerCardsArea.EquipArea).length >= 3) {
      return {
        fromId: content.toId,
        selectedOption: content.options[1],
      };
    }

    return {
      fromId: content.toId,
      selectedOption: content.options[0],
    };
  }

  onAskForCardDropEvent(content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>, room: Room) {
    const ai = room.getPlayerById(content.toId);

    const handcards = AiLibrary.sortCardbyValue(ai.getCardIds(PlayerCardsArea.HandArea), false);
    return {
      fromId: ai.Id,
      droppedCards: [handcards[0]],
    };
  }

  onAskForChoosingCardWithConditionsEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>,
    room: Room,
  ) {
    const { customCardFields } = content;
    const handcards = customCardFields![PlayerCardsArea.HandArea] as CardId[];
    const equips = customCardFields![PlayerCardsArea.EquipArea] as CardId[];

    const cards: CardId[] = [];
    if (handcards) {
      cards.push(AiLibrary.sortCardbyValue(handcards)[0]);
    }
    if (equips) {
      cards.push(AiLibrary.sortCardbyValue(equips)[0]);
    }

    return {
      fromId: content.toId,
      selectedCards: cards,
    };
  }
}
