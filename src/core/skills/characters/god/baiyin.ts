import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { JiLve } from './jilve';

@AwakeningSkill({ name: 'baiyin', description: 'baiyin_description' })
export class BaiYin extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['jilve', 'guicai', 'fangzhu', 'jizhi', 'zhiheng', 'wansha'];
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStage;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return owner.Id === content.playerId && room.enableToAwaken(this.Name, owner);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.changeMaxHp(skillUseEvent.fromId, -1);
    await room.obtainSkill(skillUseEvent.fromId, JiLve.GeneralName, true);
    return true;
  }
}
