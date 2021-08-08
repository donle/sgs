import { AiLibrary } from 'core/ai/ai_lib';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { GuanShiFuSkill } from 'core/skills';
import { TriggerSkillTriggerClass } from '../base/trigger_skill_trigger';

export class GuanShiFuSkillTrigger extends TriggerSkillTriggerClass<
  GuanShiFuSkill,
  GameEventIdentifiers.CardEffectEvent
> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: GuanShiFuSkill,
    onEvent?: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined => {
    const cards = ai.getCardIds().filter(card => card !== skillInCard);
    let shouldUse = false;
    if (cards.length < 2) {
      return;
    }

    if (cards.length <= 4) {
      const inDangerEnemy = onEvent!.toIds!.find(toId => room.getPlayerById(toId).Hp === 1);
      if (inDangerEnemy) {
        shouldUse = true;
      }
    } else {
      shouldUse = true;
    }

    if (!shouldUse) {
      return;
    }

    return {
      fromId: ai.Id,
      invoke: skill.Name,
      cardIds: AiLibrary.sortCardbyValue(cards, false).slice(0, 2),
    };
  };
}
