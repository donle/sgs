import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
  TurnOverStage,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_jienu', description: 'pve_jienu_description' })
export class PveJieNu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return (
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === TurnOverStage.TurningOver
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>) {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id;
    }
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const PhaseEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        PhaseEvent.playerId === owner.Id &&
        PhaseEvent.toStage === PlayerPhaseStages.PlayCardStage &&
        room.getPlayerById(PhaseEvent.playerId).Hp < room.getPlayerById(PhaseEvent.playerId).LostHp
      );
    }
    if (identifier === GameEventIdentifiers.PlayerTurnOverEvent) {
      const turnOverEvent = event as ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>;
      return turnOverEvent.toId === owner.Id;
    }
    return false;
  }
  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (
      identifier === GameEventIdentifiers.DamageEvent ||
      (identifier === GameEventIdentifiers.PhaseStageChangeEvent &&
        room.getPlayerById(fromId).Hp < room.getPlayerById(fromId).LostHp)
    ) {
      if (identifier === GameEventIdentifiers.DamageEvent) {
        const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
        if (damageEvent.damageType === DamageType.Normal) {
          await room.recover({
            recoveredHp: 2,
            recoverBy: fromId,
            toId: fromId,
          });
        } 
        for (const player of room.getOtherPlayers(fromId)) {
          await room.damage({
            fromId,
            toId: player.Id,
            damage: 2,
            damageType: DamageType.Fire,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    if (identifier === GameEventIdentifiers.PlayerTurnOverEvent) {
      await room.recover({
        recoveredHp: 1,
        recoverBy: fromId,
        toId: fromId,
      });
      for (const player of room.getOtherPlayers(fromId)) {
        await room.damage({
          fromId,
          toId: player.Id,
          damage: 2,
          damageType: DamageType.Fire,
          triggeredBySkills: [this.Name],
        });
      }
    }
    return true;
  }
}
