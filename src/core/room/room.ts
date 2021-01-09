import { Card, CardType, VirtualCard } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterId } from 'core/characters/character';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { PinDianReport } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { AllStage, GameEventStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Socket } from 'core/network/socket';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { JudgeMatcherEnum } from 'core/shares/libs/judge_matchers';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { System } from 'core/shares/libs/system';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { FilterSkill, RulesBreakerSkill, TransformSkill } from 'core/skills/skill';
import { PatchedTranslationObject } from 'core/translations/translation_json_tool';

export type RoomId = number;

export abstract class Room<T extends WorkPlace = WorkPlace> {
  public get GameParticularAreas() {
    return ['muniuliuma'];
  }

  protected abstract readonly analytics: RecordAnalytics;

  protected abstract readonly socket: Socket<T>;
  protected abstract readonly gameInfo: GameInfo;
  protected abstract readonly players: Player[];
  protected abstract readonly roomId: RoomId;
  protected abstract readonly gameMode: GameMode;
  protected round: number = 0;

  protected awaitResponseEvent: {
    [K in PlayerId]?: {
      identifier: GameEventIdentifiers;
      content: EventPicker<GameEventIdentifiers, T>;
    };
  } = {};

  protected gameStarted: boolean = false;
  protected gameOvered: boolean = false;
  private onProcessingCards: { [K: string]: CardId[] } = {};
  protected sideEffectSkills: { [N in System.SideEffectSkillApplierEnum]?: string } = {};

  protected abstract init(...args: any[]): void;
  //Server only
  public abstract notify<I extends GameEventIdentifiers>(type: I, content: EventPicker<I, T>, player: PlayerId): void;
  //Server only
  public abstract doNotify(toIds: PlayerId[], notificationTime?: number): void;

  public abstract broadcast<I extends GameEventIdentifiers>(type: I, content: EventPicker<I, T>): void;

