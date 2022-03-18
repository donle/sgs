import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { PlayerPhase } from './stage_processor';

type MovingCardType = {
  card: CardId;
  fromArea?: CardMoveArea | PlayerCardsArea;
};

type RecordCurrentType = 'phase' | 'round' | 'circle';

export class RecordAnalytics {
  private events: ServerEventFinder<GameEventIdentifiers>[] = [];
  private currentPhaseEvents: ServerEventFinder<GameEventIdentifiers>[] = [];
  private currentRoundEvents: {
    [P in PlayerPhase]?: ServerEventFinder<GameEventIdentifiers>[];
  } = {};
  private currentCircleEvents: {
    [P in PlayerPhase]?: ServerEventFinder<GameEventIdentifiers>[];
  } = {};
  private currentPlayerId: PlayerId;

  public turnTo(currentPlayer: PlayerId) {
    this.currentRoundEvents = {};
    this.currentPlayerId = currentPlayer;
  }

  public turnToNextCircle() {
    this.currentCircleEvents = {};
  }

  public turnToNextPhase() {
    this.currentPhaseEvents = [];
  }

  public record<T extends GameEventIdentifiers>(event: ServerEventFinder<T>, currentPhase?: PlayerPhase) {
    this.events.push(event);
    this.currentPhaseEvents.push(event);
    if (currentPhase) {
      this.currentRoundEvents[currentPhase] = this.currentRoundEvents[currentPhase] || [];
      this.currentRoundEvents[currentPhase]!.push(event);

      this.currentCircleEvents[currentPhase] = this.currentCircleEvents[currentPhase] || [];
      this.currentCircleEvents[currentPhase]!.push(event);
    }
  }

