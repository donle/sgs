import { CardId } from 'core/cards/card';
import { WorkPlace, EventPicker, GameEventIdentifiers } from 'core/event/event';
import { GameEventStage } from 'core/game/stage';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';

import {
  GameCardExtensions,
  GameCharacterExtensions,
  GameInfo,
} from '../game/game_props';

type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract currentGameEventStage: GameEventStage;
  protected abstract currentPlayer: Player;
  protected abstract socket: Socket<T>;
  protected abstract gameInfo: GameInfo;
  protected abstract players: Player[];
  protected abstract roomId: RoomId;

  constructor() {
    this.init();
  }

  protected abstract init(): void;
  protected abstract loadCharacters(
    characterPackages: GameCharacterExtensions[],
  ): void;
  protected abstract loadCards(cardPackages: GameCardExtensions[]): void;

  public abstract notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
    pleyer: PlayerId,
  ): void;
  public abstract broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace.Client>,
  ): void;
  public abstract drawCards(numberOfCards: number, player?: Player): void;
  public abstract dropCards(cardIds: CardId[], player?: Player): void;

  public on<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<I, WorkPlace.Client>,
  ) {}

  public get RoomId() {
    return this.roomId;
  }

  public get CurrentPlayer() {
    return this.currentPlayer;
  }
}
