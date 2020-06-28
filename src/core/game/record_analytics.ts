import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { PlayerPhase } from './stage_processor';

type MovingCardType = {
  card: CardId;
  fromArea?: CardMoveArea | PlayerCardsArea;
};

export class RecordAnalytics {
  private events: ServerEventFinder<GameEventIdentifiers>[] = [];
  private currentRoundEvents: {
    [P in PlayerPhase]?: ServerEventFinder<GameEventIdentifiers>[];
  } = {};
  private currentPlayerId: PlayerId;

  public turnTo(currentPlayer: PlayerId) {
    this.currentRoundEvents = {};
    this.currentPlayerId = currentPlayer;
  }

  public record<T extends GameEventIdentifiers>(event: ServerEventFinder<T>, currentPhase?: PlayerPhase) {
    this.events.push(event);
    if (currentPhase) {
      this.currentRoundEvents[currentPhase] = this.currentRoundEvents[currentPhase] || [];
      this.currentRoundEvents[currentPhase]!.push(event);
    }
  }

  public getRecordEvents<T extends GameEventIdentifiers>(
    matcherFunction: (event: ServerEventFinder<T>) => boolean,
    player?: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<T>[] {
    if (currentRound) {
      if (inPhase !== undefined) {
        const events = inPhase.reduce<ServerEventFinder<T>[]>((selectedEvents, phase) => {
          const phaseEvents = this.currentRoundEvents[phase] as ServerEventFinder<T>[];
          phaseEvents && selectedEvents.push(...phaseEvents);
          return selectedEvents;
        }, []);
        return events.filter(event => matcherFunction(event) && (!player || player === this.currentPlayerId));
      } else {
        const events = Object.values(this.currentRoundEvents).reduce<ServerEventFinder<T>[]>(
          (allEvents, phaseEvents) => {
            phaseEvents && allEvents.push(...(phaseEvents as ServerEventFinder<T>[]));
            return allEvents;
          },
          [],
        );
        return events.filter(event => matcherFunction(event) && (!player || player === this.currentPlayerId));
      }
    } else {
      return (this.events as any).filter(matcherFunction);
    }
  }

  public getRecoveredHpReord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.RecoverEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.RecoverEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.RecoverEvent && event.toId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getDamageReord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.fromId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getDamagedReord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.toId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getLostHpReord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.LoseHpEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.LoseHpEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.LoseHpEvent && event.toId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardUseRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.CardUseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent && event.fromId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardResponseRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.CardResponseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardResponseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent && event.fromId === player,
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardLostRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
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
      inPhase,
    );
  }
  public getCardObtainedRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.toId === player &&
        event.toArea === CardMoveArea.HandArea,
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardDrawRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.toId === player &&
        event.moveReason === CardMoveReason.CardDraw,
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardDropRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.fromId === player &&
        (event.moveReason === CardMoveReason.SelfDrop || event.moveReason === CardMoveReason.PassiveDrop),
      player,
      currentRound,
      inPhase,
    );
  }
  public getCardMoveRecord(
    player: PlayerId,
    currentRound?: boolean,
    inPhase?: PlayerPhase[],
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent && event.proposer === player,
      player,
      currentRound,
      inPhase,
    );
  }

  public getRecoveredHp(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getRecoveredHpReord(player, currentRound, inPhase).reduce<number>((totalAmount, event) => {
      totalAmount += event.recoveredHp;
      return totalAmount;
    }, 0);
  }
  public getDamage(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getDamageReord(player, currentRound, inPhase).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getDamaged(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getDamagedReord(player, currentRound, inPhase).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getLostHp(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getLostHpReord(player, currentRound, inPhase).reduce<number>((totalAmount, event) => {
      totalAmount += event.lostHp;
      return totalAmount;
    }, 0);
  }
  public getUsedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardUseRecord(player, currentRound, inPhase).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getResponsedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardResponseRecord(player, currentRound, inPhase).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getLostCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardLostRecord(player, currentRound, inPhase).reduce<MovingCardType[]>((allCards, event) => {
      allCards.push(...event.movingCards);
      return allCards;
    }, []);
  }
  public getObtainedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardObtainedRecord(player, currentRound, inPhase).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getDrawedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardDrawRecord(player, currentRound, inPhase).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getDroppedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardDropRecord(player, currentRound, inPhase).reduce<CardId[]>((allCards, event) => {
      allCards.push(...event.movingCards.map(cardInfo => cardInfo.card));
      return allCards;
    }, []);
  }
  public getMovedCard(player: PlayerId, currentRound?: boolean, inPhase?: PlayerPhase[]) {
    return this.getCardMoveRecord(player, currentRound, inPhase).reduce<MovingCardType[]>((allCards, event) => {
      allCards.push(...event.movingCards);
      return allCards;
    }, []);
  }
}
