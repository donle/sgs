import { Card } from 'core/cards/card';
import { Character } from 'core/characters/character';
import { Player } from 'core/player/player';
import { ServerPlayer } from 'core/player/player.server';
import { GameEventStage, PlayerStage } from 'core/stage';
import { Languages, Translations } from 'core/translations/translations';
import { SocketMessageTypes } from 'sgs/network/socket';
import { ServerSocket } from 'sgs/network/socket.server';
import { GameEvent } from './event';
import {
  GameCardExtensions,
  GameCharacterExtensions,
  GameInfo,
} from './game_props';

export class Room {
  private characters: Character[];
  private cards: Card[];
  private currentPlayer: ServerPlayer;
  private currentPlayerStage: PlayerStage;
  private currentGameEventStage: GameEventStage;
  private drawDile: Card[];
  private dropDile: Card[];

  constructor(
    private gameInfo: GameInfo,
    private players: Player[],
    private socket: ServerSocket,
  ) {
    Translations.setupLanguage(Languages.ZH_CN);

    this.loadCards(this.gameInfo.cardExtensions);
    this.loadCharacters(this.gameInfo.characterExtensions);

    this.drawDile = this.cards.slice();
    this.dropDile = [];
  }

  private loadCharacters(characterPackages: GameCharacterExtensions[]) {}
  private loadCards(cardPackages: GameCardExtensions[]) {}

  public gameStart() {}

  public notify(type: SocketMessageTypes, payload: GameEvent) {
    this.socket.sendEvent(type, payload);
  }

  public drawCards(numberOfCards: number) {
    const drawCards = this.drawDile.slice(9, numberOfCards);
    this.drawDile = this.drawDile.slice(numberOfCards);
    this.currentPlayer.drawCards(...drawCards);
  }
}
