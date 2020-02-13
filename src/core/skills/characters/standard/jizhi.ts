import { CardType } from 'core/cards/card';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { CardUseStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class JiZhi extends TriggerSkill {
  constructor() {
    super('jizhi', 'jizhi_description');
  }

  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    stage: CardUseStage,
  ) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    const card = Sanguosha.getCardById(content.cardId);
    return (
      content.fromId === owner.Id &&
      card.is(CardType.Trick) &&
      !card.is(CardType.DelayedTrick)
    );
  }

  async onTrigger(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const cardId = (await room.drawCards(1, event.fromId))[0];
    if (Sanguosha.getCardById(cardId).is(CardType.Basic)) {
      const askForOptionsEvent = EventPacker.createUncancellableEvent<
        GameEventIdentifiers.AskForChooseOptionsEvent
      >({
        options: ['discard', 'keep'],
        fromId: event.fromId,
        translationsMessage: TranslationPack.translationJsonPatcher(
          'do you wanna discard ${0}',
          TranslationPack.patchCardInTranslation(cardId),
        ),
      });

      room.notify(
        GameEventIdentifiers.AskForChooseOptionsEvent,
        EventPacker.createIdentifierEvent(
          GameEventIdentifiers.AskForChooseOptionsEvent,
          askForOptionsEvent,
        ),
        event.fromId,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChooseOptionsEvent,
        event.fromId,
      );

      if (response.selectedOption === 'discard') {
        await room.dropCards([cardId], event.fromId);
        room.syncGameCommonRules(event.fromId, user => {
          GameCommonRules.addAdditionalHoldCardNumber(user, 1);
          user.addInvisibleMark(this.name, 1);
        });
      }
    }

    return true;
  }

  onPhaseChange(
    fromPhase: PlayerPhase,
    toPhase: PlayerPhase,
    room: Room,
    owner: PlayerId,
  ) {
    if (fromPhase === PlayerPhase.FinishStage) {
      room.syncGameCommonRules(owner, user => {
        const extraHold = user.getInvisibleMark(this.name);
        user.removeInvisibleMark(this.name);
        GameCommonRules.addAdditionalHoldCardNumber(user, -extraHold);
      });
    }
  }
}
