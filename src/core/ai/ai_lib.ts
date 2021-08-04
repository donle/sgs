import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher, CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId, CardValue } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { FilterSkill } from 'core/skills/skill';

export abstract class AiLibrary {
  private static readonly standardCardValue = [
    // {Card,value, wane, priority}
    // Equipment
    { cardName: 'baguazhen', value: 35, wane: 0, priority: 95 },
    { cardName: 'chitu', value: 35, wane: 0, priority: 95 },
    { cardName: 'cixiongjian', value: 35, wane: 0, priority: 95 },
    { cardName: 'dayuan', value: 35, wane: 0, priority: 95 },
    { cardName: 'dilu', value: 35, wane: 0, priority: 95 },
    { cardName: 'fangtianhuaji', value: 35, wane: 0, priority: 95 },
    { cardName: 'guanshifu', value: 35, wane: 0, priority: 95 },
    { cardName: 'jueying', value: 35, wane: 0, priority: 95 },
    { cardName: 'hanbingjian', value: 35, wane: 0, priority: 95 },
    { cardName: 'qilingong', value: 35, wane: 0, priority: 95 },
    { cardName: 'qinggang', value: 35, wane: 0, priority: 95 },
    { cardName: 'qinglongyanyuedao', value: 35, wane: 0, priority: 95 },
    { cardName: 'renwangdun', value: 35, wane: 0, priority: 95 },
    { cardName: 'zhangbashemao', value: 35, wane: 0, priority: 95 },
    { cardName: 'zhuahuangfeidian', value: 35, wane: 0, priority: 95 },
    { cardName: 'zhugeliannu', value: 35, wane: 0, priority: 80 },
    { cardName: 'zixing', value: 35, wane: 0, priority: 95 },
    { cardName: 'baiyinshizi', value: 35, wane: 0, priority: 95 },
    { cardName: 'gudingdao', value: 35, wane: 0, priority: 95 },
    { cardName: 'hualiu', value: 35, wane: 0, priority: 95 },
    { cardName: 'muniuliuma', value: 35, wane: 0, priority: 95 },
    { cardName: 'tengjia', value: 35, wane: 0, priority: 95 },
    { cardName: 'zhuqueyushan', value: 35, wane: 0, priority: 95 },

    // Trick
    { cardName: 'wuzhongshengyou', value: 59, wane: 0.9, priority: 84 },
    { cardName: 'shunshouqianyang', value: 58, wane: 0.9, priority: 83 },
    { cardName: 'guohechaiqiao', value: 57, wane: 0.9, priority: 85 },
    { cardName: 'lebusishu', value: 56, wane: 0.9, priority: 82 },
    { cardName: 'bingliangcunduan', value: 55, wane: 0.9, priority: 81 },
    { cardName: 'duel', value: 50, wane: 0.8, priority: 80 },
    { cardName: 'fireattack', value: 50, wane: 0.8, priority: 81 },
    { cardName: 'nanmanruqing', value: 45, wane: 0, priority: 85 },
    { cardName: 'wanjianqifa', value: 45, wane: 0, priority: 85 },
    { cardName: 'taoyuanjieyi', value: 25, wane: 0, priority: 0 },
    { cardName: 'wuxiekeji', value: 25, wane: 0, priority: 85 },
    { cardName: 'wugufengdeng', value: 25, wane: 0, priority: 85 },
    { cardName: 'jiedaosharen', value: 25, wane: 0, priority: 0 },
    { cardName: 'tiesuolianhuan', value: 22, wane: 0, priority: 85 },
    { cardName: 'lightning', value: 25, wane: 0, priority: 85 },

    // Basic
    { cardName: 'peach', value: 70, wane: 0.5, priority: 50 },
    { cardName: 'jink', value: 65, wane: 0.5, priority: 0 },
    { cardName: 'fire_slash', value: 60, wane: 0.3, priority: 45 },
    { cardName: 'thunder_slash', value: 55, wane: 0.3, priority: 43 },
    { cardName: 'alcohol', value: 52, wane: 0.4, priority: 49 },
    { cardName: 'slash', value: 50, wane: 0.3, priority: 35 },
  ];

  static getCardValueofCard(cardId: CardId): CardValue {
    let cardValue: CardValue = {
      value: 50,
      wane: 0.5,
      priority: 50,
    };

    for (const card of AiLibrary.standardCardValue) {
      if (card.cardName === Sanguosha.getCardById(cardId).Name) {
        cardValue = {
          value: card.value,
          wane: card.wane,
          priority: card.priority,
        };
        break;
      }
    }

    return cardValue;
  }

