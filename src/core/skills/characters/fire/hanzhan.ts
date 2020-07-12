import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'hanzhan', description: 'hanzhan_description' })
export class HanZhan extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForPinDianCardEvent>) {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForPinDianCardEvent;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AskForPinDianCardEvent>) {
    return content.fromId !== content.toId && (owner.Id === content.fromId || owner.Id === content.toId);
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const pindianEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForPinDianCardEvent>;
    if (pindianEvent.toId === fromId) {
      pindianEvent.randomPinDianCardPlayer.push(pindianEvent.fromId);
    } else {
      pindianEvent.randomPinDianCardPlayer.push(pindianEvent.toId);
    }

    return true;
  }
}
