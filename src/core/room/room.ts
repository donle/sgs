import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  RoomEvent,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameInfo } from 'core/game/game_props';
import {
  AllStage,
  GameEventStage,
  PlayerPhase,
} from 'core/game/stage_processor';
import { GameProcessor } from '../game/game_processor';

export type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract socket: Socket<T>;
  protected abstract gameInfo: GameInfo;
  protected abstract players: Player[];
  protected abstract roomId: RoomId;

  constructor() {
    this.init();
  }

  protected abstract init(): void;

  public abstract notify<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<I, T>,
    pleyer: PlayerId,
  ): void;
  public abstract broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
  ): void;

  public abstract getCards(
    numberOfCards: number,
    from: 'top' | 'bottom',
  ): CardId[];
  public abstract async drawCards(
    numberOfCards: number,
    player?: PlayerId,
    from?: 'top' | 'bottom',
  ): Promise<CardId[]>;
  public abstract async dropCards(
    cardIds: CardId[],
    player?: PlayerId,
  ): Promise<void>;
  public abstract async obtainCards(
    cardIds: CardId[],
    to: PlayerId,
  ): Promise<void>;
  public abstract async moveCard(
    cardId: CardId,
    from: PlayerId | undefined,
    to: PlayerId,
    fromArea: PlayerCardsArea | undefined,
    toArea: PlayerCardsArea,
  ): Promise<void>;
  public abstract async moveCards(
    cardIds: CardId[],
    from: PlayerId | undefined,
    to: PlayerId,
    fromArea: PlayerCardsArea | undefined,
    toArea: PlayerCardsArea,
  ): Promise<void>;
  public abstract isAvailableTarget(
    cardId: CardId,
    attacker: PlayerId,
    target: PlayerId,
  ): boolean;
  public abstract async onReceivingAsyncReponseFrom<
    T extends GameEventIdentifiers
  >(identifier: T, playerId?: PlayerId): Promise<ClientEventFinder<T>>;

  public abstract getCardOwnerId(card: CardId): PlayerId | undefined;
  public abstract trigger<T = never>(
    content: T extends never
      ? EventPicker<GameEventIdentifiers, WorkPlace.Server>
      : T,
    stage?: AllStage,
  ): void;

  public getPlayerById(playerId: PlayerId) {
    const player = this.players.find(player => player.Id === playerId);
    if (player === undefined) {
      throw new Error(`Unable to find player by player ID: ${playerId}`);
    }

    return player;
  }

  //TODO: refactor useCard and useSkill
  public async useCard(
    content: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace>,
  ) {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useCard(content.cardId);
    }

    this.broadcast(GameEventIdentifiers.CardUseEvent, content);
  }

  public async useSkill(
    content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    this.broadcast(GameEventIdentifiers.SkillUseEvent, content);
  }

  public get RoomId() {
    return this.roomId;
  }

  public abstract get CurrentPlayerStage(): PlayerPhase | undefined;
  public abstract get CurrentGameStage(): GameEventStage | undefined;
  public abstract get CurrentPlayer(): Player;
  public abstract get Processor(): GameProcessor;

  public get AlivePlayers() {
    return this.players.filter(player => !player.Dead);
  }

  public getAlivePlayersFrom(playerId?: PlayerId) {
    playerId = playerId === undefined ? this.CurrentPlayer.Id : playerId;
    const alivePlayers = this.AlivePlayers;
    const fromIndex = alivePlayers.findIndex(player => player.Id === playerId);

    if (fromIndex < 0) {
      throw new Error(`Player ${playerId} is dead or doesn't exist`);
    }

    return [
      ...alivePlayers.slice(fromIndex),
      ...alivePlayers.slice(0, fromIndex),
    ];
  }

  public getNextPlayer(playerId: PlayerId) {
    const alivePlayers = this.AlivePlayers;
    const fromIndex = alivePlayers.findIndex(player => player.Id === playerId);
    const nextIndex = (fromIndex + 1) % alivePlayers.length;

    return alivePlayers[nextIndex];
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
    return (
      from.AttackDistance >= seatDistance &&
      from.canUseCardTo(
        this as any,
        new CardMatcher({ name: ['slash'] }),
        to.Id,
      )
    );
  }

  public getFixedSeatDistance(from: Player, to: Player) {
    const seatGap = from.getOffenseDistance() - to.getDefenseDistance();
    return this.onSeatDistance(from, to) + seatGap;
  }

  public clearFlags(player: PlayerId) {
    this.socket.emitRoomStatus(RoomEvent.ClearFlagEvent, {
      to: player,
    });
    this.getPlayerById(player).clearFlags();
  }
  removeFlag(player: PlayerId, name: string) {
    this.socket.emitRoomStatus(RoomEvent.RemoveFlagEvent, {
      to: player,
      name,
    });
    this.getPlayerById(player).removeFlag(name);
  }
  setFlag<T>(player: PlayerId, name: string, value: T): T {
    this.socket.emitRoomStatus(RoomEvent.SetFlagEvent, {
      to: player,
      value,
      name,
    });
    return this.getPlayerById(player).setFlag(name, value);
  }
  getFlag<T>(player: PlayerId, name: string): T {
    return this.getPlayerById(player).getFlag(name);
  }

  public clearMarks(player: PlayerId) {
    this.socket.emitRoomStatus(RoomEvent.ClearMarkEvent, {
      to: player,
    });
    this.getPlayerById(player).clearMarks();
  }
  removeMark(player: PlayerId, name: string) {
    this.socket.emitRoomStatus(RoomEvent.RemoveMarkEvent, {
      to: player,
      name,
    });
    this.getPlayerById(player).removeMark(name);
  }
  setMark(player: PlayerId, name: string, value: number) {
    this.socket.emitRoomStatus(RoomEvent.SetMarkEvent, {
      to: player,
      name,
      value,
    });
    return this.getPlayerById(player).setMark(name, value);
  }
  addMark(player: PlayerId, name: string, value: number) {
    this.socket.emitRoomStatus(RoomEvent.AddMarkEvent, {
      to: player,
      value,
      name,
    });
    return this.getPlayerById(player).addMark(name, value);
  }
  getMark(player: PlayerId, name: string) {
    return this.getPlayerById(player).getMark(name);
  }
}