  static sortCardsValuePriority(cardIds: CardId[]): CardId[] {
    return cardIds.sort((a, b) => AiLibrary.getCardValueofCard(a).value - AiLibrary.getCardValueofCard(b).value);
  }

  static sortCardsUsePriority(room: Room, player: Player) {
    const cards = AiLibrary.findAvailableCardsToUse(room, player);
    return cards.sort(
      (a, b) =>
        AiLibrary.getCardValueofPlayer(room, player.Id, b).priority! -
        AiLibrary.getCardValueofPlayer(room, player.Id, a).priority!,
    );
  }

  static getCardValueofPlayer(room: Room, aiId: PlayerId, cardId: CardId): CardValue {
    const cardValue: CardValue = AiLibrary.getCardValueofCard(cardId);
    const targetCard = Sanguosha.getCardById(cardId);
    if (targetCard.BaseType === CardType.Equip) {
      cardValue.priority =
        room.getPlayerById(aiId).getEquipment((targetCard as EquipCard).EquipType) === undefined
          ? cardValue.priority
          : Math.max(0, cardValue.priority - 60);
    }
    return cardValue;
  }

  static shouldUseWuXieKeJi(
    room: Room,
    player: Player,
    availableCards: CardId[],
    byCardId: CardId,
    cardUseFrom?: PlayerId,
  ) {
    const isAiRound = room.CurrentPhasePlayer.Id === player.Id;
    const askedByCard = Sanguosha.getCardById(byCardId);

    if (isAiRound) {
      return player.Id !== cardUseFrom;
    }

    if (askedByCard.Name === 'wanjianqifa') {
      return availableCards.length > 1;
    }
  }

  static shouldUseJink(
    room: Room,
    player: Player,
    availableCards: CardId[],
    byCardId?: CardId,
    cardUseFrom?: PlayerId,
  ) {
    const isAiRound = room.CurrentPhasePlayer.Id === player.Id;
    const askedByCard = byCardId && Sanguosha.getCardById(byCardId);

    if (isAiRound) {
      return player.Id !== cardUseFrom;
    }

    if (askedByCard) {
      if (askedByCard.Name === 'wanjianqifa') {
        return availableCards.length > 1;
      }
      if (askedByCard.Name === 'slash') {
        const useFrom = cardUseFrom ? room.getPlayerById(cardUseFrom) : undefined;
        if (useFrom?.hasDrunk()) {
          return true;
        }
        if (useFrom && useFrom.getCardIds(PlayerCardsArea.HandArea).length > 3) {
          return availableCards.length > 1;
        }
        return true;
      }
    } else {
      return false;
    }
  }

  static askAiUseCard(
    room: Room,
    aiId: PlayerId,
    cardMatcher: CardMatcherSocketPassenger,
    byCardId?: CardId,
    cardUseFrom?: PlayerId,
  ): CardId[] {
    const aiPlayer = room.getPlayerById(aiId);
    const cardIds: CardId[] = AiLibrary.findAvailableCardsToUse(room, aiPlayer, new CardMatcher(cardMatcher));

    if (cardIds.length === 0) {
      return cardIds;
    }

    if (byCardId !== undefined) {
      if (cardMatcher.name?.includes('wuxiekeji')) {
        return AiLibrary.shouldUseWuXieKeJi(room, aiPlayer, cardIds, byCardId, cardUseFrom) ? cardIds : [];
      }
    }

    return cardIds;
  }

