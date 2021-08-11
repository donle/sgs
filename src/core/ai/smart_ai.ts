import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
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
import { installActiveSkillTriggers, installTriggerskillTriggers, installViewAskillTriggers } from './skills/install';

export class SmartAI extends PlayerAI {
  private constructor() {
    super();

    installViewAskillTriggers();
    installTriggerskillTriggers();
    installActiveSkillTriggers();
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

    const skills = from.getSkills<ActiveSkill>('active');
    const cards = AiLibrary.sortCardsUsePriority(room, from);
    const actionItems = AiLibrary.sortCardAndSkillUsePriority(room, from, skills, cards);

    for (const item of actionItems) {
      if (item instanceof ActiveSkill) {
        const useSkill = AiSkillTrigger.fireActiveSkill<GameEventIdentifiers.SkillUseEvent>(room, from, item);
        if (useSkill) {
          const useSkillEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
            fromId,
            end: false,
            eventName: GameEventIdentifiers.SkillUseEvent,
            event: useSkill,
          };

          return useSkillEvent;
        }
      } else {
        const card = Sanguosha.getCardById(item);
        const cardSkill = card.Skill as ActiveSkill;

        if (AiSkillTrigger.getActiveSkillTrigger(cardSkill)?.reforgeTrigger(room, from, cardSkill, item)) {
          const reforgeEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
            fromId,
            end: false,
            eventName: GameEventIdentifiers.ReforgeEvent,
            event: {
              cardId: item,
              fromId,
            },
          };

          return reforgeEvent;
        }

        if (!from.canUseCard(room, item)) {
          continue;
        }

        if (card.BaseType === CardType.Equip) {
          if (from.getEquipment((card as EquipCard).EquipType) === undefined) {
            const equipCardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
              fromId: from.Id,
              cardId: item,
            };

            const equipUse: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
              fromId: from.Id,
              eventName: GameEventIdentifiers.CardUseEvent,
              end: false,
              event: equipCardUseEvent,
            };
            return equipUse;
          } else {
            continue;
          }
        }

        const useCard = AiSkillTrigger.fireActiveSkill<GameEventIdentifiers.CardUseEvent>(room, from, cardSkill, item)
        if (useCard) {
          const useCardEvent: ClientEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent> = {
            fromId,
            end: false,
            eventName: GameEventIdentifiers.CardUseEvent,
            event: useCard,
          };

          return useCardEvent;
        }
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
      const triggerEvent = AiSkillTrigger.fireTriggerSkill(
        room,
        from,
        from.getSkills<TriggerSkill>('trigger').find(skill => skill.Name === skillName)!,
        triggeredOnEvent,
      );
      if (triggerEvent) {
        return triggerEvent;
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

    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForCardResponseEvent?.(content, room, availableCards);
      if (response) {
        return response;
      }
    }

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
    let availableCards = AiLibrary.findCardsByMatcher(room, toPlayer, new CardMatcher(cardMatcher)).filter(cardId =>
      toPlayer.canUseCard(room, cardId),
    );
    for (const skill of toPlayer.getSkills<FilterSkill>('filter')) {
      availableCards = availableCards.filter(cardId => skill.canUseCard(cardId, room, toPlayer.Id));
    }

    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForCardUseEvent?.(content, room, availableCards);
      if (response) {
        return response;
      }
    }

    if (EventPacker.isUncancellabelEvent(content)) {
      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: availableCards.length > 0 ? AiLibrary.sortCardbyValue(availableCards)[0] : undefined,
        toIds: content.scopedTargets,
      };
      return cardResponse;
    } else {
      let cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = { fromId: toId };
      const cardIds = AiLibrary.askAiUseCard(
        room,
        toId,
        availableCards,
        cardMatcher,
        content.byCardId,
        content.cardUserId,
      );
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
    const availableCards = fromArea.reduce<CardId[]>((savedCards, area) => {
      for (const card of to.getCardIds(area)) {
        if (!to.getSkills<FilterSkill>('filter').find(skill => skill.canDropCard(card, room, toId) === false)) {
          savedCards.push(card);
        }
      }

      return savedCards;
    }, []);

    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForCardDropEvent?.(content, room, availableCards);
      if (response) {
        return response;
      }
    }

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

    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForCardDisplayEvent?.(content, room, handCards);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForCardEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForPinDianCardEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForChoosingCardEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForChoosingPlayerEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForChoosingOptionsEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForChoosingCharacterEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForChoosingCardFromPlayerEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    for (const skillName of content.triggeredBySkills || []) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForPlaceCardsInDileEvent?.(content, room);
      if (response) {
        return response;
      }
    }

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
    const { toId, cardIds, selected, triggeredBySkills } = content;
    for (const skillName of triggeredBySkills!) {
      const skillTrigger = AiSkillTrigger.getSkillTrigger(skillName)!;
      const response = skillTrigger.onAskForContinuouslyChoosingCardEvent?.(content, room);
      if (response) {
        return response;
      }
    }

    const selectedCard = cardIds.find(cardId => !selected.find(selectCard => selectCard.card === cardId))!;
    const chooseCard: ClientEventFinder<T> = {
      selectedCard,
      fromId: toId,
    };

    return chooseCard;
  }
}
