import { CardId } from 'core/cards/card';
import { EventPicker, GameEventIdentifiers, WorkPlace } from 'core/event/event';
import { GameEventStage } from 'core/game/stage';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { PlayerId, PlayerInfo } from 'core/player/player_props';
import { Languages } from 'translations/languages';

import {
  GameCardExtensions,
  GameCharacterExtensions,
  GameInfo,
} from '../game/game_props';
import { Room } from './room';

type RoomId = number;

export class ServerRoom extends Room<WorkPlace.Server> {
  protected currentGameEventStage: GameEventStage;
  protected currentPlayer: Player;

  private cards: CardId[];
  private drawDile: CardId[];
  private dropDile: CardId[];

  constructor(
    protected roomId: RoomId,
    protected gameInfo: GameInfo,
    protected socket: ServerSocket,
    protected players: Player[],
  ) {
    super();
  }

  protected init() {
    this.loadCards(this.gameInfo.cardExtensions);
    this.loadCharacters(this.gameInfo.characterExtensions);

    this.drawDile = this.cards.slice();
    this.dropDile = [];

    this.socket.emit(this);
  }

  protected loadCharacters(characterPackages: GameCharacterExtensions[]) {}
  protected loadCards(cardPackages: GameCardExtensions[]) {}

  private shuffle() {
    for (let i = 0; i < this.drawDile.length - 1; i++) {
      const swapCardIndex =
        Math.floor(Math.random() * (this.drawCards.length - i)) + i;
      if (swapCardIndex !== i) {
        [this.drawDile[i], this.drawDile[swapCardIndex]] = [
          this.drawDile[swapCardIndex],
          this.drawDile[i],
        ];
      }
    }
  }

  public gameStart() {}

  public createPlayer(playerInfo: PlayerInfo, playerLanguage: Languages) {
    const { Id, Name, Position, CharacterId } = playerInfo;
    this.players.push(
      new ServerPlayer(Id, Name, Position, playerLanguage, CharacterId),
    );
  }

  public notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
    to: PlayerId,
  ) {
    this.socket.sendEvent(type, content, to);
  }

  public broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ) {
    this.socket.broadcast(type, content);
  }

  public drawCards(numberOfCards: number, player?: Player) {
    const drawCards = this.drawDile.slice(0, numberOfCards);
    this.drawDile = this.drawDile.slice(numberOfCards);
    player
      ? player.drawCardIds(...drawCards)
      : this.currentPlayer.drawCardIds(...drawCards);
  }

  public dropCards(cardIds: CardId[], player?: Player) {}

  public get RoomId() {
    return this.roomId;
  }

  public get CurrentPlayer() {
    return this.currentPlayer;
  }
}
