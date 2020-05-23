import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerRole } from 'core/player/player_props';

import { CardType } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { PinDianResultType } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { AllStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { RoomInfo } from 'core/shares/types/server_types';
import { FilterSkill } from 'core/skills/skill';

export type RoomId = number;

export type ResponsiveTriggeredResult<T extends GameEventIdentifiers> = {
  terminated?: boolean;
  responseEvent?: ClientEventFinder<T>;
};

export abstract class Room<T extends WorkPlace = WorkPlace> {
  protected abstract readonly socket: Socket<T>;
  protected abstract readonly gameInfo: GameInfo;
  protected abstract readonly players: Player[];
  protected abstract readonly roomId: RoomId;

  protected awaitResponseEvent:
    | {
        identifier: GameEventIdentifiers;
        content: EventPicker<GameEventIdentifiers, T>;
      }
    | undefined;

  protected gameStarted: boolean = false;
  protected gameOvered: boolean = false;
  private onProcessingCards: { [K: string]: CardId[] } = {};

  protected abstract init(...args: any[]): void;
  //Server only
  public abstract notify<I extends GameEventIdentifiers>(type: I, content: EventPicker<I, T>, player: PlayerId): void;
  public abstract broadcast<I extends GameEventIdentifiers>(type: I, content: EventPicker<I, T>): void;

  //Server only
  public abstract getCards(numberOfCards: number, from: 'top' | 'bottom'): CardId[];
  //Server only
  public abstract putCards(from: 'top' | 'bottom', ...cardIds: CardId[]): void;
  //Server only
  public abstract async drawCards(
    numberOfCards: number,
    player?: PlayerId,
    from?: 'top' | 'bottom',
    askedBy?: PlayerId,
    byReason?: string,
  ): Promise<CardId[]>;
  //Server only
  public abstract async dropCards(
    moveReason: CardMoveReason,
    cardIds: CardId[],
    player?: PlayerId,
    droppedBy?: PlayerId,
    byReason?: string,
  ): Promise<void>;
  //Server only
  public abstract async moveCards(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): Promise<void>;
  //Server only
  public abstract async onReceivingAsyncReponseFrom<T extends GameEventIdentifiers>(
    identifier: T,
    playerId?: PlayerId,
  ): Promise<ClientEventFinder<T>>;

  //Server only
  public abstract async loseHp(player: PlayerId, lostHp: number): Promise<void>;
  //Server only
  public abstract async changeMaxHp(player: PlayerId, additionalMaxHp: number): Promise<void>;
  //Server only
  public abstract async damage(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): Promise<void>;
  //Server only
  public abstract async recover(event: ServerEventFinder<GameEventIdentifiers.RecoverEvent>): Promise<void>;
  //Server only
  public abstract async judge(
    to: PlayerId,
    byCard?: CardId,
    bySkill?: string,
  ): Promise<ServerEventFinder<GameEventIdentifiers.JudgeEvent>>;
  //Server only
  public abstract async responseCard(event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>): Promise<void>;
  //Server only
  public abstract bury(...cardIds: CardId[]): void;
  //Server only
  public abstract isBuried(cardId: CardId): boolean;

  //Server only
  public abstract trigger<T = never>(
    content: T extends never ? EventPicker<GameEventIdentifiers, WorkPlace.Server> : T,
    stage?: AllStage,
  ): void;
  //Server only
  public abstract async loseSkill(playerId: PlayerId, skillName: string, broadcast?: boolean): Promise<void>;
  //Server only
  public abstract obtainSkill(playerId: PlayerId, skillName: string, broadcast?: boolean): void;
  //Server only
  public abstract async pindian(fromId: PlayerId, toIds: PlayerId[]): Promise<PinDianResultType | undefined>;
  public abstract async turnOver(playerId: PlayerId): Promise<void>;

  public abstract async gameStart(...args: any[]): Promise<void>;
  public abstract get CurrentPlayerStage(): PlayerPhaseStages;
  public abstract get CurrentPlayerPhase(): PlayerPhase;
  public abstract get CurrentPhasePlayer(): Player;
  public abstract get CurrentPlayer(): Player;
  //Server only
  public abstract syncGameCommonRules(playerId: PlayerId, updateActions: (user: Player) => void): void;
  //Server only
  public abstract async askForCardDrop<T extends GameEventIdentifiers.AskForCardDropEvent>(
    playerId: PlayerId,
    discardAmount: number,
    fromArea: PlayerCardsArea[],
    uncancellable?: boolean,
    except?: CardId[],
  ): Promise<ResponsiveTriggeredResult<T>>;
  //Server only
  public abstract async askForCardUse<T extends GameEventIdentifiers.AskForCardUseEvent>(
    event: ServerEventFinder<T>,
    to: PlayerId,
  ): Promise<ResponsiveTriggeredResult<T>>;
  //Server only
  public abstract async askForCardResponse<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    event: ServerEventFinder<T>,
    to: PlayerId,
  ): Promise<ResponsiveTriggeredResult<T>>;
  public abstract isCardInDropStack(cardId: CardId): boolean;
  public abstract isCardInDrawStack(cardId: CardId): boolean;

  public abstract skip(player: PlayerId, phase?: PlayerPhase): void;

  public addProcessingCards(tag: string, ...cardIds: CardId[]) {
    this.onProcessingCards[tag] = this.onProcessingCards[tag] || [];

    for (const cardId of cardIds) {
      this.onProcessingCards[tag].push(cardId);
    }
  }
  public getProcessingCards(tag: string): CardId[] {
    return this.onProcessingCards[tag] || [];
  }
  public isCardOnProcessing(cardId: CardId): boolean {
    return Object.values(this.onProcessingCards).find(cards => cards.includes(cardId)) !== undefined;
  }
  public clearOnProcessingCard(): void {
    this.onProcessingCards = {};
  }
  public endProcessOnTag(tag: string) {
    delete this.onProcessingCards[tag];
  }
  public endProcessOnCard(card: CardId) {
    for (const [tag, cards] of Object.entries(this.onProcessingCards)) {
      const cardIndex = cards.findIndex(inProcessingCard => card === inProcessingCard);
      if (cardIndex >= 0) {
        cards.splice(cardIndex, 1);
      }
      if (this.onProcessingCards[tag].length === 0) {
        delete this.onProcessingCards[tag];
      }
    }
  }

  public getCardOwnerId(card: CardId) {
    for (const player of this.AlivePlayers) {
      if (player.getCardId(card) !== undefined) {
        return player.Id;
      }
    }
  }

  public getPlayerById(playerId: PlayerId) {
    return Precondition.exists(
      this.players.find(player => player.Id === playerId),
      `Unable to find player by player ID: ${playerId}`,
    );
  }

  public async useCard(content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): Promise<void> {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      if (this.CurrentPlayer.Id === content.fromId) {
        from.useCard(content.cardId);
      }
    }
  }

  public async useSkill(content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<void> {
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
    const playerIndex = this.players.findIndex(player => player.Id === playerId);
    if (playerIndex >= 0) {
      this.players.splice(playerIndex, 1);
    }
  }

  public getAlivePlayersFrom(playerId?: PlayerId, startsFromNext: boolean = false) {
    playerId = playerId === undefined ? this.CurrentPlayer.Id : playerId;
    while (this.getPlayerById(playerId).Dead) {
      playerId = this.getNextAlivePlayer(playerId).Id;
    }

    const alivePlayers = this.AlivePlayers;
    const fromIndex = alivePlayers.findIndex(player => player.Id === playerId);

    Precondition.assert(fromIndex >= 0, `Player ${playerId} is dead or doesn't exist`);

    return [...alivePlayers.slice(startsFromNext ? fromIndex + 1 : fromIndex), ...alivePlayers.slice(0, fromIndex)];
  }

  public getOtherPlayers(playerId: PlayerId, from?: PlayerId) {
    return this.getAlivePlayersFrom(from).filter(player => player.Id !== playerId);
  }

  public getNextPlayer(playerId: PlayerId) {
    const fromIndex = this.players.findIndex(player => player.Id === playerId);
    const nextIndex = (fromIndex + 1) % this.players.length;

    return this.players[nextIndex];
  }

  public getNextAlivePlayer(playerId: PlayerId) {
    let nextIndex = this.players.findIndex(player => player.Id === playerId);
    do {
      nextIndex = (nextIndex + 1) % this.players.length;
    } while (this.players[nextIndex].Dead);

    return this.players[nextIndex];
  }

  public deadPlayerFilters(playerIds: PlayerId[]) {
    return playerIds.filter(playerId => !this.getPlayerById(playerId).Dead);
  }

  private onSeatDistance(from: Player, to: Player) {
    const startPosition = Math.min(from.Position, to.Position);
    const endPosition = startPosition === from.Position ? to.Position : from.Position;
    let distance = 0;
    for (let start = startPosition; start < endPosition; start++) {
      if (!this.players[start].Dead) {
        distance++;
      }
    }

    return this.AlivePlayers.length / 2 >= distance ? distance : this.AlivePlayers.length - distance;
  }

  public canAttack(from: Player, to: Player, slash?: CardId) {
    if (to.Id === from.Id) {
      return false;
    }
    const seatDistance = this.distanceBetween(from, to);
    let additionalAttackDistance = 0;
    if (slash) {
      additionalAttackDistance =
        GameCommonRules.getCardAdditionalAttackDistance(this, from, Sanguosha.getCardById(slash)) +
        from.getCardUsableDistance(this, slash) -
        Sanguosha.getCardById(slash).EffectUseDistance;
    }

    return (
      from.getAttackDistance(this) + additionalAttackDistance >= seatDistance &&
      this.canUseCardTo(slash || new CardMatcher({ name: ['slash'] }), to.Id)
    );
  }

  public distanceBetween(from: Player, to: Player) {
    const seatGap = to.getDefenseDistance(this) - from.getOffenseDistance(this);
    return this.onSeatDistance(from, to) + seatGap;
  }
  public cardUseDistanceBetween(room: Room, cardId: CardId, from: Player, to: Player) {
    const card = Sanguosha.getCardById(cardId);

    return Math.max(
      this.distanceBetween(from, to) - GameCommonRules.getCardAdditionalUsableDistance(room, from, card),
      1,
    );
  }

  public isAvailableTarget(cardId: CardId, attacker: PlayerId, target: PlayerId) {
    for (const skill of this.getPlayerById(target).getSkills<FilterSkill>('filter')) {
      if (!skill.canBeUsedCard(cardId, (this as unknown) as Room, target, attacker)) {
        return false;
      }
    }

    return true;
  }

  public async kill(deadPlayer: Player): Promise<void> {
    deadPlayer.clearMarks();
    deadPlayer.clearFlags();
    deadPlayer.bury();
  }

  public canUseCardTo(cardId: CardId | CardMatcher, target: PlayerId): boolean {
    const player = this.getPlayerById(target);

    const skills = player.getSkills<FilterSkill>('filter');
    for (const skill of skills) {
      if (!skill.canBeUsedCard(cardId, this, target)) {
        return false;
      }
    }

    return true;
  }

  public canPlaceCardTo(cardId: CardId, target: PlayerId): boolean {
    const player = this.getPlayerById(target);
    const card = Sanguosha.getCardById(cardId);

    if (card.is(CardType.Equip)) {
      const equipCard = card as EquipCard;
      return player.getEquipment(equipCard.EquipType) === undefined;
    } else if (card.is(CardType.DelayedTrick)) {
      const toJudgeArea = player.getCardIds(PlayerCardsArea.JudgeArea).map(id => Sanguosha.getCardById(id).GeneralName);
      return !toJudgeArea.includes(card.GeneralName) && this.canUseCardTo(cardId, target);
    }

    return false;
  }

  public clearFlags(player: PlayerId) {
    this.getPlayerById(player).clearFlags();
  }
  public removeFlag(player: PlayerId, name: string) {
    this.getPlayerById(player).removeFlag(name);
  }
  public setFlag<T>(player: PlayerId, name: string, value: T, invisible?: boolean): T {
    return this.getPlayerById(player).setFlag(name, value);
  }
  public getFlag<T>(player: PlayerId, name: string): T {
    return this.getPlayerById(player).getFlag(name);
  }

  public clearMarks(player: PlayerId) {
    this.getPlayerById(player).clearMarks();
  }
  public removeMark(player: PlayerId, name: string) {
    this.getPlayerById(player).removeMark(name);
  }
  public setMark(player: PlayerId, name: string, value: number) {
    return this.getPlayerById(player).setMark(name, value);
  }
  public addMark(player: PlayerId, name: string, value: number) {
    return this.getPlayerById(player).addMark(name, value);
  }
  public getMark(player: PlayerId, name: string) {
    return this.getPlayerById(player).getMark(name);
  }

  public sortPlayersByPosition(players: PlayerId[]) {
    players.sort((prev, next) => {
      const prevPosition = this.getPlayerById(prev).Position;
      const nextPosition = this.getPlayerById(next).Position;
      if (prevPosition < nextPosition) {
        return -1;
      } else if (prevPosition === nextPosition) {
        return 0;
      }
      return 1;
    });

    if (players.find(playerId => this.getPlayerById(playerId).Position >= this.CurrentPlayer.Position)) {
      while (this.getPlayerById(players[0]).Position < this.CurrentPlayer.Position) {
        const topPlayer = players.shift();
        players.push(topPlayer!);
      }
    }
  }

  public getRoomInfo(): RoomInfo {
    return {
      name: this.gameInfo.roomName,
      activePlayers: this.players.length,
      totalPlayers: this.gameInfo.numberOfPlayers,
      packages: this.gameInfo.characterExtensions,
      status: this.gameStarted ? 'playing' : 'waiting',
      id: this.roomId,
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

  public getGameWinners(): Player[] | undefined {
    const rebellion: Player[] = [];
    let renegade: Player | undefined;
    const loyalist: Player[] = [];
    let lordDied = false;

    for (const player of this.players) {
      if (player.Dead) {
        if (player.Role === PlayerRole.Lord) {
          lordDied = true;
        }
        continue;
      }

      switch (player.Role) {
        case PlayerRole.Lord:
        case PlayerRole.Loyalist:
          loyalist.push(player);
          break;
        case PlayerRole.Rebel:
          rebellion.push(player);
          break;
        case PlayerRole.Renegade:
          renegade = player;
          break;
        default:
      }
    }

    if (lordDied) {
      if (rebellion.length > 0) {
        return this.players.filter(player => player.Role === PlayerRole.Rebel);
      } else if (renegade) {
        return [renegade];
      }
    } else if (renegade === undefined && rebellion.length === 0) {
      return this.players.filter(player => player.Role === PlayerRole.Lord || player.Role === PlayerRole.Loyalist);
    }
  }

  public gameOver() {
    this.gameOvered = true;
  }

  public isGameOver() {
    return this.gameOvered;
  }

  public get AwaitingResponseEvent() {
    return this.awaitResponseEvent;
  }

  public setAwaitingResponseEvent(identifier: GameEventIdentifiers, content: EventPicker<GameEventIdentifiers, T>) {
    this.awaitResponseEvent = {
      identifier,
      content,
    };
  }
  public unsetAwaitingResponseEvent() {
    this.awaitResponseEvent = undefined;
  }
}
