import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardOrSkillInnerEvent } from 'core/event/event.client';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea, PlayerId, PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, FilterSkill, TriggerSkill } from 'core/skills/skill';
import { PlayerAI } from './ai';
import { AiLibrary } from './ai_lib';
import { AiSkillTrigger } from './ai_skill_trigger';

export class SmartAI extends PlayerAI {
  private constructor() {
    super();
  }

  public static get Instance() {
    if (!this.instance) {
      PlayerAI.instance = new SmartAI();
    }

    return PlayerAI.instance;
  }

  protected onAskForPlayCardsOrSkillsEvent<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId: fromId } = content as ServerEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>;
    const from = room.getPlayerById(fromId);

    const skills = from.getPlayerSkills<ActiveSkill>('active');
    for (const skill of skills) {
      const useSkill = AiSkillTrigger.fireActiveSkill(room, from, skill);
      if (useSkill) {
        const useSkillEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
          fromId,
          end: false,
          eventName: GameEventIdentifiers.SkillUseEvent,
          event: useSkill,
        };

        return useSkillEvent;
      }
    }

    const cardUseEvent: PlayerCardOrSkillInnerEvent | undefined = AiLibrary.aiUseCard(room, from);
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
    const { invokeSkillNames, toId, triggeredOnEvent } = content as ServerEventFinder<
      GameEventIdentifiers.AskForSkillUseEvent
    >;
    if (!EventPacker.isUncancellabelEvent(content)) {
      const skillUse: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
        invoke: invokeSkillNames !== undefined && invokeSkillNames[0] !== undefined ? invokeSkillNames[0] : undefined,
        fromId: toId,
      };
      return skillUse;
    }

    const from = room.getPlayerById(toId);
    for (const skillName of invokeSkillNames) {
      if (
        AiSkillTrigger.fireTriggerSkill(
          room,
          from,
          from.getSkills<TriggerSkill>('trigger').find(skill => skill.Name === skillName)!,
          triggeredOnEvent,
        )
      ) {
        return {
          fromId: toId,
          invoke: skillName,
        };
      }
    }

    const skillUse: ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
      fromId: toId,
    };
    return skillUse;
  }

  protected onAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId, cardMatcher, byCardId, cardUserId } = content as ServerEventFinder<
      GameEventIdentifiers.AskForCardResponseEvent
    >;
    const toPlayer = room.getPlayerById(toId);
    const availableCards = AiLibrary.findAvailableCardsToResponse(
      room,
      toPlayer,
      content,
      new CardMatcher(cardMatcher),
    );

    if (EventPacker.isUncancellabelEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        fromId: toId,
        cardId: availableCards.length > 0 ? AiLibrary.sortCardbyValue(availableCards)[0] : undefined,
      };

      return cardResponse;
    } else {
      let cardId: CardId | undefined = availableCards[0];
      if (
        CardMatcher.match(cardMatcher, new CardMatcher({ name: ['jink'] })) &&
        !AiLibrary.shouldUseJink(room, toPlayer, availableCards, byCardId, cardUserId)
      ) {
        cardId = undefined;
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

    if (EventPacker.isUncancellabelEvent(content)) {
      let availableCards = AiLibrary.findCardsByMatcher(room, toPlayer, new CardMatcher(cardMatcher)).filter(cardId =>
        toPlayer.canUseCard(room, cardId),
      );

      for (const skill of toPlayer.getSkills<FilterSkill>('filter')) {
        availableCards = availableCards.filter(cardId => skill.canUseCard(cardId, room, toPlayer.Id));
      }

      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: availableCards.length > 0 ? AiLibrary.sortCardbyValue(availableCards)[0] : undefined,
        toIds: content.scopedTargets,
      };
      return cardResponse;
    } else {
      let cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = { fromId: toId };
      const cardIds = AiLibrary.askAiUseCard(room, toId, cardMatcher, content.byCardId, content.cardUserId);
      if (cardIds.length > 0) {
        cardResponse = {
          cardId: AiLibrary.sortCardbyValue(cardIds)[0],
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
    const { toId, cardAmount, fromArea, except } = content as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent
    >;
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
      cards = AiLibrary.sortCardbyValue(cards);
      cardDrop.droppedCards = cards.slice(holdAmount);
    }
    return cardDrop;
  }

  protected onAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { fromId, toId } = content;
    const selfRescue = fromId === toId;
    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toId);
    if (!AiLibrary.areTheyFriendly(from, to, room.Info.gameMode)) {
      return {
        fromId: content.toId,
      };
    }

    const rescueCards = AiLibrary.findCardsByMatcher(
      room,
      from,
      new CardMatcher({ generalName: selfRescue ? ['alcohol', 'peach'] : ['peach'] }),
    );
    const alcoholCard = rescueCards.find(cardId => Sanguosha.getCardById(cardId).GeneralName === 'alcohol');

    const usePeach: ClientEventFinder<T> = {
      fromId: content.toId,
      cardId: alcoholCard || rescueCards[0],
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

    if (!EventPacker.isUncancellabelEvent(content)) {
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
}
