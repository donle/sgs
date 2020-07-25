import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { AwakeningSkill, LordSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@LordSkill
@AwakeningSkill({ name: 'ruoyu', description: 'ruoyu_description' })
export class RuoYu extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return room.getOtherPlayers(owner.Id).find(
      player => {
        return player.Hp < owner.Hp;
      }
    ) === undefined;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates awakening skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
      this.Name,
    ).extract();

    return true;
  }

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 38ee290... add Skill Sishu
  async onEffect(room: Room, skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const fromId = skillEffectEvent.fromId;

    room.changeMaxHp(fromId, 1);
<<<<<<< HEAD
    room.recover(
      {
        recoveredHp: 1,
        toId: fromId,
        recoverBy: fromId,
        triggeredBySkills: [this.Name],
      }
    );
    room.obtainSkill(fromId, 'jijiang', true);
    room.obtainSkill(fromId, 'sishu', true);
=======
  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.changeMaxHp(event.fromId, 1);
=======
>>>>>>> 38ee290... add Skill Sishu
    room.recover(
      {
        recoveredHp: 1,
        toId: fromId,
        recoverBy: fromId,
        triggeredBySkills: [this.Name],
      }
    );
<<<<<<< HEAD
    room.obtainSkill(event.fromId, 'jijiang', true);
    //room.obtainSkill(event.fromId, 'sishu', true);
>>>>>>> ac08ff2... add Skill Ruoyu to Liushan
=======
    room.obtainSkill(fromId, 'jijiang', true);
    room.obtainSkill(fromId, 'sishu', true);
>>>>>>> 38ee290... add Skill Sishu
    
    return true;
  }
}
