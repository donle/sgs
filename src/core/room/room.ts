import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { GameEventStage, PlayerStage } from 'core/game/stage';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';

import { GameInfo } from 'core/game/game_props';

export type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract currentGameEventStage: GameEventStage | undefined;
  protected abstract currentPlayerStage: PlayerStage | undefined;
  protected abstract currentPlayer: Player | undefined;
  protected abstract socket: Socket<T>;
  protected abstract gameInfo: GameInfo;
  protected abstract players: Player[];
  protected abstract roomId: RoomId;

  constructor() {
    this.init();
  }

  protected abstract init(): void;
  public get Id(): RoomId {
    return this.roomId;
  }

  public abstract notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
    pleyer: PlayerId,
  ): void;
  public abstract async broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
  ): Promise<void>;

  public abstract drawCards(numberOfCards: number, player?: Player): void;
  public abstract dropCards(cardIds: CardId[], player?: Player): void;

  public getPlayerById(playerId: PlayerId) {
    const player = this.players.find(player => player.Id === playerId);
    if (player === undefined) {
      throw new Error(`Unable to find player by player ID: ${playerId}`);
    }

    return player;
  }

  public useCard(
    content: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    const from = this.getPlayerById(content.fromId);
    from.useCard(content.cardId);

    this.broadcast(GameEventIdentifiers.CardUseEvent, content);
  }

  public useSkill(
    content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    this.broadcast(GameEventIdentifiers.SkillUseEvent, content);
  }

  public get RoomId() {
    return this.roomId;
  }

  public get CurrentPlayerStage() {
    return this.currentPlayerStage;
  }

  public get CurrentGameEventStage() {
    return this.currentGameEventStage;
  }

  public get CurrentPlayer(): Player {
    if (!this.currentPlayer) {
      throw new Error('Unable to get current player');
    }

    return this.currentPlayer;
  }

  public get AlivePlayers() {
    return this.players.filter(player => !player.Dead);
  }

  private onSeatDistance(from: Player, to: Player) {
    const startPosition = Math.min(from.Position, to.Position);
    const endPosition =
      startPosition === from.Position ? to.Position : from.Position;
    let distance = 0;
    for (let start = startPosition; start === endPosition; start++) {
      if (!this.players[start].Dead) {
        distance++;
      }
    }

    return this.AlivePlayers.length / 2 <= distance
      ? distance
      : this.AlivePlayers.length - distance;
  }

  public canAttack(from: Player, to: Player) {
    const seatDistance = this.getFixedSeatDistance(from, to);
    return from.AttackDistance >= seatDistance;
  }

  public getFixedSeatDistance(from: Player, to: Player) {
    const seatGap = from.getOffenseDistance() + to.getDefenseDistance();
    return this.onSeatDistance(from, to) + seatGap;
  }
}
