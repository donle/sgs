import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

// 难2 【龙识】锁定技，你使用牌指定目标后，目标角色体力上限+1并受到已损失体力值伤害。

@CompulsorySkill({ name: 'pve_longshi', description: 'pve_longshi_description' })
export class PveLongShi extends TriggerSkill {
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
    const to = room.getPlayerById(toId);
    const x = to.LostHp
    await room.changeMaxHp(toId, 1);
    await room.damage({
      fromId, toId,
      damage: x,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    })
    return true;
  }
}
