import { CardId } from 'core/cards/card';
import { EventMode, EventPicker, GameEventIdentifiers } from 'core/event/event';
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
} from './game_props';

type RoomId = number;

export class Room {
  private cards: CardId[];
  private currentGameEventStage: GameEventStage;
  private currentPlayer: Player;
  private drawDile: CardId[];
  private dropDile: CardId[];

  constructor(
    private roomId: RoomId,
    private gameInfo: GameInfo,
    private socket: ServerSocket,
    private players: Player[],
  ) {
    this.init();
  }

  private init() {
    this.loadCards(this.gameInfo.cardExtensions);
    this.loadCharacters(this.gameInfo.characterExtensions);

    this.drawDile = this.cards.slice();
    this.dropDile = [];

    this.socket.emit(this);
  }

  private loadCharacters(characterPackages: GameCharacterExtensions[]) {}
  private loadCards(cardPackages: GameCardExtensions[]) {}

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
    const {Id, Name, Position, CharacterId } = playerInfo;
    this.players.push(new ServerPlayer(Id, Name, Position, playerLanguage, CharacterId))
  }

  public notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, EventMode.Client>,
    to: PlayerId,
  ) {
    this.socket.sendEvent(type, content, to);
  }

  public broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, EventMode.Client>,
  ) {
    this.socket.broadcast(type, content);
  }

  public on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<I, EventMode.Client>,
  ) {}

  public drawCards(numberOfCards: number, player?: Player) {
    const drawCards = this.drawDile.slice(0, numberOfCards);
    this.drawDile = this.drawDile.slice(numberOfCards);
    player
      ? player.drawCardIds(...drawCards)
      : this.currentPlayer.drawCardIds(...drawCards);
  }

  public dropCards(cardIds: CardId[], player?: Player) {

  };

  public get RoomId() {
    return this.roomId;
  }

  public get CurrentPlayer() {
    return this.currentPlayer;
  }
}
