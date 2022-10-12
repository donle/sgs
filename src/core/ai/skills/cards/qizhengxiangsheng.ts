import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { PlayerCardsArea } from 'core/player/player_props';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { QiZhengXiangShengSkill } from 'core/skills';

export class QiZhengXiangShengSkillTrigger extends ActiveSkillTriggerClass<QiZhengXiangShengSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: QiZhengXiangShengSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    const enemies = AiLibrary.sortEnemiesByRole(room, ai)
      .filter(e => room.canUseCardTo(skillInCard!, ai, e))
      .sort((a, b) => {
        if (a.getCardIds(PlayerCardsArea.HandArea).length < b.getCardIds(PlayerCardsArea.HandArea).length) {
          return -1;
        } else if (a.getCardIds(PlayerCardsArea.HandArea).length === b.getCardIds(PlayerCardsArea.HandArea).length) {
          return 0;
        }

        return 1;
      });

    if (enemies.length === 0) {
      return;
    }

    return {
      fromId: ai.Id,
      toIds: [enemies[0].Id],
      cardId: skillInCard!,
    };
  };

  onAskForChoosingOptionsEvent(
    content: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent>,
    room: Room,
  ) {
    const randomSelect = Math.random() > 0.6;

    return {
      fromId: content.toId,
      selectedOption: content.options[randomSelect ? 1 : 0],
    };
  }
}
