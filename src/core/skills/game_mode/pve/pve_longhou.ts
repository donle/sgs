import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longhou', description: 'pve_longhou_description' })
export class PveLongHou extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return owner.Id === event.fromId && event.byCardId !== undefined;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const { toId } = aimEvent;
    await room.changeMaxHp(toId, 1);
    await room.damage({
      fromId,
      toId,
      damage: room.getPlayerById(toId).LostHp,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });
    return true;
  }
}
