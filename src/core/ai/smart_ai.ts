import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardOrSkillInnerEvent } from 'core/event/event.client';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GameMode } from 'core/shares/types/room_props';
import { ActiveSkill, FilterSkill } from 'core/skills/skill';
import { PlayerAI } from './ai';
import { AiLibrary } from './ai_lib';

export class SmartAI extends PlayerAI {
  constructor(private gameMode: GameMode) {
    super();
  }

  private aiUseCard(room: Room, from: Player): PlayerCardOrSkillInnerEvent | undefined {
    const handCards = AiLibrary.sortCardsUsePriority(room, from);

    if (handCards.length > 0) {
      for (const cardId of handCards) {
        const card = Sanguosha.getCardById(cardId);
        if (card.BaseType === CardType.Equip) {
          const equipCardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
            fromId: from.Id,
            cardId,
          };
          return {
            eventName: GameEventIdentifiers.CardUseEvent,
            event: equipCardUseEvent,
          };
        }

        // console.log(`AI consider to use card: ${Sanguosha.getCardById(cardId).Name}`);

        const cardSkill = card.Skill;
        if (cardSkill instanceof ActiveSkill) {
          if (cardSkill.GeneralName === 'jiedaosharen') {
            continue;
          }

          const targetNumber: number =
            cardSkill.numberOfTargets() instanceof Array ? cardSkill.numberOfTargets()[0] : cardSkill.numberOfTargets();

          if (cardSkill.GeneralName === 'tiesuolianhuan') {
            const reforgeEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
              fromId: from.Id,
              cardId,
            };

            return {
              eventName: GameEventIdentifiers.ReforgeEvent,
              event: reforgeEvent,
            };
          }

          let targetPlayer: PlayerId[] | undefined;
          if (targetNumber !== 0) {
            const approvedTargetPlayerIds = this.sortEnemiesByRole(room, from)
              .filter(player => cardSkill.isAvailableTarget(from.Id, room, player.Id, [], [], cardId))
              .map(player => player.Id);

            // console.log(`approvedTargetPlayerIds is ${approvedTargetPlayerIds}`);

            if (approvedTargetPlayerIds.length < targetNumber) {
              continue;
            } else {
              targetPlayer = approvedTargetPlayerIds.slice(-targetNumber);
            }
          } else if (!cardSkill.canUse(room, from, cardId)) {
            // handle lightning
            continue;
          } else {
            if (card.Name === 'alcohol' && !from.canUseCard(room, new CardMatcher({ generalName: ['slash'] }))) {
              continue;
            }
          }

          const cardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
            fromId: from.Id,
            cardId,
            toIds: targetPlayer,
          };

          return {
            eventName: GameEventIdentifiers.CardUseEvent,
            event: cardUseEvent,
          };
        }
      }
    }

    return undefined;
  }

  private sortEnemiesByRole(room: Room, from: Player) {
    let enemies = room.getOtherPlayers(from.Id).filter(other => !this.areTheyFriendly(other, from));

    if (from.Role === PlayerRole.Renegade) {
      enemies = enemies.filter(enemy => enemy.Role === PlayerRole.Lord);
    }

    return enemies.sort((enemyA, enemyB) => {
      const defenseValueA = AiLibrary.getPlayerRelativeDefenseValue(from, enemyA);
      const defenseValueB = AiLibrary.getPlayerRelativeDefenseValue(from, enemyB);

      if (defenseValueA < defenseValueB) {
        return -1;
      } else if (defenseValueA === defenseValueB) {
        return 0;
      }

      return 1;
    });
  }

  private areTheyFriendly(playerA: Player, playerB: Player) {
    if (this.gameMode !== GameMode.Hegemony && playerA.Role === playerB.Role) {
      return true;
    }

    switch (this.gameMode) {
      case GameMode.Pve:
      case GameMode.OneVersusTwo: {
        if (playerA.Role === PlayerRole.Lord || playerB.Role === PlayerRole.Lord) {
          return false;
        }

        return true;
      }
      case GameMode.TwoVersusTwo: {
        return playerA.Role === playerB.Role;
      }
      case GameMode.Standard: {
        if (playerA.Role === PlayerRole.Lord || playerA.Role === PlayerRole.Loyalist) {
          return playerB.Role === PlayerRole.Lord || playerB.Role === PlayerRole.Loyalist;
        } else if (playerA.Role === PlayerRole.Rebel || playerA.Role === PlayerRole.Renegade) {
          return playerB.Role === PlayerRole.Rebel || playerB.Role === PlayerRole.Renegade;
        }
      }
      case GameMode.Hegemony: {
        return playerA.Nationality === playerB.Nationality;
      }
      default:
        return false;
    }
  }

  protected onAskForPlayCardsOrSkillsEvent<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    content: ServerEventFinder<T>,
    room: Room,
  ) {
    const { toId: fromId } = content as ServerEventFinder<GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>;
    const from = room.getPlayerById(fromId);

    const cardUseEvent: PlayerCardOrSkillInnerEvent | undefined = this.aiUseCard(room, from);
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
    // const logs: string =
    //   `AskForCardResponseEvent, ask Card ${content.cardMatcher.name} or ${content.cardMatcher.generalName} ` +
    //   (content !== undefined && content!.byCardId !== undefined
    //     ? `for Reponse ${Sanguosha.getCardById(content!.byCardId).Name}`
    //     : '');

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
    // const logs: string =
    //   `AskForCardUseEvent, ask Card ${content.cardMatcher.name} ` +
    //   (content !== undefined && content!.byCardId !== undefined
    //     ? `for Reponse ${Sanguosha.getCardById(content!.byCardId).Name}`
    //     : '');

    const { toId, cardMatcher } = content as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
    const toPlayer = room.getPlayerById(toId);

    if (EventPacker.isUncancellabelEvent(content)) {
      let availableCards = AiLibrary.findCardsByMatcher(toPlayer, new CardMatcher(cardMatcher)).filter(cardId =>
        toPlayer.canUseCard(room, cardId),
      );

      for (const skill of toPlayer.getSkills<FilterSkill>('filter')) {
        availableCards = availableCards.filter(cardId => skill.canUseCard(cardId, room, toPlayer.Id));
      }

      const cardResponse: ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
        fromId: toId,
        cardId: availableCards.length > 0 ? AiLibrary.sortCardbyValue(availableCards)[0] : undefined,
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
    // const logs: string =
    //   `AskForCardDropEvent, ask ExceptCard: ${content.except}, Amount: ${content.cardAmount} ` +
    //   (content !== undefined && content!.triggeredBySkills !== undefined
    //     ? `for Reponse ${content!.triggeredBySkills}`
    //     : '');

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
    if (!this.areTheyFriendly(from, to)) {
      return {
        fromId: content.toId,
      };
    }

    const rescueCards = AiLibrary.findCardsByMatcher(
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
