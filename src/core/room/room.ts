import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';

import { Card } from 'core/cards/card';
import { GameInfo } from 'core/game/game_props';
import { AllStage } from 'core/game/stage_processor';
import { GameProcessor } from '../game/game_processor';

export type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract socket: Socket<T>;
  protected abstract gameInfo: GameInfo;
  protected abstract players: Player[];
  protected abstract roomId: RoomId;
  protected abstract gameProcessor: GameProcessor;

  constructor() {
    this.init();
  }

  protected abstract init(): void;

  public abstract notify(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
    pleyer: PlayerId,
  ): void;
  public abstract async broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
  ): Promise<void>;

  public abstract drawCards(numberOfCards: number, player?: PlayerId): void;
  public abstract dropCards(cardIds: CardId[], player?: PlayerId): void;
  public abstract async onReceivingAsyncReponseFrom<P>(
    identifier: GameEventIdentifiers,
    playerId?: PlayerId,
  ): Promise<P>;

  public abstract getCardOwnerId(card: CardId): PlayerId | undefined;
  public abstract trigger<T = never>(
    stage: AllStage,
    content: T extends never
      ? EventPicker<GameEventIdentifiers, WorkPlace.Server>
      : T,
  ): void;

  public getPlayerById(playerId: PlayerId) {
    const player = this.players.find(player => player.Id === playerId);
    if (player === undefined) {
      throw new Error(`Unable to find player by player ID: ${playerId}`);
    }

    return player;
  }

  //TODO: refactor useCard and useSkill
  public useCard(
    content: EventPicker<GameEventIdentifiers.CardUseEvent, WorkPlace>,
  ) {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useCard(content.cardId);
    }

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
    return this.gameProcessor.CurrentPlayerStage;
  }

  public get CurrentGameStage() {
    return this.gameProcessor.CurrentGameStage;
  }

  public get CurrentPlayer(): Player {
    return this.gameProcessor.CurrentPlayer;
  }

  public get Processor() {
    return this.gameProcessor;
  }

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
