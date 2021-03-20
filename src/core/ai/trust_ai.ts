import { CardMatcher, CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { PlayerAI } from './ai';
import { Card, CardType } from 'core/cards/card';

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

    const equipCards = room
      .getPlayerById(fromId)
      .getCardIds(PlayerCardsArea.HandArea)
      .filter(cardId => Sanguosha.getCardById(cardId).BaseType === CardType.Equip);

    if (equipCards && equipCards.length > 0) {
      const equipCardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
        fromId,
        cardId: equipCards[0],
      };

      const endEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
        fromId,
        end: false,
        eventName: GameEventIdentifiers.CardUseEvent,
        event: equipCardUseEvent,
      };
      return endEvent;
    }

    const slashCards = room
      .getPlayerById(fromId)
      .getCardIds(PlayerCardsArea.HandArea)
      .filter(cardId => Sanguosha.getCardById(cardId).GeneralName === 'slash');

    const nextPlayer = room.AlivePlayers.filter(player => player.Id !== fromId)[0];

    if (slashCards && slashCards.length > 0) {
      if (room.getPlayerById(fromId).canUseCard(room, slashCards[0])) {
        const slashUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId,
          cardId: slashCards[0],
          toIds: [nextPlayer.Id],
        };

        const endEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
          fromId,
          end: false,
          eventName: GameEventIdentifiers.CardUseEvent,
          event: slashUseEvent,
        };
        return endEvent;
      }
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
    if (!EventPacker.isUncancellabelEvent(content)) {
      const skillUse: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
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
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: toId,
      };
      return cardResponse;
    }
  }

  protected onAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    console.log(`Ask For Card Use cardMatcher is ${content.cardMatcher.name}`);

    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
    if (EventPacker.isUncancellabelEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: room
          .getPlayerById(toId)
          .getCardIds(PlayerCardsArea.HandArea)
          .find(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId))),
      };
      return cardResponse;
    } else {
      let cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      if (true) {
        console.log('card matcher process');
        const cardIds = room
          .getPlayerById(toId)
          .getCardIds(PlayerCardsArea.HandArea)
          .filter(cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)));

        if (cardIds.length > 0) {
          console.log(`there are cards match this reponse: ${cardIds}`);
          const responseCardId = cardIds.sort(
            (a, b) => Sanguosha.getCardById(a).CardValue.value - Sanguosha.getCardById(b).CardValue.value,
          )[0];
          cardResponse = {
            cardId: responseCardId,
            fromId: toId,
          };
        } else {
          console.log(`there are not cards match this reponse`);

          cardResponse = {
            fromId: toId,
          };
        }
      }

      return cardResponse;
    }
  }
  protected onAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const {
      toId,
      cardAmount,
      fromArea,
      except,
    } = content as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const to = room.getPlayerById(toId);

    const cardDrop: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromId: toId,
      droppedCards: [],
    };
    if (EventPacker.isUncancellabelEvent(content)) {
      let cards = fromArea.reduce<CardId[]>((allCards, area) => {
        return [...allCards, ...to.getCardIds(area).filter(cardId => !except?.includes(cardId))];
      }, []);

      const holdAmount = cards.length - (cardAmount instanceof Array ? cardAmount[0] : cardAmount);

      console.log('Hold Card Amount is ' + holdAmount);

      let i = 0;
      let holdCardList: { cardIds: CardId[]; cardNames: [String] } = { cardIds: [], cardNames: [''] };
      let maxValueCard: Card = Sanguosha.getCardById(cards[0]);

      let maxValue: number = 0;
      while (i < holdAmount) {
        maxValue = 0;
        for (const card of cards) {
          const ActCard = Sanguosha.getCardById(card);
          const sameCardNum = holdCardList.cardNames.filter(cardName => cardName === ActCard.Name).length;

          // ActCard CardValue is undefined
          const cardValue =
            ActCard.CardValue.value === undefined ? 0 : ActCard.CardValue.value * ActCard.CardValue.wane ** sameCardNum;
          console.log(`Card ${ActCard.Name} Value: ${cardValue}`);

          if (cardValue > maxValue) {
            maxValue = cardValue;
            maxValueCard = ActCard;
          }
        }

        if (maxValueCard !== undefined) {
          console.log(`hold card ${maxValueCard.Name}, id is ${maxValueCard.Id}`);
          holdCardList.cardIds.push(maxValueCard.Id);
          holdCardList.cardNames.push(maxValueCard.Name);
          cards = cards.filter(card => card !== maxValueCard.Id);
          console.log(`cards is ${cards}`);
        }
        i++;
      }

      cardDrop.droppedCards = cards;
      // cardDrop.droppedCards = cards.slice(0, cardAmount instanceof Array ? cardAmount[0] : cardAmount);
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
    const { cardIds, cardMatcher, toId, amount } = content;
    const chooseCard: ClientEventFinder<T> = {
      fromId: toId,
      selectedCardIndex: typeof cardIds === 'number' ? new Array(amount).fill(0).map((n, index) => index) : undefined,
      selectedCards:
        cardIds instanceof Array
          ? cardIds
              .filter(cardId => (cardMatcher ? CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) : cardId))
              .slice(0, amount)
          : undefined,
    };

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
    if (!EventPacker.isUncancellabelEvent(content)) {
      const chooseCard: ClientEventFinder<T> = {
        fromId,
      };
      return chooseCard;
    }

    let fromArea: PlayerCardsArea | undefined = undefined;
    for (const demo in options) {
      const area = (demo as unknown) as PlayerCardsArea;
      if (room.getPlayerById(toId).getCardIds(area).length > 0) {
        fromArea = area;
        break;
      }
    }

    if (fromArea === undefined) {
      const chooseCard: ClientEventFinder<T> = {
        fromId,
      };
      return chooseCard;
    }

    // const fromArea = (Object.keys(options)[0] as unknown) as PlayerCardsArea;
    const cards = options[fromArea]!;
    const chooseCard: ClientEventFinder<T> = {
      fromId,
      fromArea,
      selectedCard: cards instanceof Array ? cards[0] : undefined,
      selectedCardIndex: typeof cards === 'number' ? 0 : undefined,
    };
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
