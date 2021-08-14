import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'juece', description: 'juece_description' })
export class JueCe extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    let canUse = owner.Id === content.playerId && PlayerPhaseStages.FinishStageStart === content.toStage;
    if (canUse) {
      canUse = false;
      for (const player of room.getOtherPlayers(owner.Id)) {
        if (player.getFlag<boolean>(this.Name)) {
          room.removeFlag(player.Id, this.Name);
        }
        if (room.Analytics.getCardLostRecord(player.Id, 'round', undefined, 1).length > 0) {
          room.setFlag<boolean>(player.Id, this.Name, true);
          canUse = true;
        }
      }
    }

    return canUse;
  }
  public numberOfTargets() {
    return 1;
  }
  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return target !== owner && room.getPlayerById(target).getFlag<boolean>(this.Name);
  }
  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    await room.damage({
      fromId,
      toId: toIds![0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    for (const player of room.getOtherPlayers(skillUseEvent.fromId)) {
      player.removeFlag(this.GeneralName);
    }
    return true;
  }
}
