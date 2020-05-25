import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';

type MovingCardType = {
  card: CardId;
  fromArea?: CardMoveArea | PlayerCardsArea;
};

export interface AnalyticsActions {
  getRecoveredHpReord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.RecoverEvent>[];
  getDamageReord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.DamageEvent>[];
  getDamagedReord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.DamageEvent>[];
  getLostHpReord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.LoseHpEvent>[];
  getCardUseRecord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.CardUseEvent>[];
  getCardResponseRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.CardResponseEvent>[];
  getCardLostRecord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[];
  getCardObtainedRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[];
  getCardDrawRecord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[];
  getCardDropRecord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[];
  getCardMoveRecord(player: PlayerId, currentRound?: boolean): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[];

  getRecoveredHp(player: PlayerId, currentRound?: boolean): number;
  getDamage(player: PlayerId, currentRound?: boolean): number;
  getDamaged(player: PlayerId, currentRound?: boolean): number;
  getLostHp(player: PlayerId, currentRound?: boolean): number;
  getUsedCard(player: PlayerId, currentRound?: boolean): CardId[];
  getResponsedCard(player: PlayerId, currentRound?: boolean): CardId[];
  getLostCard(player: PlayerId, currentRound?: boolean): CardId[];
  getObtainedCard(player: PlayerId, currentRound?: boolean): CardId[];
  getDrawedCard(player: PlayerId, currentRound?: boolean): CardId[];
  getDroppedCard(player: PlayerId, currentRound?: boolean): CardId[];
  getMovedCard(player: PlayerId, currentRound?: boolean): MovingCardType[];

  turnTo(currentPlayer: PlayerId): void;
}

export class RecordAnalytics implements AnalyticsActions {
  public events: ServerEventFinder<GameEventIdentifiers>[] = [];
  public currentRoundEvents: ServerEventFinder<GameEventIdentifiers>[] = [];
  public currentPlayerId: PlayerId;

  public turnTo(currentPlayer: PlayerId) {
    this.currentRoundEvents = [];
    this.currentPlayerId = currentPlayer;
  }

  public record<T extends GameEventIdentifiers>(event: ServerEventFinder<T>) {
    this.events.push(event);
    this.currentRoundEvents.push(event);
  }

  private getRecordEvents<T extends GameEventIdentifiers>(
    matcherFunction: (event: ServerEventFinder<T>) => boolean,
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<T>[] {
    if (currentRound) {
      return (this.currentRoundEvents as any[]).filter(
        event => matcherFunction(event) && player === this.currentPlayerId,
      );
    } else {
      return (this.events as any).filter(matcherFunction);
    }
  }

  public getRecoveredHpReord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.RecoverEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.RecoverEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.RecoverEvent && event.toId === player,
      player,
      currentRound,
    );
  }
  public getDamageReord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.fromId === player,
      player,
      currentRound,
    );
  }
  public getDamagedReord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.toId === player,
      player,
      currentRound,
    );
  }
  public getLostHpReord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.LoseHpEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.LoseHpEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.LoseHpEvent && event.toId === player,
      player,
      currentRound,
    );
  }
  public getCardUseRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.CardUseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent && event.fromId === player,
      player,
      currentRound,
    );
  }
  public getCardResponseRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.CardResponseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardResponseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent && event.fromId === player,
      player,
      currentRound,
    );
  }
  public getCardLostRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.fromId === player &&
        event.movingCards.find(
          cardInfo => cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea,
        ) !== undefined,
      player,
      currentRound,
    );
  }
  public getCardObtainedRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.toId === player &&
        event.toArea === CardMoveArea.HandArea,
      player,
      currentRound,
    );
  }
  public getCardDrawRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.toId === player &&
        event.moveReason === CardMoveReason.CardDraw,
      player,
      currentRound,
    );
  }
  public getCardDropRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.toId === player &&
        (event.moveReason === CardMoveReason.SelfDrop || event.moveReason === CardMoveReason.PassiveDrop),
      player,
      currentRound,
    );
  }
  public getCardMoveRecord(
    player: PlayerId,
    currentRound?: boolean,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent && event.proposer === player,
      player,
      currentRound,
    );
  }

  public getRecoveredHp(player: PlayerId, currentRound?: boolean) {
    return this.getRecoveredHpReord(player, currentRound).reduce<number>((totalAmount, event) => {
      totalAmount += event.recoveredHp;
      return totalAmount;
    }, 0);
  }
  public getDamage(player: PlayerId, currentRound?: boolean) {
    return this.getDamageReord(player, currentRound).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getDamaged(player: PlayerId, currentRound?: boolean) {
    return this.getDamagedReord(player, currentRound).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getLostHp(player: PlayerId, currentRound?: boolean) {
    return this.getLostHpReord(player, currentRound).reduce<number>((totalAmount, event) => {
      totalAmount += event.lostHp;
      return totalAmount;
    }, 0);
  }
  public getUsedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardUseRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getResponsedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardResponseRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getLostCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardLostRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getObtainedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardObtainedRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getDrawedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardDrawRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getDroppedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardDropRecord(player, currentRound).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getMovedCard(player: PlayerId, currentRound?: boolean) {
    return this.getCardMoveRecord(player, currentRound).reduce<MovingCardType[]>((allCards, event) => {
      allCards.push(...event.movingCards);
      return allCards;
    }, []);
  }
}