  //Server only
  public abstract shuffle(): void;
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
  public abstract async asyncMoveCards(events: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>[]): Promise<void>;
  //Server only
  public abstract getRandomCharactersFromLoadedPackage(
    numberOfCharacter: number,
    except?: CharacterId[],
  ): CharacterId[];
  //Server only
  public abstract changePlayerProperties(
    event: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent>,
  ): void;
  //Server only
  public abstract async onReceivingAsyncResponseFrom<T extends GameEventIdentifiers>(
    identifier: T,
    playerId?: PlayerId,
  ): Promise<ClientEventFinder<T>>;
  public abstract insertPlayerRound(player: PlayerId): void;
  public abstract insertPlayerPhase(player: PlayerId, phase: PlayerPhase): void;
  public abstract isExtraPhase(): boolean;
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
    judgeMatcherEnum?: JudgeMatcherEnum,
  ): Promise<ServerEventFinder<GameEventIdentifiers.JudgeEvent>>;
  //Server only
  public abstract async responseCard(
    event: ServerEventFinder<GameEventIdentifiers.CardResponseEvent>,
  ): Promise<boolean>;
  //Server only
  public abstract async chainedOn(playerId: PlayerId): Promise<void>;
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
  public abstract async loseSkill(playerId: PlayerId, skillName: string | string[], broadcast?: boolean): Promise<void>;
  //Server only
  public abstract async obtainSkill(playerId: PlayerId, skillName: string, broadcast?: boolean): Promise<void>;
  //Server only
  public abstract async pindian(fromId: PlayerId, toIds: PlayerId[]): Promise<PinDianReport>;
  public abstract async turnOver(playerId: PlayerId): Promise<void>;

  //Server only
  public abstract clearHeaded(toId: PlayerId): void;

  public abstract async gameStart(...args: any[]): Promise<void>;
  public abstract get CurrentPlayerStage(): PlayerPhaseStages;
  public abstract get CurrentPlayerPhase(): PlayerPhase;
  public abstract get CurrentPhasePlayer(): Player;
  public abstract get CurrentPlayer(): Player;
  //Server only
  public abstract get CurrentProcessingStage(): GameEventStage | undefined;
  //Server only
  public abstract syncGameCommonRules(playerId: PlayerId, updateActions: (user: Player) => void): void;
  //Server only
  public abstract async askForCardDrop(
    playerId: PlayerId,
    discardAmount: number,
    fromArea: PlayerCardsArea[],
    uncancellable?: boolean,
    except?: CardId[],
    bySkill?: string,
    conversation?: string | PatchedTranslationObject,
  ): Promise<ClientEventFinder<GameEventIdentifiers.AskForCardDropEvent>>;
  //Server only
  public abstract async askForCardUse(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>,
    to: PlayerId,
  ): Promise<ClientEventFinder<GameEventIdentifiers.AskForCardUseEvent>>;
  //Server only
  public abstract async askForCardResponse(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>,
    to: PlayerId,
  ): Promise<ClientEventFinder<GameEventIdentifiers.AskForCardResponseEvent>>;
  //Server only
  public abstract findCardsByMatcherFrom(cardMatcher: CardMatcher, fromDrawStack?: boolean): CardId[];
  //Server only
  public abstract displayCards(fromId: PlayerId, displayCards: CardId[], translations?: PatchedTranslationObject): void;
  public abstract isCardInDropStack(cardId: CardId): boolean;
  public abstract isCardInDrawStack(cardId: CardId): boolean;
  public abstract getCardsByNameFromStack(cardName: string, stackName: 'draw' | 'drop', amount?: number): CardId[];

  public abstract setCharacterOutsideAreaCards(
    player: PlayerId,
    areaName: string,
    characterIds: CharacterId[],
    translationsMessage?: PatchedTranslationObject,
    unengagedMessage?: PatchedTranslationObject,
  ): void;

  public abstract async skip(player: PlayerId, phase?: PlayerPhase): Promise<void>;
  public abstract endPhase(phase: PlayerPhase): void;

  public updatePlayerStatus(status: 'online' | 'offline' | 'quit' | 'trusted' | 'trusted' | 'player', toId: PlayerId) {
    const to = this.getPlayerById(toId);
    switch (status) {
      case 'online':
        to.setOnline();
        break;
      case 'offline':
        to.setOffline();
        break;
      case 'quit':
        to.setOffline(true);
        break;
      case 'trusted':
        to.delegateOnTrusted(true);
        break;
      case 'player':
        to.delegateOnTrusted(false);
        break;
      default:
        throw Precondition.UnreachableError(status);
    }
  }

  public getSideEffectSkills(player: Player) {
    const skills: string[] = [];
    for (const [applierEnumString, skillName] of Object.entries(this.sideEffectSkills)) {
      if (System.SideEffectSkillAppliers[applierEnumString](player, this)) {
        skills.push(skillName!);
      }
    }

    return skills;
  }

  public installSideEffectSkill(applier: System.SideEffectSkillApplierEnum, skillName: string) {
    this.sideEffectSkills[applier] = skillName;
  }

  public uninstallSideEffectSkill(applier: System.SideEffectSkillApplierEnum) {
    delete this.sideEffectSkills[applier];
  }

  public readonly sleep = async (timeDuration: number) =>
    new Promise(r => {
      setTimeout(r, timeDuration);
    });

  public addProcessingCards(tag: string, ...cardIds: CardId[]) {
    this.onProcessingCards[tag] = this.onProcessingCards[tag] || [];

    for (const cardId of cardIds) {
      if (!cardId) {
        continue;
      }
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

  public async useCard(
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>,
    declared?: boolean,
  ): Promise<void> {
    if (content.fromId) {
      const from = this.getPlayerById(content.fromId);
      if (this.CurrentPlayer.Id === content.fromId && !content.extraUse) {
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

  public getAllPlayersFrom(playerId?: PlayerId, startsFromNext: boolean = false) {
    playerId = playerId === undefined ? this.CurrentPlayer.Id : playerId;
    while (this.getPlayerById(playerId).Dead) {
      playerId = this.getNextAlivePlayer(playerId).Id;
    }

    const players = this.Players;
    const fromIndex = players.findIndex(player => player.Id === playerId);

    Precondition.assert(fromIndex >= 0, `Player ${playerId} is dead or doesn't exist`);

    return [...players.slice(startsFromNext ? fromIndex + 1 : fromIndex), ...players.slice(0, fromIndex)];
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
        from.getCardUsableDistance(this, slash, to) -
        Sanguosha.getCardById(slash).EffectUseDistance;
    }

    return (
      from.getAttackDistance(this) + additionalAttackDistance >= seatDistance &&
      this.canUseCardTo(slash || new CardMatcher({ generalName: ['slash'] }), to.Id)
    );
  }

  public distanceBetween(from: Player, to: Player) {
    if (from === to) {
      return 0;
    }

    for (const skill of from.getPlayerSkills<RulesBreakerSkill>('breaker')) {
      const breakDistance = skill.breakDistanceTo(this, from, to);
      if (breakDistance > 0) {
        return breakDistance;
      }
    }

    const seatGap = to.getDefenseDistance(this) - from.getOffenseDistance(this);
    return Math.max(this.onSeatDistance(from, to) + seatGap, 1);
  }
  public cardUseDistanceBetween(room: Room, cardId: CardId, from: Player, to: Player) {
    const card = Sanguosha.getCardById(cardId);

    return Math.max(
      this.distanceBetween(from, to) - GameCommonRules.getCardAdditionalUsableDistance(room, from, card, to),
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

  public abstract async kill(deadPlayer: Player, killedBy?: PlayerId): Promise<void>;

  public canUseCardTo(cardId: CardId | CardMatcher, target: PlayerId): boolean {
    const player = this.getPlayerById(target);
    return player.canUseCardTo(this, cardId, target);
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

  public canPindian(fromId: PlayerId, targetId: PlayerId): boolean {
    const target = this.getPlayerById(targetId);
    const targetSkills = target.getPlayerSkills<FilterSkill>('filter');
    return (
      fromId !== targetId && targetSkills.find(skill => !skill.canBePindianTarget(this, targetId, fromId)) === undefined
    );
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

  public transformCard(
    player: Player,
    cardIds: CardId[],
    toArea: PlayerCardsArea.EquipArea | PlayerCardsArea.HandArea,
  ): void;
  public transformCard(player: Player, judgeEvent: ServerEventFinder<GameEventIdentifiers.JudgeEvent>): void;
  public transformCard(
    player: Player,
    judgeEventOrCards: ServerEventFinder<GameEventIdentifiers.JudgeEvent> | CardId[],
    toArea?: PlayerCardsArea.EquipArea | PlayerCardsArea.HandArea,
  ) {
    const transformSkills = player.getSkills<TransformSkill>('transform');
    if (!(judgeEventOrCards instanceof Array)) {
      const judgeEvent = judgeEventOrCards as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;
      for (const skill of transformSkills.filter(skill => skill.includesJudgeCard())) {
        if (!Card.isVirtualCardId(judgeEvent.judgeCardId) && skill.canTransform(judgeEvent.judgeCardId)) {
          judgeEvent.judgeCardId = skill.forceToTransformCardTo(judgeEvent.judgeCardId).Id;
          break;
        }
      }
      return;
    }

    const cards = judgeEventOrCards as CardId[];
    for (const skill of transformSkills) {
      for (let i = 0; i < cards.length; i++) {
        if (
          Card.isVirtualCardId(cards[i]) &&
          Sanguosha.getCardById<VirtualCard>(cards[i]).GeneratedBySkill === skill.GeneralName
        ) {
          continue;
        }

        if (skill.canTransform(cards[i], toArea)) {
          cards[i] = skill.forceToTransformCardTo(cards[i]).Id;
        }
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
      gameMode: this.gameInfo.gameMode,
      passcode: this.gameInfo.passcode,
    };
  }

  public get RoomId() {
    return this.roomId;
  }

  public get Info() {
    return this.gameInfo;
  }

  public get Analytics(): RecordAnalytics {
    return this.analytics;
  }

  public nextRound() {
    this.round++;
  }

  public get Round() {
    return this.round;
  }
  public set Round(round: number) {
    this.round = round;
  }

  public isPlaying() {
    return this.gameStarted;
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

  public setAwaitingResponseEvent(
    identifier: GameEventIdentifiers,
    content: EventPicker<GameEventIdentifiers, T>,
    toId: PlayerId,
  ) {
    this.awaitResponseEvent[toId] = {
      identifier,
      content,
    };
  }
  public unsetAwaitingResponseEvent(toId?: PlayerId) {
    if (toId === undefined) {
      this.awaitResponseEvent = {};
    } else {
      delete this.awaitResponseEvent[toId];
    }
  }
}
