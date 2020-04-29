import { ClientEventFinder, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { GameInfo, GameRunningInfo } from 'core/game/game_props';
import { PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import { PlayerId } from 'core/player/player_props';
import { Room, RoomId } from './room';

export class ClientRoom extends Room<WorkPlace.Client> {
  protected readonly socket: ClientSocket;
  protected readonly gameInfo: GameInfo;
  protected readonly players: Player[];
  protected readonly roomId: RoomId;

  private round: number = 0;
  private currentPlayer: ClientPlayer;
  private currentPhasePlayer: ClientPlayer;
  private currentPlayerStage: PlayerPhaseStages;
  private currentPlayerPhase: PlayerPhase;
  private numberOfDrawStack: number = 0;
  private numberOfDropStack: number = 0;
  constructor(roomId: RoomId, socket: ClientSocket, gameInfo: GameInfo, players: ClientPlayer[]) {
    super();

    this.roomId = roomId;
    this.socket = socket;
    this.gameInfo = gameInfo;
    this.players = players;
  }

  protected init(gameStartInfo: GameRunningInfo): void {
    this.currentPlayer = this.getPlayerById(gameStartInfo.currentPlayerId) as ClientPlayer;
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
  public putCards(): any {
    this.throwUntouchableError(this.putCards.name);
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
  public async loseCards(): Promise<void> {
    this.throwUntouchableError(this.loseCards.name);
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
  public async loseHp(): Promise<void> {
    this.throwUntouchableError(this.loseHp.name);
  }
  //Server only
  public async pindian(): Promise<any> {
    this.throwUntouchableError(this.pindian.name);
  }
  //Server only
  public async changeMaxHp(): Promise<void> {
    this.throwUntouchableError(this.changeMaxHp.name);
  }
  //Server only
  public async recover(): Promise<void> {
    this.throwUntouchableError(this.recover.name);
  }
  //Server only
  public async judge(): Promise<any> {
    this.throwUntouchableError(this.judge.name);
  }
  //Server only
  public async responseCard(): Promise<void> {
    this.throwUntouchableError(this.responseCard.name);
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
  //Server only
  public bury(): void {
    this.throwUntouchableError(this.bury.name);
  }
  //Server only
  public isBuried(): any {
    this.throwUntouchableError(this.isBuried.name);
  }
  //Server only
  public async askForCardDrop(): Promise<any> {
    this.throwUntouchableError(this.askForCardDrop.name);
  }
  //Server only
  public async askForCardUse(): Promise<any> {
    this.throwUntouchableError(this.askForCardUse.name);
  }
  //Server only
  public async askForCardResponse(): Promise<any> {
    this.throwUntouchableError(this.askForCardResponse.name);
  }
  //Server only
  public async turnOver(playerId: PlayerId) {
    this.throwUntouchableError(this.turnOver.name);
  }
  public skip() {
    this.throwUntouchableError(this.skip.name);
  }

  public broadcast<T extends GameEventIdentifiers>(type: T, content: ClientEventFinder<T>): void {
    this.socket.notify(type, content);
  }

  public get CurrentPlayerPhase(): PlayerPhase {
    return this.currentPlayerPhase;
  }
  public get CurrentPlayer(): ClientPlayer {
    return this.currentPlayer;
  }

  public get CurrentPhasePlayer(): ClientPlayer {
    return this.currentPhasePlayer;
  }

  public turnTo(playerId: PlayerId) {
    this.currentPlayer = this.getPlayerById(playerId) as ClientPlayer;
  }

  public onPhaseTo(playerId: PlayerId, phase: PlayerPhase) {
    this.currentPlayerPhase = phase;
    this.currentPhasePlayer = this.getPlayerById(playerId) as ClientPlayer;
  }

  public async gameStart(gameStartInfo: GameRunningInfo) {
    this.gameStarted = true;

    this.init(gameStartInfo);
  }

  public gameOver() {
    super.gameOver();

    for (const player of this.AlivePlayers) {
      this.kill(player);
    }
    this.currentPlayerPhase = undefined as any;
    this.currentPlayer = undefined as any;
    this.currentPlayerStage = undefined as any;
    this.currentPhasePlayer = undefined as any;
  }

  public nextRound() {
    this.round++;
  }

  public get Round() {
    return this.round;
  }

  public set DrawStack(newAmount: number) {
    this.numberOfDrawStack = newAmount;
  }
  public set DropStack(newAmount: number) {
    this.numberOfDropStack = newAmount;
  }

  public get DrawStackAmount() {
    return this.numberOfDrawStack;
  }
  public get DropStackAmount() {
    return this.numberOfDropStack;
  }

  public set CurrentPlayerStage(stage: PlayerPhaseStages) {
    this.currentPlayerStage = stage;
  }

  public get CurrentPlayerStage() {
    return this.currentPlayerStage;
  }

  public getPlayerById(playerId: PlayerId) {
    return super.getPlayerById(playerId) as ClientPlayer;
  }
}
