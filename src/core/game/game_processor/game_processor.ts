import { CardId } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameEventStage, PlayerPhase, PlayerPhaseStages, StageProcessor } from '../stage_processor';

export abstract class GameProcessor {
  protected playerPositionIndex: number;
  protected room: ServerRoom;
  protected currentPlayerStage: PlayerPhaseStages | undefined;
  protected currentPlayerPhase: PlayerPhase | undefined;
  protected currentPhasePlayer: Player;
  protected currentProcessingStage: GameEventStage | undefined;
  protected currentProcessingEvent: ServerEventFinder<GameEventIdentifiers> | undefined;
  protected playerStages: PlayerPhaseStages[];
  protected stageProcessor: StageProcessor;
  protected logger: Logger;

  protected toEndPhase: PlayerPhase | undefined;
  protected playRoundInsertions: PlayerId[];
  protected dumpedLastPlayerPositionIndex: number;

  protected tryToThrowNotStartedError() {
    Precondition.assert(this.room !== undefined, 'Game is not started yet');
  }

  protected abstract async chooseCharacters(
    playersInfo: PlayerInfo[],
    selectableCharacters: Character[],
  ): Promise<void>;

  protected abstract async iterateEachStage<T extends GameEventIdentifiers>(
    identifier: T,
    event: ServerEventFinder<GameEventIdentifiers>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
    processor?: (stage: GameEventStage) => Promise<void>,
  ): Promise<void>;

  protected abstract async onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void>;

  public abstract async gameStart(
    room: ServerRoom,
    selectableCharacters: Character[],
    setSelectedCharacters: () => void,
  ): Promise<void>;
  public abstract async onHandleIncomingEvent<T extends GameEventIdentifiers, E extends ServerEventFinder<T>>(
    identifier: T,
    event: E,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void>;
  public abstract async onHandleAsyncMoveCardEvent(
    events: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[],
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void>;
  public abstract createCardMoveMessage(
    from: Player | undefined,
    to: Player | undefined,
    cardIds: CardId[],
    actualCardIds: CardId[],
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
  ): void;
  public abstract async moveCardInGameboard(
    from: Player | undefined,
    to: Player | undefined,
    cardIds: CardId[],
    actualCardIds: CardId[],
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
  ): Promise<void>;
  public abstract async turnToNextPlayer(): Promise<void>;
  public abstract insertPlayerRound(player: PlayerId): void;
  public abstract insertPlayerPhase(player: PlayerId, phase: PlayerPhase): void;
  public abstract isExtraPhase(): boolean;
  public abstract skip(phase?: PlayerPhase): void;
  public abstract endPhase(phase: PlayerPhase): void;
  public abstract getRoles(playerNumber: number): PlayerRole[];
  public abstract getWinners(players: Player[]): Player[] | undefined;
  public abstract assignRoles(players: Player[]): void;
  protected abstract async drawGameBeginsCards(playerInfo: PlayerInfo): Promise<void>;
  // tslint:disable-next-line: no-empty
  protected async beforeGameStartPreparation() {}

  protected abstract async onPlayerJudgeStage(phase: PlayerPhase): Promise<void>;
  protected abstract async onPlayerDrawCardStage(phase: PlayerPhase): Promise<void>;
  protected abstract async onPlayerPlayCardStage(phase: PlayerPhase): Promise<void>;
  protected abstract async onPlayerDropCardStage(phase: PlayerPhase): Promise<void>;

  public get CurrentPlayer() {
    this.tryToThrowNotStartedError();
    return this.room.Players[this.playerPositionIndex];
  }

  public get CurrentPhasePlayer() {
    this.tryToThrowNotStartedError();
    return this.currentPhasePlayer!;
  }

  public get CurrentPlayerPhase() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerPhase!;
  }
  public get CurrentPlayerStage() {
    this.tryToThrowNotStartedError();
    return this.currentPlayerStage!;
  }

  public get CurrentProcessingStage() {
    this.tryToThrowNotStartedError();
    return this.currentProcessingStage;
  }

  public get CurrentProcessingEvent(): ServerEventFinder<GameEventIdentifiers> | undefined {
    this.tryToThrowNotStartedError();
    return this.currentProcessingEvent;
  }
}
