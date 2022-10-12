import { BaseSkillTrigger } from './base_trigger';
import type { TriggerSkillTrigger } from 'core/ai/ai_skill_trigger';
import type { CardId } from 'core/cards/libs/card_props';
import type { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';
import type { TriggerSkill } from 'core/skills/skill';

export class TriggerSkillTriggerClass<
  T extends TriggerSkill = TriggerSkill,
  I extends GameEventIdentifiers = GameEventIdentifiers,
> extends BaseSkillTrigger {
  public readonly skillTrigger: TriggerSkillTrigger<T, I> = (
    room: Room,
    ai: Player,
    skill: TriggerSkill,
    onEvent?: ServerEventFinder<I>,
    skillInCard?: CardId,
  ) => undefined;
}
