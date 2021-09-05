import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { QiZhi } from './qizhi';

@CommonSkill({ name: 'jinqu', description: 'jinqu_description' })
export class JinQu extends TriggerSkill {
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to draw 2 cards, then keep {1} hand cards?',
      this.Name,
      owner.hasUsedSkillTimes(QiZhi.Name),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);

    await room.drawCards(2, fromId, 'top', fromId, this.Name);

    const dropNum = from.getCardIds(PlayerCardsArea.HandArea).length - from.hasUsedSkillTimes(QiZhi.Name);
    if (dropNum > 0) {
      const response = await room.askForCardDrop(
        fromId,
        dropNum,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.Name,
      );
      if (!response) {
        return false;
      }

      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, fromId, fromId, this.Name);
    }

    return true;
  }
}
