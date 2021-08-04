import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher, CardMatcherSocketPassenger } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId, CardValue } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardOrSkillInnerEvent } from 'core/event/event.client';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GameMode } from 'core/shares/types/room_props';
import { ActiveSkill, FilterSkill, ViewAsSkill } from 'core/skills/skill';
import { AiSkillTrigger } from './ai_skill_trigger';

type CardsValue = {
  cardId: CardId;
  value: number;
};

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
    return (
      AiLibrary.standardCardValue.find(cardValue => cardValue.cardName === Sanguosha.getCardById(cardId).Name) || {
        value: 50,
        wane: 0.5,
        priority: 50,
      }
    );
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

  static sortCardbyValue(cards: CardId[], descend: boolean = true): CardId[] {
    const cardIds = cards.reduce<CardsValue[]>((allCardsValue, cardId) => {
      const cardValue = AiLibrary.getCardValueofCard(cardId);
      const value =
        cardValue.value *
        cardValue.wane **
          allCardsValue.filter(s => Sanguosha.getCardById(s.cardId).Name === Sanguosha.getCardById(cardId).Name).length;

      allCardsValue.push({ cardId, value });
      allCardsValue.sort((a, b) => (descend ? b.value - a.value : a.value - b.value));
      return allCardsValue;
    }, []);

    const result = cardIds.map(cardsValue => cardsValue.cardId);

    return result;
  }

  static findCardsByMatcher(
    room: Room,
    player: Player,
    cardMatcher?: CardMatcher,
    fromAreas: PlayerCardsArea[] = [PlayerCardsArea.HandArea],
    outsideAreaName?: string,
  ) {
    const cards = fromAreas.reduce<CardId[]>((savedCards, area) => {
      const areaCards = player
        .getCardIds(area, outsideAreaName)
        .filter(card => (cardMatcher ? cardMatcher.match(Sanguosha.getCardById(card)) : true));

      savedCards.push(...areaCards);

      return savedCards;
    }, []);

    return cards;
  }

  static findAvailableCardsToUse(room: Room, player: Player, cardMatcher?: CardMatcher) {
    let cards = AiLibrary.findCardsByMatcher(room, player, cardMatcher).filter(cardId =>
      player.canUseCard(room, cardId),
    );

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      cards = cards.filter(cardId => skill.canUseCard(cardId, room, player.Id));
    }

    const viewAsSkills = player.getSkills<ViewAsSkill>('viewAs');
    for (const skill of viewAsSkills) {
      const availableCards: CardId[] = [];
      for (const area of skill.availableCardAreas()) {
        availableCards.push(...player.getCardIds(area, skill.GeneralName));
      }

      const avaiableViewAs = AiSkillTrigger.createViewAsPossibilties(
        room,
        player,
        skill,
        availableCards,
        cardMatcher,
        [],
      );
      if (avaiableViewAs) {
        const canViewAs = skill.canViewAs(room, player, avaiableViewAs, cardMatcher);
        for (const viewAs of canViewAs) {
          const viewAsCardId = skill.viewAs(avaiableViewAs, player, viewAs).Id;
          if (player.canUseCard(room, viewAsCardId, cardMatcher)) {
            cards.push(viewAsCardId);
          }
        }
      }
    }

    return cards;
  }

  static findAvailableCardsToResponse(
    room: Room,
    player: Player,
    onResponse?: ServerEventFinder<GameEventIdentifiers>,
    cardMatcher?: CardMatcher,
  ) {
    let cards = AiLibrary.findCardsByMatcher(room, player, cardMatcher);

    for (const skill of player.getSkills<FilterSkill>('filter')) {
      cards = cards.filter(cardId => skill.canUseCard(cardId, room, player.Id, onResponse));
    }

    const viewAsSkills = player.getSkills<ViewAsSkill>('viewAs');
    for (const skill of viewAsSkills) {
      const availableCards: CardId[] = [];
      for (const area of skill.availableCardAreas()) {
        availableCards.push(...player.getCardIds(area, skill.GeneralName));
      }

      const avaiableViewAs = AiSkillTrigger.createViewAsPossibilties(
        room,
        player,
        skill,
        availableCards,
        cardMatcher,
        [],
      );
      if (avaiableViewAs) {
        const canViewAs = skill.canViewAs(room, player, avaiableViewAs, cardMatcher);
        for (const viewAs of canViewAs) {
          const viewAsCardId = skill.viewAs(avaiableViewAs, player, viewAs).Id;
          if (player.canUseCard(room, viewAsCardId, cardMatcher)) {
            cards.push(viewAsCardId);
          }
        }
      }
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

  static aiUseCard(room: Room, from: Player): PlayerCardOrSkillInnerEvent | undefined {
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

  static sortEnemiesByRole(room: Room, from: Player) {
    let enemies = room.getOtherPlayers(from.Id).filter(other => !this.areTheyFriendly(other, from, room.Info.gameMode));

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

  static areTheyFriendly(playerA: Player, playerB: Player, mode: GameMode) {
    if (mode !== GameMode.Hegemony && playerA.Role === playerB.Role) {
      return true;
    }

    switch (mode) {
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
}
