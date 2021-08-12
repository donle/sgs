import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { PeachSkill } from 'core/skills';

export class PeachSkillTrigger extends ActiveSkillTriggerClass<PeachSkill> {
  skillTrigger = (
    room: Room,
    ai: Player,
    skill: PeachSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined => {
    return {
      fromId: ai.Id,
      cardId: skillInCard!,
    };
  };
}