  static askAiChooseCardFromPlayer<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    room: Room,
    aiId: PlayerId,
    toId: PlayerId,
    options: CardChoosingOptions,
  ): ClientEventFinder<T> {
    const equipTypePriority = [
      CardType.DefenseRide,
      CardType.Shield,
      CardType.OffenseRide,
      CardType.Weapon,
      CardType.Precious,
    ];

    let selectedCard: CardId | undefined;
    let fromArea: PlayerCardsArea | undefined;
    let selectedCardIndex: number | undefined;

    const areas = Object.keys(options).map(area => Number(area) as PlayerCardsArea);
    if (areas.includes(PlayerCardsArea.EquipArea)) {
      const cardIds = options[PlayerCardsArea.EquipArea];
      if (cardIds instanceof Array && cardIds.length > 0) {
        selectedCard = cardIds.find(cardId =>
          Sanguosha.getCardById(cardId).is(
            equipTypePriority.find(
              equipType => cardIds.filter(c => Sanguosha.getCardById(c).is(equipType)).length > 0,
            )!,
          ),
        );
      }
    }

    if (selectedCard === undefined) {
      fromArea = areas.find(area => room.getPlayerById(toId).getCardIds(area).length > 0);

      if (fromArea === undefined) {
        const chooseCard: ClientEventFinder<T> = { fromId: aiId };
        return chooseCard;
      }

      const cards = options[fromArea]!;

      selectedCard = cards instanceof Array ? cards[0] : undefined;
      selectedCardIndex = typeof cards === 'number' ? 0 : undefined;
    }

    const chooseCard: ClientEventFinder<T> = {
      fromId: aiId,
      selectedCard,
      fromArea,
      selectedCardIndex,
    };

    return chooseCard;
  }

  static sortCardbyValue(cards: CardId[]): CardId[] {
    type CardsValue = {
      cardId: CardId;
      value: number;
    };

    const cardIds = cards.reduce<CardsValue[]>((allCardsValue, cardId) => {
      const cardValue = AiLibrary.getCardValueofCard(cardId);
      const value =
        cardValue.value *
        cardValue.wane **
          allCardsValue.filter(s => Sanguosha.getCardById(s.cardId).Name === Sanguosha.getCardById(cardId).Name).length;

      allCardsValue.push({ cardId, value });
      allCardsValue.sort((a, b) => b.value - a.value);
      return allCardsValue;
    }, []);

    cardIds.map(cardsValue => {
      return [];
    });

    const result = cardIds.map(cardsValue => cardsValue.cardId);

    return result;
  }

  static findCardsByMatcher(
    player: Player,
    cardMatcher?: CardMatcher,
    fromAreas: PlayerCardsArea[] = [PlayerCardsArea.HandArea],
    outsideAreaName?: string,
  ) {
    return fromAreas.reduce<CardId[]>((savedCards, area) => {
      const areaCards = player
        .getCardIds(area, outsideAreaName)
        .filter(card => (cardMatcher ? cardMatcher.match(Sanguosha.getCardById(card)) : true));

      savedCards.push(...areaCards);

      return savedCards;
    }, []);
  }

  static findAvailableCardsToUse(room: Room, player: Player, cardMatcher?: CardMatcher) {
    let cards = AiLibrary.findCardsByMatcher(player, cardMatcher).filter(cardId => player.canUseCard(room, cardId));

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      cards = cards.filter(cardId => skill.canUseCard(cardId, room, player.Id));
    }

    return cards;
  }

  static findAvailableCardsToResponse(
    room: Room,
    player: Player,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    cardMatcher?: CardMatcher,
  ) {
    let cards = AiLibrary.findCardsByMatcher(player, cardMatcher);

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      cards = cards.filter(cardId => skill.canUseCard(cardId, room, player.Id, onResponse));
    }

    return cards;
  }

  static getPlayerAbsoluteDefenseValue(player: Player) {
    let defenseValue = 0;
    const equips = player.getCardIds(PlayerCardsArea.EquipArea);
    if (equips.find(card => Sanguosha.getCardById(card).is(CardType.Shield)) || player.hasSkill('bazhen')) {
      defenseValue += 5;
    }
    if (equips.find(card => Sanguosha.getCardById(card).is(CardType.DefenseRide))) {
      defenseValue += 2;
    }
    if (player.hasSkill('feiying')) {
      defenseValue += 2;
    }
    if (player.hasSkill('leiji')) {
      defenseValue += player.getCardIds(PlayerCardsArea.HandArea).length / 1.5;
    }

    return defenseValue;
  }

  static getPlayerRelativeDefenseValue(from: Player, to: Player) {
    let targetDefenseValue = AiLibrary.getPlayerAbsoluteDefenseValue(to);

    const equips = from.getCardIds(PlayerCardsArea.EquipArea);
    if (equips.find(card => Sanguosha.getCardById(card).is(CardType.OffenseRide))) {
      targetDefenseValue -= 2;
    }
    if (from.hasSkill('mashu')) {
      targetDefenseValue -= 1;
    }
    if (equips.find(card => Sanguosha.getCardById(card).is(CardType.Weapon))) {
      targetDefenseValue -= 2;
    }
    if (equips.find(card => Sanguosha.getCardById(card).Name === 'qinggang')) {
      targetDefenseValue -= 3;
    }

    return targetDefenseValue;
  }
}
