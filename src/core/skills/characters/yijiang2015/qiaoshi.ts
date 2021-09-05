import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiaoshi', description: 'qiaoshi_description' })
export class QiaoShi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id !== event.playerId &&
      event.toStage === PlayerPhaseStages.PhaseFinishStart &&
      room.getPlayerById(event.playerId).getCardIds(PlayerCardsArea.HandArea).length ===
        owner.getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw a card with {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.playerId)),
    ).extract();
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.animation = [
      {
        from: event.fromId,
        tos: [(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId],
      },
    ];

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(
      1,
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId,
      'top',
      event.fromId,
      this.Name,
    );

    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
