import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardLostReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class GuiCai extends TriggerSkill {
  constructor() {
    super('guicai', 'guicai_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.BeforeJudgeEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return true;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
    const askForJudgeCardEvent: ServerEventFinder<GameEventIdentifiers.AskForCardEvent> = {
      cardMatcher: new CardMatcher({}).toSocketPassenger(),
      toId: skillUseEvent.fromId,
      cardAmount: 1,
      reason: this.name,
      fromArea: [PlayerCardsArea.HandArea],
      conversation: TranslationPack.translationJsonPatcher(
        'please response a card to replace judge card {0} from {1}',
        TranslationPack.patchCardInTranslation(judgeEvent.judgeCardId),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(judgeEvent.toId)),
      ).extract(),
    };

    room.notify(GameEventIdentifiers.AskForCardEvent, askForJudgeCardEvent, skillUseEvent.fromId);
    const { selectedCards } = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForCardEvent,
      skillUseEvent.fromId,
    );

    if (selectedCards.length > 0) {
      await room.loseCards({
        cardIds: selectedCards,
        reason: CardLostReason.CardResponse,
        fromId: skillUseEvent.fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} responsed card {1} to replace judge card {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
          TranslationPack.patchCardInTranslation(selectedCards[0]),
          TranslationPack.patchCardInTranslation(judgeEvent.judgeCardId),
        ).extract(),
      });
      judgeEvent.judgeCardId = selectedCards[0];
    }

    return true;
  }
}
