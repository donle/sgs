import { CardId } from 'core/cards/libs/card_props';
import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { PinDianResultType } from 'core/event/event.server';
import {
  CardUseStage,
  DamageEffectStage,
  DrawCardStage,
  GameEventStage,
  PinDianStage,
  PlayerStage,
  StageProcessor,
  CardEffectStage,
} from 'core/game/stage_processor';
import { PlayerId } from 'core/player/player_props';
import { ServerRoom } from '../room/room.server';
import { Sanguosha } from './engine';

export class GameProcessor {
  private playerPositionIndex = -1;
  private room: ServerRoom;
  private currentPlayerStage: PlayerStage | undefined;

  constructor(private stageProcessor: StageProcessor) {}

  private tryToThrowNotStartedError() {
    if (!this.room || this.playerPositionIndex < 0) {
      throw new Error('Game is not started yet');
    }
  }

  public start(room: ServerRoom) {
    this.room = room;
    this.playerPositionIndex = 0;
    //TODO
    this.currentPlayerStage = this.stageProcessor.nextStage();

    if (this.currentPlayerStage === undefined) {
      //TODO: go to next player, needs to broadcast in the room
    }
  }

  public async onHandleIncomingEvent<
    T extends GameEventIdentifiers,
    E extends EventPicker<T, WorkPlace>
  >(identifier: T, event: E): Promise<void> {
    switch (identifier) {
      case GameEventIdentifiers.CardUseEvent:
        await this.onHandleCardUseEvent(
          identifier as GameEventIdentifiers.CardUseEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.AimEvent:
        await this.onHandleAimEvent(
          identifier as GameEventIdentifiers.AimEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.DamageEvent:
        this.onHandleDamgeEvent(
          identifier as GameEventIdentifiers.DamageEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.PinDianEvent:
        await this.onHandlePinDianEvent(
          identifier as GameEventIdentifiers.PinDianEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.DrawCardEvent:
        await this.onHandleDrawCardEvent(
          identifier as GameEventIdentifiers.DrawCardEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.CardDropEvent:
        await this.onHandleDropCardEvent(
          identifier as GameEventIdentifiers.CardDropEvent,
          event as any,
        );
        break;
      case GameEventIdentifiers.CardEffectEvent:
        await this.onHandleCardEffectEvent(
          identifier as GameEventIdentifiers.CardEffectEvent,
          event as any,
        );
        break;
      default:
        throw new Error(`Unknow incoming event: ${identifier}`);
    }

    return;
  }

  private iterateEachStage = async <T extends GameEventIdentifiers>(
    identifier: T,
    event: EventPicker<GameEventIdentifiers, WorkPlace.Server>,
    processor?: (stage: GameEventStage) => Promise<void>,
  ) => {
    let eventStage = this.stageProcessor.involve(identifier);
    while (this.stageProcessor.isInsideEvent(identifier, eventStage)) {
      await this.room.trigger<typeof event>(eventStage!, event);

      if (processor) {
        await processor(eventStage!);
      }

      eventStage = this.stageProcessor.nextInstantEvent();
    }
  };

  private async onHandleDrawCardEvent(
    identifier: GameEventIdentifiers.DrawCardEvent,
    event: EventPicker<GameEventIdentifiers.DrawCardEvent, WorkPlace.Server>,
  ) {
    this.iterateEachStage(identifier, event, async stage => {
      if (stage === DrawCardStage.CardDrawed) {
        const { numberOfCards, playerId } = event;
        this.room.drawCards(numberOfCards, playerId);
        this.room.broadcast(identifier, event);
      }
    });
  }

  private async onHandleDropCardEvent(
    identifier: GameEventIdentifiers.CardDropEvent,
    event: EventPicker<GameEventIdentifiers.CardDropEvent, WorkPlace.Server>,
  ) {
    this.iterateEachStage(identifier, event, async stage => {
      this.room.dropCards(event.cardIds);
      this.room.broadcast(identifier, event);
    });
  }

  private async onHandleDamgeEvent(
    identifier: GameEventIdentifiers.DamageEvent,
    event: EventPicker<GameEventIdentifiers.DamageEvent, WorkPlace.Server>,
  ) {
    this.iterateEachStage(identifier, event, async (stage: GameEventStage) => {
      if (stage === DamageEffectStage.DamagedEffect) {
        const { toId, damage } = event;
        this.room.getPlayerById(toId).onDamage(damage);
        this.room.broadcast(GameEventIdentifiers.DamageEvent, event);
      }
    });
  }

  private async onHandleSkillUseEvent() {}
  private async onHandleSkillEffectEvent() {}

  private async onHandleAimEvent(
    identifier: GameEventIdentifiers.AimEvent,
    event: EventPicker<GameEventIdentifiers.AimEvent, WorkPlace.Server>,
  ) {
    this.iterateEachStage(identifier, event);
    return event;
  }

  private async onHandleCardEffectEvent(
    identifier: GameEventIdentifiers.CardEffectEvent,
    event: EventPicker<GameEventIdentifiers.CardEffectEvent, WorkPlace.Server>,
  ) {
    this.iterateEachStage(identifier, event, async stage => {
      if (stage === CardEffectStage.CardEffect) {
        const { cardId } = event;
        Sanguosha.getCardById(cardId).Skill.onEffect(this.room, event);
      }
    });
  }

  private async onHandleCardUseEvent(
    identifier: GameEventIdentifiers.CardUseEvent,
    event: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace.Client>,
  ) {
    this.iterateEachStage(identifier, event);
  }

  private async onHandlePinDianEvent(
    identifier: GameEventIdentifiers.PinDianEvent,
    event: EventPicker<GameEventIdentifiers.PinDianEvent, WorkPlace.Client>,
  ) {
    let pindianResult: PinDianResultType | undefined;

    this.iterateEachStage(identifier, pindianResult || event, async stage => {
      if (stage === PinDianStage.PinDianEffect) {
        const { from, toIds } = event;
        const askForPinDianEvent: EventPicker<
          GameEventIdentifiers.AskForPinDianCardEvent,
          WorkPlace.Server
        > = {
          from,
        };

        this.room.notify(identifier, askForPinDianEvent, from);
        toIds.forEach(to => {
          askForPinDianEvent.from = to;
          this.room.notify(identifier, askForPinDianEvent, to);
        });

        const responses = await Promise.all([
          this.room.onReceivingAsyncReponseFrom<
            EventPicker<
              GameEventIdentifiers.AskForPinDianCardEvent,
              WorkPlace.Client
            >
          >(identifier, from),
          ...toIds.map(to =>
            this.room.onReceivingAsyncReponseFrom<
              EventPicker<
                GameEventIdentifiers.AskForPinDianCardEvent,
                WorkPlace.Client
              >
            >(identifier, to),
          ),
        ]);

        let winner: PlayerId | undefined;
        let largestCardNumber = -2;
        const pindianCards: CardId[] = [];

        for (const result of responses) {
          const pindianCard = Sanguosha.getCardById(result.pindianCard);
          if (pindianCard.CardNumber > largestCardNumber) {
            largestCardNumber = pindianCard.CardNumber;
            winner = result.from;
          } else if (pindianCard.CardNumber === largestCardNumber) {
            winner = undefined;
          }

          pindianCards.push(result.pindianCard);
        }

        pindianResult = {
          winner,
          pindianCards,
        };
      }
    });
  }

  public turnToNextPlayer() {
    this.tryToThrowNotStartedError();
    this.playerPositionIndex =
      (this.playerPositionIndex + 1) % this.room.AlivePlayers.length;
  }

  public get CurrentPlayer() {
    this.tryToThrowNotStartedError();
    return this.room.AlivePlayers[this.playerPositionIndex];
  }

  public get CurrentGameStage() {
    this.tryToThrowNotStartedError();
    return this.stageProcessor.CurrentGameEventStage;
  }

  public get CurrentPlayerStage() {
    this.tryToThrowNotStartedError();
    return this.stageProcessor.CurrentPlayerStage;
  }
}
