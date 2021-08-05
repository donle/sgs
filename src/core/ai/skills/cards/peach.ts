import { AiLibrary } from 'core/ai/ai_lib';
import { ActiveSkillTriggerClass } from 'core/ai/skills/base/active_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { PeachSkill } from 'core/skills';

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
