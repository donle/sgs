import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { AwakeningSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@AwakeningSkill({ name: 'qinxue', description: 'qinxue_description' })
export class QinXue extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['gongxin'];
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return (
      stage === PhaseStageChangeStage.StageChanged &&
      [PlayerPhaseStages.PrepareStageStart, PlayerPhaseStages.FinishStageStart].includes(event.toStage)
    );
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id && room.enableToAwaken(this.Name, owner);
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.changeMaxHp(skillUseEvent.fromId, -1);

    let selectedOption = 'qinxue:draw2';
    if (room.getPlayerById(skillUseEvent.fromId).LostHp > 0) {
      const options = ['qinxue:draw2', 'qinxue:recover'];
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher('{0}: please choose', this.Name).extract(),
          toId: skillUseEvent.fromId,
          triggeredBySkills: [this.Name],
        },
        skillUseEvent.fromId,
      );

      response.selectedOption && (selectedOption = response.selectedOption);
    }

    if (selectedOption === 'qinxue:recover') {
      await room.recover({
        toId: skillUseEvent.fromId,
        recoveredHp: 1,
        recoverBy: skillUseEvent.fromId,
      });
    } else {
      await room.drawCards(2, skillUseEvent.fromId, 'top', skillUseEvent.fromId, this.Name);
    }

    await room.obtainSkill(skillUseEvent.fromId, this.RelatedSkills[0], true);

    return true;
  }
}
