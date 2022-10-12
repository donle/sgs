import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { LvLi, LvLiEX, LvLiI, LvLiII } from './lvli';

@AwakeningSkill({ name: 'beishui', description: 'beishui_description' })
export class BeiShui extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['qingjiao'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.PrepareStageStart &&
      room.enableToAwaken(this.Name, owner)
    );
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, -1);
    await room.obtainSkill(event.fromId, this.RelatedSkills[0], true);

    const from = room.getPlayerById(event.fromId);
    from.hasSkill(LvLi.Name) && (await room.updateSkill(event.fromId, LvLi.Name, LvLiII.Name));
    from.hasSkill(LvLiI.Name) && (await room.updateSkill(event.fromId, LvLiI.Name, LvLiEX.Name));

    return true;
  }
}
