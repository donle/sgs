import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { LvLi, LvLiEX, LvLiI, LvLiII } from './lvli';

@AwakeningSkill({ name: 'choujue', description: 'choujue_description' })
export class ChouJue extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['beishui', 'qingjiao'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.from === PlayerPhase.PhaseFinish && room.enableToAwaken(this.Name, owner);
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
    await room.obtainSkill(event.fromId, this.RelatedSkills[0]);

    const from = room.getPlayerById(event.fromId);
    from.hasSkill(LvLi.Name) && (await room.updateSkill(event.fromId, LvLi.Name, LvLiI.Name));
    from.hasSkill(LvLiII.Name) && (await room.updateSkill(event.fromId, LvLiII.Name, LvLiEX.Name));

    return true;
  }
}
