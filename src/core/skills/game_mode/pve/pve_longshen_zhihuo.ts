import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'pve_longshen_zhihuo', description: 'pve_longshen_zhihuo_description' })
export class PveLongShenZhiHuo extends TriggerSkill {
  isAutoTrigger(): boolean {
    return true;
  }

  isTriggerable(event: ServerEventFinder<any>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.toPlayer === owner.Id &&
      content.to === PlayerPhase.PhaseBegin &&
      room
        .getOtherPlayers(owner.Id)
        .filter(player => player.getPlayerSkills().filter(skill => !skill.isShadowSkill()).length > 5).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const targets = room
      .getOtherPlayers(event.fromId)
      .filter(player => player.getPlayerSkills().filter(skill => !skill.isShadowSkill()).length > 5);
    for (const player of targets) {
      const skills = player.getPlayerSkills().filter(skill => !skill.isShadowSkill());
      console.log(`${player.Name} has skills:`);
      console.log(`${skills.map(skill => skill.Name)}`);
      Algorithm.shuffle(skills);
      room.loseSkill(player.Id, skills[0].Name, true);
      room.obtainSkill(event.fromId, skills[0].Name, true);
    }

    return true;
  }
}
