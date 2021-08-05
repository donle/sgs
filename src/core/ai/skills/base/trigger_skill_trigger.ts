import { TriggerSkillTrigger } from 'core/ai/ai_skill_trigger';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { BaseSkillTrigger } from './base_trigger';

export class TriggerSkillTriggerClass<
  T extends TriggerSkill = TriggerSkill,
  I extends GameEventIdentifiers = GameEventIdentifiers
> extends BaseSkillTrigger {
  public readonly skillTrigger: TriggerSkillTrigger<T, I> = (
    room: Room,
    ai: Player,
    skill: TriggerSkill,
    onEvent?: ServerEventFinder<I>,
    skillInCard?: CardId,
  ) => {
    return undefined;
  };
}
