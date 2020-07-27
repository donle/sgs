import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'sishu', description: 'sishu_description' })
export class SiShu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.PlayCardStageStart && content.playerId === owner.Id;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget() {
    return true;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds } = skillEffectEvent;
    const toId = toIds![0];

    if (room.getFlag(toId, this.Name) === true) {
      room.removeFlag(toId, this.Name);
    } else {
      room.setFlag<boolean>(toIds![0], this.Name, true, true);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: SiShu.GeneralName, description: SiShu.Description })
export class SiShuShadow extends TriggerSkill {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.OnJudge;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.JudgeEvent>) {
    return (
      content.byCard !== undefined &&
      Sanguosha.getCardById(content.byCard).GeneralName === 'lebusishu' &&
      room.getFlag<boolean>(content.toId, this.GeneralName) === true
    );
  }

  public async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} sishu effect, lebusishu result will reverse',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
    ).extract();

    return true;
  }

  public async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const judgeEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;

    judgeEvent.judgeMatcherEnum = JudgeMatcherEnum.SiShu;

    return true;
  }
}
