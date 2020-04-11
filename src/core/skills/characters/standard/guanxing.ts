import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class GuanXing extends TriggerSkill {
  constructor() {
    super('guanxing', 'guanxing_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return PlayerPhaseStages.PrepareStage === content.toStage && owner.Id === content.playerId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const guanxingAmount = room.AlivePlayers.length >= 4 ? 5 : 3;
    const cards = room.getCards(guanxingAmount, 'top');
    const guanxingEvent: ServerEventFinder<GameEventIdentifiers.AskForPlaceCardsInDileEvent> = {
      movableCards: cards,
      top: guanxingAmount,
      bottom: guanxingAmount,
      fromId: skillUseEvent.fromId,
    };

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, guanxingEvent, skillUseEvent.fromId);

    const { top, bottom } = await room.onReceivingAsyncReponseFrom(
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

    return true;
  }
}
