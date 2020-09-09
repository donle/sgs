import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'wangxi', description: 'wangxi_description' })
export class WangXi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === DamageEffectStage.AfterDamageEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    if (content.fromId === undefined || content.fromId === content.toId) {
      return false;
    }
    return (
      (room.CurrentProcessingStage === DamageEffectStage.AfterDamageEffect &&
        content.fromId === owner.Id &&
        !room.getPlayerById(content.toId).Dead) ||
      (room.CurrentProcessingStage === DamageEffectStage.AfterDamagedEffect &&
        content.toId === owner.Id &&
        !room.getPlayerById(content.fromId).Dead)
    );
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { fromId, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;

    const players: PlayerId[] = [fromId!, toId];
    room.sortPlayersByPosition(players);
    for (const playerId of players) {
      await room.drawCards(1, playerId, 'top', skillUseEvent.fromId, this.Name);
    }

    return true;
  }
}
