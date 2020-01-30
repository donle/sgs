import { GameEventIdentifiers } from 'core/event/event';
import { PlayerStage, StageProcessor } from 'core/game/stage';
import { ServerRoom } from './room.server';

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

  public onHandleIncomingEvent(identifier: GameEventIdentifiers) {
    switch (identifier) {
      case GameEventIdentifiers.CardUseEvent:
        this.onHandleCardUseEvent(identifier);
        break;
      case GameEventIdentifiers.PinDianEvent:
        this.onHandlePinDianEvent(identifier);
        break;
      default:
        return false;
    }

    return true;
  }

  private onHandleCardUseEvent(identifier: GameEventIdentifiers.CardUseEvent) {
    this.stageProcessor.involve(identifier);
  }

  private async onHandlePinDianEvent(identifier: GameEventIdentifiers.PinDianEvent) {
    let eventStage = this.stageProcessor.involve(identifier);
    // this.room.trigger(eventStage)
    //TODO: complete
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
