import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { PlayerAI } from './ai';
import { aiUseCard, askAiUseCard, askAiChooseCardFromPlayer, sortCardbyValue } from './ai_lib';
import { getCardValueofCard } from './ai_standard';
import { PlayerCardOrSkillInnerEvent } from 'core/event/event.client';

export class TrustAI extends PlayerAI {
  public static get Instance() {
    if (!this.instance) {
      PlayerAI.instance = new TrustAI();
    }

    return PlayerAI.instance;
  }

  protected onAskForPlayCardsOrSkillsEvent<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId: fromId } = content as ServerEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>;

    const cardUseEvent: PlayerCardOrSkillInnerEvent | undefined = aiUseCard(room, fromId);
    if (cardUseEvent !== undefined) {
      const endEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId,
        end: false,
        ...cardUseEvent,
      };

      return endEvent;
    }

    const endEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
      fromId,
      end: true,
    };
    return endEvent;
  }

  protected onAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { invokeSkillNames, toId } = content as ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent>;
    console.log(`AskForSkillUseEvent, Ask AI For Use Skill: ${invokeSkillNames}`);
    if (!EventPacker.isUncancellabelEvent(content)) {
      const skillUse: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
        invoke: invokeSkillNames !== undefined && invokeSkillNames[0] !== undefined ? invokeSkillNames[0] : undefined,
        fromId: toId,
      };
      return skillUse;
    }

    const skillUse: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      fromId: toId,
      invoke: invokeSkillNames[0],
    };
    return skillUse;
  }

  protected onAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const logs: string =
      `AskForCardResponseEvent, ask Card ${content.cardMatcher.name} or ${content.cardMatcher.generalName} ` +
      (content !== undefined && content!.byCardId !== undefined
        ? `for Reponse ${Sanguosha.getCardById(content!.byCardId).Name}`
        : '');
    console.log(logs);

    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;
    if (EventPacker.isUncancellabelEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: toId,
        cardId: room
          .getPlayerById(toId)
          .getCardIds(PlayerCardsArea.HandArea)
          .find(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId))),
      };
      return cardResponse;
    } else {
      // just handle nanmanruqin and duel, not enough for another judge
      let cardId: CardId | undefined = undefined;
      if (cardMatcher.generalName && cardMatcher.generalName.includes('slash')) {
        cardId = room
          .getPlayerById(toId)
          .getCardIds(PlayerCardsArea.HandArea)
          .find(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)));
      }
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: toId,
        cardId,
      };
      return cardResponse;
    }
  }

  protected onAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const logs: string =
      `AskForCardUseEvent, ask Card ${content.cardMatcher.name} ` +
      (content !== undefined && content!.byCardId !== undefined
        ? `for Reponse ${Sanguosha.getCardById(content!.byCardId).Name}`
        : '');
    console.log(logs);

    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;

    const toPlayer = room.getPlayerById(toId);
    if (EventPacker.isUncancellabelEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: toPlayer
          .getCardIds(PlayerCardsArea.HandArea)
          .find(
            cardId =>
              CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) && toPlayer.canUseCard(room, cardId),
          ),
      };
      return cardResponse;
    } else {
      let cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = { fromId: toId };
      const cardIds = askAiUseCard(room, toId, cardMatcher, content!.byCardId);
      if (cardIds.length > 0) {
        console.log(`there are cards match this reponse: ${cardIds}`);
        const responseCardId = cardIds.sort((a, b) => getCardValueofCard(a).value - getCardValueofCard(b).value)[0];
        cardResponse = {
          cardId: responseCardId,
          fromId: toId,
          toIds: content.scopedTargets,
        };
      } else {
        console.log(`there are not cards match this reponse`);
      }

      return cardResponse;
    }
  }

  protected onAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const logs: string =
      `AskForCardDropEvent, ask ExceptCard: ${content.except}, Amount: ${content.cardAmount} ` +
      (content !== undefined && content!.triggeredBySkills !== undefined
        ? `for Reponse ${content!.triggeredBySkills}`
        : '');
    console.log(logs);

    const { toId, cardAmount, fromArea, except } =
      content as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const to = room.getPlayerById(toId);
    const cardDrop: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromId: toId,
      droppedCards: [],
    };

    if (EventPacker.isUncancellabelEvent(content) || content.triggeredBySkills !== undefined) {
      let cards = fromArea.reduce<CardId[]>((allCards, area) => {
        return [...allCards, ...to.getCardIds(area).filter(cardId => !except?.includes(cardId))];
      }, []);

      if (cards.length === 0) {
        return cardDrop;
      }

      const holdAmount = cards.length - (cardAmount instanceof Array ? cardAmount[0] : cardAmount);
      console.log('Hold Card Amount is ' + holdAmount);
      cards = sortCardbyValue(cards);
      cardDrop.droppedCards = cards.slice(holdAmount);
    }
    return cardDrop;
  }

  protected onAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const usePeach: ClientEventFinder<T> = {
      fromId: content.toId,
    };
    return usePeach;
  }
  protected onAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { cardAmount, cardMatcher, toId } = content;
    const to = room.getPlayerById(toId);
    const handCards = to.getCardIds(PlayerCardsArea.HandArea);
    const displayedCards =
      cardMatcher === undefined
        ? handCards.slice(0, cardAmount)
        : handCards
            .filter(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)))
            .slice(0, cardAmount);

    const displayCards: ClientEventFinder<T> = {
      fromId: toId,
      selectedCards: displayedCards,
    };

    return displayCards;
  }
  protected onAskForCardEvent<T extends GameEventIdentifiers.AskForCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { cardAmount, cardMatcher, toId, fromArea } = content;
    const to = room.getPlayerById(toId);
    const selectedCards = fromArea
      .reduce<CardId[]>((allCards, area) => {
        if (cardMatcher) {
          allCards.push(
            ...to.getCardIds(area).filter(card => CardMatcher.match(cardMatcher, Sanguosha.getCardById(card))),
          );
        } else {
          allCards.push(...to.getCardIds(area));
        }
        return allCards;
      }, [])
      .slice(0, cardAmount);
    const selectCard: ClientEventFinder<GameEventIdentifiers.AskForCardEvent> = {
      fromId: toId,
      selectedCards,
    };
    return selectCard;
  }
  protected onAskForPinDianCardEvent<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const pindianEvent: ClientEventFinder<T> = {
      fromId: content.toId,
      pindianCard: room.getPlayerById(content.toId).getCardIds(PlayerCardsArea.HandArea)[0],
    };

    return pindianEvent;
  }

  protected onAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    console.log(`AskForChoosingCardEvent, ask for choose ${content.amount} card from cardIds or customCardFields`);

    const { cardIds, cardMatcher, toId, amount, customCardFields } = content;

    let selectedCardIndex: number[] | undefined = undefined;
    let selectedCards: CardId[] | undefined = undefined;

    if (cardIds !== undefined) {
      console.log(`cardIds is ${cardIds}`);
      selectedCardIndex = typeof cardIds === 'number' ? new Array(amount).fill(0).map((_, index) => index) : undefined;
      selectedCards =
        cardIds instanceof Array
          ? cardIds
              .filter(cardId => (cardMatcher ? CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) : cardId))
              .slice(0, amount)
          : undefined;
    } else if (customCardFields !== undefined) {
      console.log(`customCardFields is ${Object.entries(customCardFields)}`);
      let avaliableCards: CardId[] | undefined = [];
      for (const cards of Object.values(customCardFields)) {
        if (cards instanceof Array) {
          avaliableCards = avaliableCards.concat([...cards]);
        }
      }

      console.log(`avaliableCards is ${avaliableCards}`);

      selectedCards = avaliableCards
        .filter(cardId => (cardMatcher ? CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) : cardId))
        .slice(0, amount);

      console.log(`selectedCards is ${selectedCards}`);
    }

    const chooseCard: ClientEventFinder<T> = {
      fromId: toId,
      selectedCardIndex,
      selectedCards,
    };

    console.log(
      `Reponse AskForChoosingCardEvent: fromId: ${chooseCard.fromId}, selectedCardIndex: ${chooseCard.selectedCardsIndex}, selectedCards: ${chooseCard.selectedCards}`,
    );

    return chooseCard;
  }

  protected onAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { requiredAmount, players, toId } = content;
    const amount = requiredAmount instanceof Array ? requiredAmount[0] : requiredAmount;
    const choosePlayer: ClientEventFinder<T> = {
      fromId: toId,
      selectedPlayers: players.slice(0, amount),
    };
    return choosePlayer;
  }
  protected onAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId, options } = content;
    const chooseOptions: ClientEventFinder<T> = {
      selectedOption: options[0],
      fromId: toId,
    };

    return chooseOptions;
  }
  protected onAskForChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { characterIds, toId } = content;
    const chooseCharacter: ClientEventFinder<T> = {
      chosenCharacterIds: characterIds,
      fromId: toId,
    };

    return chooseCharacter;
  }
  protected onAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { options, fromId, toId } = content;
    console.log(
      `AskForChoosingCardFromPlayerEvent, ask ${room.getPlayerById(fromId).Name} for choose card from ${
        room.getPlayerById(toId).Name
      }`,
    );

    if (!EventPacker.isUncancellabelEvent(content)) {
      const chooseCard: ClientEventFinder<T> = {
        fromId,
      };
      return chooseCard;
    }
    const chooseCard = askAiChooseCardFromPlayer(room, fromId, toId, options);
    return chooseCard;
  }

  protected onAskForPlaceCardsInDileEvent<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const placeCards: ClientEventFinder<T> = {
      top: content.cardIds.slice(0, content.top),
      bottom: content.cardIds.slice(content.top, content.top + content.bottom),
      fromId: content.toId,
    };

    return placeCards;
  }
  protected onAskForContinuouslyChoosingCardEvent<T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId, cardIds, selected } = content;
    const selectedCard = cardIds.find(cardId => !selected.find(selectCard => selectCard.card === cardId))!;
    const chooseCard: ClientEventFinder<T> = {
      selectedCard,
      fromId: toId,
    };

    return chooseCard;
  }
}
