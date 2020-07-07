import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guanxing', description: 'guanxing_description' })
export class GuanXing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (
      owner.Id !== content.playerId ||
      ![PlayerPhaseStages.PrepareStage, PlayerPhaseStages.FinishStage].includes(content.toStage)
    ) {
      return false;
    }

    if (content.toStage === PlayerPhaseStages.FinishStage) {
      if (owner.getInvisibleMark(this.Name) === 0) {
        return false;
      } else {
        owner.removeInvisibleMark(this.Name);
        return true;
      }
    }

    return true;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const guanxingAmount = room.AlivePlayers.length >= 4 ? 5 : 3;
    const cards = room.getCards(guanxingAmount, 'top');
    const guanxingEvent: ServerEventFinder<GameEventIdentifiers.AskForPlaceCardsInDileEvent> = {
      cardIds: cards,
      top: guanxingAmount,
      topStackName: 'draw stack top',
      bottom: guanxingAmount,
      bottomStackName: 'draw stack bottom',
      toId: skillUseEvent.fromId,
      movable: true,
      triggeredBySkills: [this.Name],
    };

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, guanxingEvent, skillUseEvent.fromId);

    const { top, bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      skillUseEvent.fromId,
    );

    room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      translationsMessage: TranslationPack.translationJsonPatcher(
        'guanxing finished, {0} cards placed on the top and {1} cards placed at the bottom',
        top.length,
        bottom.length,
      ).extract(),
    });

    room.putCards('top', ...top);
    room.putCards('bottom', ...bottom);

    if (top.length === 0 && room.CurrentPlayerPhase === PlayerPhase.PrepareStage) {
      room.getPlayerById(skillUseEvent.fromId).addInvisibleMark(this.Name, 1);
    }

    return true;
  }
}
