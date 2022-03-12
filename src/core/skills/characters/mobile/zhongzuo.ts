import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhongzuo', description: 'zhongzuo_description' })
export class ZhongZuo extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event =>
          EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent &&
          (event.fromId === owner.Id || event.toId === owner.Id),
        undefined,
        'round',
        undefined,
        1,
      ).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to draw 2 cards? If he is wounded, you draw 1 card',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    await room.drawCards(2, event.toIds[0], 'top', event.toIds[0], this.Name);

    room.getPlayerById(event.toIds[0]).LostHp > 0 &&
      (await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name));

    return true;
  }
}
