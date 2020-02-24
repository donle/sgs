import {
  ClientEventFinder,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { GameInfo, GameStartInfo } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { Room, RoomId } from './room';

export class ClientRoom extends Room<WorkPlace.Client> {
  protected readonly socket: Socket<WorkPlace.Client>;
  protected readonly gameInfo: GameInfo;
  protected readonly players: Player[];
  protected readonly roomId: RoomId;

  private round: number = 0;
  private currentPlayer: ClientPlayer;
  private currentPlayerPhase: PlayerPhase;
  private numberOfDrawStack: number = 0;
  private numberOfDropStack: number = 0;
  constructor(
    roomId: RoomId,
    socket: Socket<WorkPlace.Client>,
    gameInfo: GameInfo,
    players: ClientPlayer[],
    gameStartInfo: GameStartInfo,
  ) {
    super();

    this.roomId = roomId;
    this.socket = socket;
    this.gameInfo = gameInfo;
    this.players = players;

    this.init(gameStartInfo);
  }

  protected init(gameStartInfo: GameStartInfo): void {
    this.currentPlayer = this.getPlayerById(
      gameStartInfo.currentPlayerId,
    ) as ClientPlayer;
    this.numberOfDrawStack = gameStartInfo.numberOfDrawStack;
    this.round = gameStartInfo.round;
  }

  private throwUntouchableError(functionName: string) {
    throw new Error(`Shouldn't call ${functionName} in client room`);
  }

  //Server only
  public notify(): void {
    this.throwUntouchableError(this.notify.name);
  }
  //Server only
  public getCards(): any {
    this.throwUntouchableError(this.getCards.name);
  }
  //Server only
  public async drawCards(): Promise<any> {
    this.throwUntouchableError(this.drawCards.name);
  }
  //Server only
  public async dropCards(): Promise<void> {
    this.throwUntouchableError(this.dropCards.name);
  }
  //Server only
  public async obtainCards(): Promise<void> {
    this.throwUntouchableError(this.obtainCards.name);
  }
  //Server only
  public async moveCard(): Promise<void> {
    this.throwUntouchableError(this.moveCard.name);
  }
  //Server only
  public async moveCards(): Promise<void> {
    this.throwUntouchableError(this.moveCards.name);
  }
  //Server only
  public async onReceivingAsyncReponseFrom(): Promise<any> {
    this.throwUntouchableError(this.onReceivingAsyncReponseFrom.name);
  }
  //Server only
  public async damage(): Promise<void> {
    this.throwUntouchableError(this.damage.name);
  }
  //Server only
  public async recover(): Promise<void> {
    this.throwUntouchableError(this.recover.name);
  }
  //Server only
  public async judge(): Promise<void> {
    this.throwUntouchableError(this.judge.name);
  }
  //Server only
  public async responseCard(): Promise<void> {
    this.throwUntouchableError(this.responseCard.name);
  }
  //Server only
  public getCardOwnerId(): any {
    this.throwUntouchableError(this.getCardOwnerId.name);
  }
  //Server only
  public trigger(): void {
    this.throwUntouchableError(this.trigger.name);
  }
  //Server only
  public loseSkill(): void {
    this.throwUntouchableError(this.loseSkill.name);
  }
  //Server only
  public obtainSkill(): void {
    this.throwUntouchableError(this.obtainSkill.name);
  }
  //Server only
  public syncGameCommonRules(): void {
    this.throwUntouchableError(this.syncGameCommonRules.name);
  }

  public broadcast<T extends GameEventIdentifiers>(
    type: T,
    content: ClientEventFinder<T>,
  ): void {
    //TODO:
    this.socket.notify(type, content);
  };

  public get CurrentPlayerStage(): PlayerPhase {
    if (this.currentPlayerPhase === undefined) {
      throw new Error('Uninitilizes client room with current player stage');
    }

    return this.currentPlayerPhase;
  }
  public get CurrentPlayer(): ClientPlayer {
    if (this.currentPlayer === undefined) {
      throw new Error('Uninitilizes client room with current player');
    }

    return this.currentPlayer;
  }
}
