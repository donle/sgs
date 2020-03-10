import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  RoomEvent,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';

import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameInfo } from 'core/game/game_props';
import { AllStage, PlayerPhase } from 'core/game/stage_processor';
import { RoomInfo } from 'core/shares/types/server_types';
import { FilterSkill } from 'core/skills/skill';

export type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract readonly socket: Socket<T>;
  protected abstract readonly gameInfo: GameInfo;
  protected abstract readonly players: Player[];
  protected abstract readonly roomId: RoomId;

  protected gameStarted: boolean = false;

  protected abstract init(...args: any[]): void;

  private onClosedCallback: () => void;

  //Server only
  public abstract notify<I extends GameEventIdentifiers>(
    type: I,
    content: EventPicker<I, T>,
    pleyer: PlayerId,
  ): void;
  public abstract broadcast(
    type: GameEventIdentifiers,
    content: EventPicker<typeof type, WorkPlace>,
  ): void;

  //Server only
  public abstract getCards(
    numberOfCards: number,
    from: 'top' | 'bottom',
  ): CardId[];
  //Server only
  public abstract async drawCards(
    numberOfCards: number,
    player?: PlayerId,
    from?: 'top' | 'bottom',
  ): Promise<CardId[]>;
  //Server only
  public abstract async dropCards(
    cardIds: CardId[],
    player?: PlayerId,
  ): Promise<void>;
  //Server only
  public abstract async obtainCards(
    cardIds: CardId[],
    to: PlayerId,
  ): Promise<void>;
  //Server only
  public abstract async moveCard(
    cardId: CardId,
    from: PlayerId | undefined,
    to: PlayerId,
    fromArea: PlayerCardsArea | undefined,
    toArea: PlayerCardsArea,
  ): Promise<void>;
  //Server only
  public abstract async moveCards(
    cardIds: CardId[],
    from: PlayerId | undefined,
    to: PlayerId,
    fromArea: PlayerCardsArea | undefined,
    toArea: PlayerCardsArea,
  ): Promise<void>;
  //Server only
  public abstract async onReceivingAsyncReponseFrom<
    T extends GameEventIdentifiers
  >(identifier: T, playerId?: PlayerId): Promise<ClientEventFinder<T>>;

  //Server only
  public abstract async damage(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): Promise<void>;
  //Server only
  public abstract async recover(
    event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>,
  ): Promise<void>;
  //Server only
  public abstract async judge(
    event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>,
  ): Promise<void>;
  //Server only
  public abstract async responseCard(
    event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>,
  ): Promise<void>;
  //Server only
  public abstract getOnProcessingCard(): CardId | undefined;
  //Server only
  public abstract clearOnProcessingCard(): void;
  //Server only
  public abstract bury(cardId?: CardId): void;
  //Server only
  public abstract isBuried(cardId: CardId): boolean;

  //Server only
  public abstract trigger<T = never>(
    content: T extends never
      ? EventPicker<GameEventIdentifiers, WorkPlace.Server>
      : T,
    stage?: AllStage,
  ): void;
  //Server only
  public abstract loseSkill(playerId: PlayerId, skillName: string): void;
  //Server only
  public abstract obtainSkill(playerId: PlayerId, skillName: string): void;

  public abstract async gameStart(...args: any[]): Promise<void>;
  public abstract get CurrentPlayerStage(): PlayerPhase;
  public abstract get CurrentPhasePlayer(): Player;
  public abstract get CurrentPlayer(): Player;
  //Server only
  public abstract syncGameCommonRules(
    playerId: PlayerId,
    updateActions: (user: Player) => void,
  ): void;

  public getCardOwnerId(card: CardId) {
    for (const player of this.AlivePlayers) {
      if (player.getCardId(card) !== undefined) {
        return player.Id;
      }
    }
  }

  public getPlayerById(playerId: PlayerId) {
    const player = this.players.find(player => player.Id === playerId);
    if (player === undefined) {
      throw new Error(`Unable to find player by player ID: ${playerId}`);
    }

    return player;
  }

  public async useCard(
    content: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ): Promise<void> {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useCard(content.cardId);
    }
  }

  public async useSkill(
    content: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<void> {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      from.useSkill(content.skillName);
    }
  }

  public get AlivePlayers() {
    return this.players.filter(player => !player.Dead);
  }

  public get Players() {
    return this.players;
  }

  public sortPlayers() {
    this.players.sort((playerA, playerB) => {
      if (playerA.Position <= playerB.Position) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  public addPlayer(player: Player) {
    this.players.push(player);
    return this.players;
  }

  public removePlayer(playerId: PlayerId) {
    const playerIndex = this.players.findIndex(
      player => player.Id === playerId,
    );
    if (playerIndex >= 0) {
      this.players.splice(playerIndex, 1);
    }
  }

  public getAlivePlayersFrom(
    playerId?: PlayerId,
    startsFromNext: boolean = false,
  ) {
    playerId = playerId === undefined ? this.CurrentPlayer.Id : playerId;
    const alivePlayers = this.AlivePlayers;
    const fromIndex = alivePlayers.findIndex(player => player.Id === playerId);

    if (fromIndex < 0) {
      throw new Error(`Player ${playerId} is dead or doesn't exist`);
    }

    return [
      ...alivePlayers.slice(startsFromNext ? fromIndex + 1 : fromIndex),
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
    for (let start = startPosition; start < endPosition; start++) {
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

  public isAvailableTarget(
    cardId: CardId,
    attacker: PlayerId,
    target: PlayerId,
  ) {
    for (const skill of this.getPlayerById(target).getSkills<FilterSkill>(
      'filter',
    )) {
      if (
        !skill.canBeUsedCard(
          cardId,
          (this as unknown) as Room,
          target,
          attacker,
        )
      ) {
        return false;
      }
    }

    return true;
  }

  public close() {
    this.onClosedCallback && this.onClosedCallback();
  }

  public onClosed(fn: () => void) {
    this.onClosedCallback = fn;
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

  public getRoomInfo(): RoomInfo {
    return {
      name: this.gameInfo.roomName,
      activePlayers: this.players.length,
      totalPlayers: this.gameInfo.numberOfPlayers,
      packages: this.gameInfo.characterExtensions,
      status: this.gameStarted ? 'playing' : 'waiting',
    };
  }

  public get RoomId() {
    return this.roomId;
  }

  public get Info() {
    return this.gameInfo;
  }

  public isPlaying() {
    return this.gameStarted;
  }
}
