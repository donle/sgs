import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { YiJi } from 'core/skills';
import { TriggerSkillTrigger, TriggerSkillTriggerPair } from '../ai_skill_trigger';

export const YiJiTrigger: TriggerSkillTrigger<YiJi, GameEventIdentifiers.DamageEvent> = (
  room: Room,
  ai: Player,
  skill: YiJi,
  onEvent?: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
) => {
  return true;
};

export const yiJiTriggerPair: TriggerSkillTriggerPair<YiJi, GameEventIdentifiers.DamageEvent> = [
  YiJi.GeneralName,
  YiJiTrigger,
];
