import { EventProcessSteps, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { BiLuan, BiLuanDistance } from './biluan';

@CompulsorySkill({ name: 'lixia', description: 'lixia_description' })
export class LiXia extends TriggerSkill {
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
      owner.Id !== content.playerId &&
      PlayerPhaseStages.FinishStageStart === content.toStage &&
      !room.withinAttackDistance(room.getPlayerById(content.playerId), owner)
    );
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): EventProcessSteps {
    return [
      {
        from: event.fromId,
        tos: [(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId],
      },
    ];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;

    const options = ['lixia:you', 'lixia:opponent'];
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose lixia options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(toId)),
        ).extract(),
        toId: fromId,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === options[1]) {
      await room.drawCards(2, toId, 'top', fromId, this.Name);
    } else {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    let originalDistance = room.getFlag<number>(fromId, BiLuan.Name) || 0;
    originalDistance -= 1;
    room.setFlag<number>(
      fromId,
      BiLuan.Name,
      originalDistance,
      originalDistance !== 0
        ? TranslationPack.translationJsonPatcher(
            originalDistance > 0 ? 'distance buff: {0}' : 'distance debuff: {0}',
            originalDistance,
          ).toString()
        : undefined,
    );

    room.getPlayerById(fromId).hasShadowSkill(BiLuanDistance.Name) ||
      (await room.obtainSkill(fromId, BiLuanDistance.Name));

    return true;
  }
}
