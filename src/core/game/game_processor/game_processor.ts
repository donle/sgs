import { GameEventStage, PlayerPhase, PlayerPhaseStages, StageProcessor } from '../stage_processor';
import { CardId } from 'core/cards/libs/card_props';
import { Character } from 'core/characters/character';
import { BaseGameEvent, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { MoveCardEventInfos } from 'core/event/event.server';
import { Player } from 'core/player/player';
import { PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { ServerRoom } from 'core/room/room.server';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';

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

  protected abstract chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]): Promise<void>;

  protected abstract iterateEachStage<T extends GameEventIdentifiers>(
    identifier: T,
    event: ServerEventFinder<GameEventIdentifiers>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
    processor?: (stage: GameEventStage) => Promise<void>,
  ): Promise<void>;

  protected abstract onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void>;

  public abstract gameStart(
    room: ServerRoom,
    selectableCharacters: Character[],
    setSelectedCharacters: () => void,
  ): Promise<void>;
  public abstract onHandleIncomingEvent<T extends GameEventIdentifiers, E extends ServerEventFinder<T>>(
    identifier: T,
    event: E,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ): Promise<void>;
  public abstract createCardMoveMessage(
    from: Player | undefined,
    to: Player | undefined,
    cardIds: CardId[],
    actualCardIds: CardId[],
    event: MoveCardEventInfos & BaseGameEvent,
  ): void;
  public abstract moveCardInGameboard(
    from: Player | undefined,
    to: Player | undefined,
    cardIds: CardId[],
    actualCardIds: CardId[],
    event: MoveCardEventInfos & BaseGameEvent,
  ): Promise<void>;
  public abstract turnToNextPlayer(): Promise<void>;
  public abstract insertPlayerRound(player: PlayerId): void;
  public abstract insertPlayerPhase(player: PlayerId, phase: PlayerPhase): void;
  public abstract isExtraPhase(): boolean;
  public abstract skip(phase?: PlayerPhase): void;
  public abstract endPhase(phase: PlayerPhase): void;
  public abstract getRoles(playerNumber: number): PlayerRole[];
  public abstract getWinners(players: Player[]): Player[] | undefined;
  public abstract assignRoles(players: Player[]): void;
  public abstract fixCurrentPosition(playerPosition: number): void;
  protected abstract drawGameBeginsCards(playerInfo: PlayerInfo): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async beforeGameStartPreparation() {}
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected async beforeGameBeginPreparation() {}

  protected abstract onPlayerJudgeStage(phase: PlayerPhase): Promise<void>;
  protected abstract onPlayerDrawCardStage(phase: PlayerPhase): Promise<void>;
  protected abstract onPlayerPlayCardStage(phase: PlayerPhase): Promise<void>;
  protected abstract onPlayerDropCardStage(phase: PlayerPhase): Promise<void>;

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
