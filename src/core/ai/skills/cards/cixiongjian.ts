import { AiLibrary } from 'core/ai/ai_lib';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import type { Room } from 'core/room/room';
import { CiXiongJianSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class CiXiongJianSkillTrigger extends TriggerSkillTriggerClass<CiXiongJianSkill> {
  public readonly skillTrigger = (room: Room, ai: Player, skill: CiXiongJianSkill) => {
    return {
      fromId: ai.Id,
      invoke: skill.Name,
    };
  };

  onAskForChoosingOptionsEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent>,
    room: Room,
  ) {
    const ai = room.getPlayerById(content.toId);
    if (ai.getCardIds(PlayerCardsArea.HandArea).length > 2) {
      return {
        fromId: content.toId,
        selectedOption: content.options[0],
      };
    }
    return {
      fromId: content.toId,
      selectedOption: content.options[1],
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
}
