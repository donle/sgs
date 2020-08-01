import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'gongxin', description: 'gongxin_description' })
export class GongXin extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    const from = room.getPlayerById(fromId);
    const handCards = to.getCardIds(PlayerCardsArea.HandArea);

    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: fromId,
      cardIds: handCards,
      cardMatcher: new CardMatcher({ suit: [CardSuit.Heart] }).toSocketPassenger(),
      amount: 1,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForChooseCardEvent, fromId);
    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      fromId,
    );

    if (selectedCards === undefined) {
      return true;
    }

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: selectedCards,
      fromId: toIds![0],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...selectedCards),
        TranslationPack.patchPlayerInTranslation(to),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    const askForChooseOptionsEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      options: ['gongxin:dropcard', 'gongxin:putcard'],
      toId: fromId,
      conversation: 'please choose',
    };
    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForChooseOptionsEvent),
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );
    if (selectedOption === 'gongxin:putcard') {
      await room.moveCards({
        movingCards: selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: to.Id,
        moveReason: CardMoveReason.PassiveMove,
        toArea: CardMoveArea.DrawStack,
        proposer: fromId,
        movedByReason: this.Name,
      });

      room.broadcast(GameEventIdentifiers.CustomGameDialog, {
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} place card {1} from {2} on the top of draw stack',
          TranslationPack.patchPlayerInTranslation(from),
          TranslationPack.patchCardInTranslation(...selectedCards),
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
      });
    } else {
      await room.dropCards(CardMoveReason.PassiveDrop, selectedCards, to.Id, fromId, this.Name);
    }

    return true;
  }
}
