import { CardId } from 'core/cards/card';
import { GameEventStage } from 'core/game/stage';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { Languages, Translations } from 'translations/translations';
import { AllGameEvent, GameEventIdentifiers } from '../event/event';
import { Sanguosha } from './engine';
import {
  GameCardExtensions,
  GameCharacterExtensions,
  GameInfo,
} from './game_props';

export class Room {
  private cards: CardId[];
  private currentGameEventStage: GameEventStage;
  private drawDile: CardId[];
  private dropDile: CardId[];

  constructor(
    private gameInfo: GameInfo,
    private players: Player[],
    private socket: ServerSocket,
    private engine: Sanguosha,
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

  public notify(
    type: GameEventIdentifiers,
    payload: AllGameEvent,
    to?: Player,
  ) {
    if (to) {
      //... do something
    } else {
      this.socket.sendEvent(type, payload);
    }
  }

  public drawCards(numberOfCards: number) {
    const drawCards = this.drawDile.slice(0, numberOfCards);
    this.drawDile = this.drawDile.slice(numberOfCards);
    this.engine.CurrentPlayer.drawCardIds(...drawCards);
  }
}
