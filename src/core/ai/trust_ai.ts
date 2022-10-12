import { PlayerAI } from './ai';
import { AiLibrary } from './ai_lib';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';

export class TrustAI extends PlayerAI {
  public static get Instance() {
    if (!this.instance) {
      this.instance = new TrustAI();
    }

    return this.instance;
  }

  protected onAskForPlayCardsOrSkillsEvent<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId: fromId } = content as ServerEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>;
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
    if (!EventPacker.isUncancellableEvent(content)) {
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
    // const logs: string =
    //   `AskForCardResponseEvent, ask Card ${content.cardMatcher.name} or ${content.cardMatcher.generalName} ` +
    //   (content !== undefined && content!.byCardId !== undefined
    //     ? `for Reponse ${Sanguosha.getCardById(content!.byCardId).Name}`
    //     : '');

    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>;
    if (EventPacker.isUncancellableEvent(content)) {
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
      let cardId: CardId | undefined;
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
    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;

    const toPlayer = room.getPlayerById(toId);
    const availableCards = AiLibrary.findAvailableCardsToUse(room, toPlayer, new CardMatcher(cardMatcher));

    if (EventPacker.isUncancellableEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: availableCards[0],
      };
      return cardResponse;
    } else {
      let cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = { fromId: toId };
      const cardIds = AiLibrary.askAiUseCard(room, toId, availableCards, cardMatcher, content!.byCardId);
      if (cardIds.length > 0) {
        const responseCardId = cardIds.sort(
          (a, b) => AiLibrary.getCardValueofCard(a).value - AiLibrary.getCardValueofCard(b).value,
        )[0];
        cardResponse = {
          cardId: responseCardId,
          fromId: toId,
          toIds: content.scopedTargets,
        };
      }

      return cardResponse;
    }
  }

  protected onAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId, cardAmount, fromArea, except } =
      content as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
    const to = room.getPlayerById(toId);
    const cardDrop: ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
      fromId: toId,
      droppedCards: [],
    };

    if (EventPacker.isUncancellableEvent(content) || content.triggeredBySkills !== undefined) {
      let cards = fromArea.reduce<CardId[]>(
        (allCards, area) => [...allCards, ...to.getCardIds(area).filter(cardId => !except?.includes(cardId))],
        [],
      );

      if (cards.length === 0) {
        return cardDrop;
      }

      const holdAmount = cards.length - (cardAmount instanceof Array ? cardAmount[0] : cardAmount);
      cards = AiLibrary.sortCardbyValue(cards);
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
    const { cardAmount, cardAmountRange, cardMatcher, toId, fromArea } = content;
    const amount = cardAmount || (cardAmountRange && cardAmountRange[0]);
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
      .slice(0, amount);
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
    const { cardIds, cardMatcher, toId, amount, customCardFields } = content;

    let selectedCardIndex: number[] | undefined;
    let selectedCards: CardId[] | undefined;

    if (cardIds !== undefined) {
      selectedCardIndex = typeof cardIds === 'number' ? new Array(amount).fill(0).map((_, index) => index) : undefined;
      selectedCards =
        cardIds instanceof Array
          ? cardIds
              .filter(cardId => (cardMatcher ? CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) : cardId))
              .slice(0, amount)
          : undefined;
    } else if (customCardFields !== undefined) {
      let avaliableCards: CardId[] | undefined = [];
      for (const cards of Object.values(customCardFields)) {
        if (cards instanceof Array) {
          avaliableCards = avaliableCards.concat([...cards]);
        }
      }

      selectedCards = avaliableCards
        .filter(cardId => (cardMatcher ? CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) : cardId))
        .slice(0, amount);
    }

    const chooseCard: ClientEventFinder<T> = {
      fromId: toId,
      selectedCardIndex,
      selectedCards,
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

    if (!EventPacker.isUncancellableEvent(content)) {
      const chooseCard: ClientEventFinder<T> = {
        fromId,
      };
      return chooseCard;
    }
    const chooseCard = AiLibrary.askAiChooseCardFromPlayer(room, fromId, toId, options);
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

  protected onAskForChoosingCardWithConditionsEvent<
    T extends GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  >(content: ServerEventFinder<T>, room: Room): ClientEventFinder<T> {
    const { amount, customCardFields, cardIds, cardFilter, involvedTargets, triggeredBySkills } = content;

    for (const skillName of triggeredBySkills!) {
      const skill = Sanguosha.getSkillBySkillName(skillName);
      const aiSkill = skill.tryToCallAiTrigger();

      const response = aiSkill?.onAskForChoosingCardWithConditionsEvent?.(content, room);
      if (response) {
        return response;
      }
    }

    if (!EventPacker.isUncancellableEvent(content)) {
      return {
        fromId: content.toId,
      };
    }

    const selectedCards: CardId[] = [];
    let selectedCardsIndex: number[] = [];
    const cardAmount = amount instanceof Array ? amount[0] : amount;

    if (cardIds !== undefined) {
      if (cardIds instanceof Array) {
        selectedCards.push(...cardIds.slice(0, cardAmount));
      } else {
        selectedCardsIndex = Array.from(Array(cardAmount).keys());
      }
    } else if (cardFilter !== undefined) {
      const matcher = System.AskForChoosingCardEventFilters[cardFilter];
      const allCards: CardId[] = [];
      for (const cards of Object.values(customCardFields!)) {
        if (cards instanceof Array) {
          allCards.push(...cards);
        }
      }

      for (const cards of Object.values(customCardFields!)) {
        if (cards instanceof Array) {
          for (const card of cards) {
            if (cardAmount && selectedCardsIndex.length + selectedCards.length === cardAmount) {
              break;
            }
            if (
              !matcher(
                allCards,
                selectedCards,
                card,
                involvedTargets?.map(target => room.getPlayerById(target)),
              )
            ) {
              selectedCards.push(card);
            }
          }
        } else {
          selectedCardsIndex.push(...Array.from(Array(cardAmount).keys()).map(id => id + selectedCardsIndex.length));
        }
      }
    }

    return {
      fromId: content.toId,
      selectedCards,
      selectedCardsIndex,
    };
  }
}
