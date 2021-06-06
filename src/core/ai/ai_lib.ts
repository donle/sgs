import { Room } from 'core/room/room';
import { PlayerId, PlayerCardsArea } from 'core/player/player_props';
import { Sanguosha } from 'core/game/engine';

import { CardType } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { getCardValueofCard } from './ai_standard';
import { ActiveSkill } from 'core/skills/skill';
import { EquipCard } from 'core/cards/equip_card';
import { CardValue, CardId, CardChoosingOptions } from 'core/cards/libs/card_props';
import { PlayerCardOrSkillInnerEvent } from 'core/event/event.client';
import { CardMatcher, CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';

export function getCardValueofPlayer(room: Room, aiId: PlayerId, cardId: CardId): CardValue {
  let cardValue: CardValue = getCardValueofCard(cardId);
  const targetCard = Sanguosha.getCardById(cardId);
  if (targetCard.BaseType === CardType.Equip) {
    cardValue.priority =
      room.getPlayerById(aiId).getEquipment((targetCard as EquipCard).EquipType) === undefined
        ? cardValue.priority
        : Math.max(0, cardValue.priority - 60);
  }
  return cardValue;
}

export function aiUseCard(room: Room, aiId: PlayerId): PlayerCardOrSkillInnerEvent | undefined {
  const handCards = room
    .getPlayerById(aiId)
    .getCardIds(PlayerCardsArea.HandArea)
    .sort((a, b) => getCardValueofPlayer(room, aiId, b).priority! - getCardValueofPlayer(room, aiId, a).priority!);

  if (handCards.length > 0) {
    // console.log('Ai handle hand cards');
    for (const cardId of handCards) {
      if (!room.getPlayerById(aiId).canUseCard(room, cardId)) {
        continue;
      }

      if (Sanguosha.getCardById(cardId).BaseType === CardType.Equip) {
        const equipCardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: aiId,
          cardId: cardId,
        };
        return {
          eventName: GameEventIdentifiers.CardUseEvent,
          event: equipCardUseEvent,
        };
      }

      console.log(`AI consider to use card: ${Sanguosha.getCardById(cardId).Name}`);

      const cardSkill = Sanguosha.getCardById(cardId).Skill;
      if (cardSkill instanceof ActiveSkill) {
        if (cardSkill.GeneralName === 'jiedaosharen') {
          continue;
        }

        let targetNumber: number =
          cardSkill.numberOfTargets() instanceof Array ? cardSkill.numberOfTargets()[0] : cardSkill.numberOfTargets();

        if (cardSkill.GeneralName === 'tiesuolianhuan') {
          console.log(`tiesuolianhuan target number is ${targetNumber}`);
          const reforgeEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
            fromId: aiId,
            cardId: cardId,
          };

          return {
            eventName: GameEventIdentifiers.ReforgeEvent,
            event: reforgeEvent,
          };
        }

        let targetPlayer: PlayerId[] | undefined = undefined;
        if (targetNumber !== 0) {
          const approvedTargetPlayerIds = room.AlivePlayers.filter(player =>
            cardSkill.isAvailableTarget(aiId, room, player.Id, [], [], cardId),
          ).map(player => player.Id);

          console.log(`approvedTargetPlayerIds is ${approvedTargetPlayerIds}`);

          if (approvedTargetPlayerIds.length < targetNumber) {
            continue;
          } else {
            targetPlayer = approvedTargetPlayerIds.slice(-targetNumber);
          }
        } else if (!cardSkill.canUse(room, room.getPlayerById(aiId), cardId)) {
          // handle lightning
          continue;
        }

        const cardUseEvent: ClientEventFinder<GameEventIdentifiers.CardUseEvent> = {
          fromId: aiId,
          cardId: cardId,
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

export function askAiUseCard(
  room: Room,
  aiId: PlayerId,
  cardMatcher: CardMatcherSocketPassenger,
  byCardId: CardId | undefined,
): CardId[] {
  const aiPlayer = room.getPlayerById(aiId);
  let cardId: CardId[] = aiPlayer
    .getCardIds(PlayerCardsArea.HandArea)
    .filter(
      cardId => CardMatcher.match(cardMatcher, Sanguosha.getCardById(cardId)) && aiPlayer.canUseCard(room, cardId),
    );

  if (cardId.length === 0) {
    return cardId;
  }

  console.log(`Ai use card: ${Sanguosha.getCardById(cardId[0]).Name} by CardId: ${byCardId}`);

  if (byCardId !== undefined) {
    switch (Sanguosha.getCardById(cardId[0]).Name) {
      case 'wuxiekeji': {
        console.log('AskForUse wuxikeji Handle');
        const isDelayTrick: boolean = Sanguosha.getCardById(byCardId).is(CardType.DelayedTrick);
        const isAiPlay: boolean = room.CurrentPhasePlayer.Id === aiId;
        if ((!isAiPlay && isDelayTrick) || (!isDelayTrick && isAiPlay)) {
          cardId = [];
          break;
        }
      }
    }
  }

  return cardId;
}

export function askAiChooseCardFromPlayer<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
  room: Room,
  aiId: PlayerId,
  toId: PlayerId,
  options: CardChoosingOptions,
): ClientEventFinder<T> {
  const equipTypePriority = [
    CardType.DefenseRide,
    CardType.Armor,
    CardType.Weapon,
    CardType.OffenseRide,
    CardType.Precious,
  ];

  let selectedCard: CardId | undefined = undefined;
  let fromArea: PlayerCardsArea | undefined = undefined;
  let selectedCardIndex: number | undefined = undefined;

  const Areas = (Object.keys(options) as unknown as [PlayerCardsArea]).map(area => Number(area));
  if (Areas.includes(PlayerCardsArea.EquipArea)) {
    console.log(`ChooseCard from Player EquipArea`);
    const cardIds = options[PlayerCardsArea.EquipArea];
    if (cardIds instanceof Array && cardIds.length > 0) {
      for (const equipType of equipTypePriority) {
        const targetCardId = cardIds.filter(cardId => Sanguosha.getCardById(cardId).is(equipType));
        if (targetCardId.length > 0) {
          selectedCard = targetCardId[0];
          break;
        }
      }
    }
  } else {
    fromArea = (Object.keys(options) as unknown as [PlayerCardsArea]).find(
      area => room.getPlayerById(toId).getCardIds(area).length > 0,
    );

    if (fromArea === undefined) {
      const chooseCard: ClientEventFinder<T> = { fromId: aiId };
      return chooseCard;
    }

    const cards = options[fromArea]!;
    selectedCard = cards instanceof Array ? cards[0] : undefined;
    selectedCardIndex = typeof cards === 'number' ? 0 : undefined;
  }

  console.log(
    `Confirm ChooseCard from Player: selectedCard: ${selectedCard}, selectedCardIndex: ${selectedCardIndex}, fromArea: ${fromArea}`,
  );

  const chooseCard: ClientEventFinder<T> = {
    fromId: aiId,
    selectedCard,
    fromArea,
    selectedCardIndex,
  };

  return chooseCard;
}

export function sortCardbyValue(cards: CardId[]): CardId[] {
  type CardsValue = {
    cardId: CardId;
    value: number;
  };

  const cardIds = cards.reduce<CardsValue[]>((allCardsValue, cardId) => {
    const cardValue = getCardValueofCard(cardId);
    const value =
      cardValue.value *
      cardValue.wane **
        allCardsValue.filter(s => Sanguosha.getCardById(s.cardId).Name === Sanguosha.getCardById(cardId).Name).length;

    allCardsValue.push({ cardId, value });
    allCardsValue.sort((a, b) => b.value - a.value);
    return allCardsValue;
  }, []);

  cardIds.map(cardsValue => {
    console.log(`card: ${Sanguosha.getCardById(cardsValue.cardId).Name}, value: ${cardsValue.value}`);
    return [];
  });

  const result = cardIds.map(cardsValue => cardsValue.cardId);

  return result;
}
