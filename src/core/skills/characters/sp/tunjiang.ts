import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tunjiang', description: 'tunjiang_description' })
export class TunJiang extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
        event =>
          event.fromId === owner.Id &&
          event.targetGroup !== undefined &&
          TargetGroupUtil.getRealTargets(event.targetGroup).find(player => player !== owner.Id) !== undefined,
        owner.Id,
        'round',
        [PlayerPhase.PlayCardStage],
        1,
      ).length === 0
    );
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw {1} card(s) additionally?',
      this.Name,
      nations.length,
    ).extract();
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const nations = room.AlivePlayers.reduce<CharacterNationality[]>((allNations, player) => {
      if (!allNations.includes(player.Nationality)) {
        allNations.push(player.Nationality);
      }
      return allNations;
    }, []);
    await room.drawCards(nations.length, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
