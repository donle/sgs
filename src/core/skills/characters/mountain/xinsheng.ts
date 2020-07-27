import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Logger } from 'core/shares/libs/logger/logger';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { HuaShen } from './huashen';

const log = new Logger();

@CommonSkill({ name: 'xinsheng', description: 'xinsheng_description' })
export class XinSheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.toId === owner.Id;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): number {
    return event.damage;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const huashen = room.getRandomCharactersFromLoadedPackage(1);
    room.addOutsideCharacters(skillEffectEvent.fromId, HuaShen.GeneralName, huashen);

    return true;
  }
}