  public getRecordEvents<T extends GameEventIdentifiers>(
    matcherFunction: (event: ServerEventFinder<T>) => boolean,
    player?: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<T>[] {
    if (current) {
      if (inPhase !== undefined && current !== 'phase') {
        const currentEvents = current === 'round' ? this.currentRoundEvents : this.currentCircleEvents;
        let events: ServerEventFinder<T>[] = [];
        if (num > 0) {
          for (const phase of inPhase) {
            if (!currentEvents[phase]) {
              continue;
            }

            for (const event of Object.values(currentEvents[phase]!)) {
              if (matcherFunction(event as ServerEventFinder<T>)) {
                events.push(event as ServerEventFinder<T>);
              }

              if (events.length === num) {
                break;
              }
            }
            if (events.length === num) {
              break;
            }
          }

          return events;
        }

        events = inPhase.reduce<ServerEventFinder<T>[]>((selectedEvents, phase) => {
          const phaseEvents = currentEvents[phase] as ServerEventFinder<T>[];
          phaseEvents && selectedEvents.push(...phaseEvents);
          return selectedEvents;
        }, []);
        return events.filter(event => matcherFunction(event) && (!player || player === this.currentPlayerId));
      } else {
        let events: ServerEventFinder<T>[] = [];
        if (current === 'phase') {
          if (num > 0) {
            for (const event of this.currentPhaseEvents) {
              if (matcherFunction(event as ServerEventFinder<T>)) {
                events.push(event as ServerEventFinder<T>);
              }

              if (events.length === num) {
                break;
              }
            }

            return events;
          }

          events = Object.values(this.currentPhaseEvents).reduce<ServerEventFinder<T>[]>((allEvents, phaseEvent) => {
            phaseEvent && allEvents.push(phaseEvent as ServerEventFinder<T>);
            return allEvents;
          }, []);
        } else {
          const currentEvents = current === 'round' ? this.currentRoundEvents : this.currentCircleEvents;
          if (num > 0) {
            for (const currentEvent of Object.values(currentEvents)) {
              if (currentEvent) {
                for (const event of currentEvent) {
                  if (matcherFunction(event as ServerEventFinder<T>)) {
                    events.push(event as ServerEventFinder<T>);
                  }

                  if (events.length === num) {
                    break;
                  }
                }
                if (events.length === num) {
                  break;
                }
              }
            }

            return events;
          }

          events = Object.values(currentEvents).reduce<ServerEventFinder<T>[]>((allEvents, phaseEvents) => {
            phaseEvents && allEvents.push(...(phaseEvents as ServerEventFinder<T>[]));
            return allEvents;
          }, []);
        }

        return events.filter(event => matcherFunction(event) && (!player || player === this.currentPlayerId));
      }
    } else {
      if (num > 0) {
        const events: ServerEventFinder<T>[] = [];
        for (const event of this.events) {
          if (matcherFunction(event as ServerEventFinder<T>)) {
            events.push(event as ServerEventFinder<T>);
          }

          if (events.length === num) {
            break;
          }
        }

        return events;
      }

      return (this.events as any).filter(matcherFunction);
    }
  }

  public getRecoveredHpRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.RecoverEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.RecoverEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.RecoverEvent && event.toId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getDamageRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.fromId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getDamagedRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.DamageEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent && event.toId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getLostHpRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.LoseHpEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.LoseHpEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.LoseHpEvent && event.toId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardUseRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.CardUseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent && event.fromId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardResponseRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.CardResponseEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.CardResponseEvent>(
      event => EventPacker.getIdentifier(event) === GameEventIdentifiers.CardResponseEvent && event.fromId === player,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardLostRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.infos.find(
          info =>
            !(
              player === info.toId &&
              (info.toArea === PlayerCardsArea.HandArea || info.toArea === PlayerCardsArea.EquipArea)
            ) &&
            info.fromId === player &&
            info.movingCards.find(
              cardInfo => cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea,
            ) !== undefined,
        ) !== undefined,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardObtainedRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.infos.find(info => info.toId === player && info.toArea === CardMoveArea.HandArea) !== undefined,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardDrawRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.infos.find(info => info.toId === player && info.moveReason === CardMoveReason.CardDraw) !== undefined,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardDropRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.infos.find(
          info =>
            info.fromId === player &&
            (info.moveReason === CardMoveReason.SelfDrop || info.moveReason === CardMoveReason.PassiveDrop),
        ) !== undefined,
      undefined,
      current,
      inPhase,
      num,
    );
  }
  public getCardMoveRecord(
    player: PlayerId,
    current?: RecordCurrentType,
    inPhase?: PlayerPhase[],
    num: number = 0,
  ): ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[] {
    return this.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
        event.infos.find(info => info.proposer === player) !== undefined,
      undefined,
      current,
      inPhase,
      num,
    );
  }

  public getRecoveredHp(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getRecoveredHpRecord(player, current, inPhase, num).reduce<number>((totalAmount, event) => {
      totalAmount += event.recoveredHp;
      return totalAmount;
    }, 0);
  }
  public getDamage(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getDamageRecord(player, current, inPhase, num).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getDamaged(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getDamagedRecord(player, current, inPhase, num).reduce<number>((totalAmount, event) => {
      totalAmount += event.damage;
      return totalAmount;
    }, 0);
  }
  public getLostHp(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getLostHpRecord(player, current, inPhase, num).reduce<number>((totalAmount, event) => {
      totalAmount += event.lostHp;
      return totalAmount;
    }, 0);
  }
  public getUsedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardUseRecord(player, current, inPhase, num).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getResponsedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardResponseRecord(player, current, inPhase, num).reduce<CardId[]>((allCards, event) => {
      allCards.push(event.cardId);
      return allCards;
    }, []);
  }
  public getLostCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardLostRecord(player, current, inPhase, num).reduce<MovingCardType[]>((allCards, event) => {
      if (event.infos.length === 1) {
        allCards.push(...event.infos[0].movingCards);
      } else {
        const infos = event.infos.filter(
          info =>
            !(
              player === info.toId &&
              (info.toArea === PlayerCardsArea.HandArea || info.toArea === PlayerCardsArea.EquipArea)
            ) &&
            info.fromId === player &&
            info.movingCards.find(
              cardInfo => cardInfo.fromArea === CardMoveArea.HandArea || cardInfo.fromArea === CardMoveArea.EquipArea,
            ) !== undefined,
        );

        for (const info of infos) {
          allCards.push(...info.movingCards);
        }
      }
      return allCards;
    }, []);
  }
  public getObtainedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardObtainedRecord(player, current, inPhase, num).reduce<CardId[]>((allCards, event) => {
      if (event.infos.length === 1) {
        allCards.push(...event.infos[0].movingCards.map(cardInfo => cardInfo.card));
      } else {
        const infos = event.infos.filter(
          info => event.infos.find(info => info.toId === player && info.toArea === CardMoveArea.HandArea) !== undefined,
        );

        for (const info of infos) {
          allCards.push(...info.movingCards.map(cardInfo => cardInfo.card));
        }
      }
      return allCards;
    }, []);
  }
  public getDrawedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardDrawRecord(player, current, inPhase, num).reduce<CardId[]>((allCards, event) => {
      if (event.infos.length === 1) {
        allCards.push(...event.infos[0].movingCards.map(cardInfo => cardInfo.card));
      } else {
        const infos = event.infos.filter(
          info =>
            event.infos.find(info => info.toId === player && info.moveReason === CardMoveReason.CardDraw) !== undefined,
        );

        for (const info of infos) {
          allCards.push(...info.movingCards.map(cardInfo => cardInfo.card));
        }
      }
      return allCards;
    }, []);
  }
  public getDroppedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardDropRecord(player, current, inPhase, num).reduce<CardId[]>((allCards, event) => {
      if (event.infos.length === 1) {
        allCards.push(...event.infos[0].movingCards.map(cardInfo => cardInfo.card));
      } else {
        const infos = event.infos.filter(
          info =>
            event.infos.find(
              info =>
                info.fromId === player &&
                (info.moveReason === CardMoveReason.SelfDrop || info.moveReason === CardMoveReason.PassiveDrop),
            ) !== undefined,
        );

        for (const info of infos) {
          allCards.push(...info.movingCards.map(cardInfo => cardInfo.card));
        }
      }
      return allCards;
    }, []);
  }
  public getMovedCard(player: PlayerId, current?: RecordCurrentType, inPhase?: PlayerPhase[], num: number = 0) {
    return this.getCardMoveRecord(player, current, inPhase, num).reduce<MovingCardType[]>((allCards, event) => {
      if (event.infos.length === 1) {
        allCards.push(...event.infos[0].movingCards);
      } else {
        const infos = event.infos.filter(info => event.infos.find(info => info.proposer === player) !== undefined);

        for (const info of infos) {
          allCards.push(...info.movingCards);
        }
      }
      return allCards;
    }, []);
  }
}
