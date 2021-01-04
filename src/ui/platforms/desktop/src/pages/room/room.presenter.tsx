import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import type { ServerEventFinder } from 'core/event/event';
import { GameEventIdentifiers } from 'core/event/event';
import type { GameInfo } from 'core/game/game_props';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import type { PlayerId, PlayerInfo } from 'core/player/player_props';
import type { RoomId } from 'core/room/room';
import { ClientRoom } from 'core/room/room.client';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Skill } from 'core/skills/skill';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as React from 'react';
import { AnimationPosition } from './animations/position';
import { Conversation, ConversationProps } from './ui/conversation/conversation';
import { CardCategoryDialog, CardCategoryDialogProps } from './ui/dialog/card_category_dialog/card_category_dialog';

type ClientRoomInfo = {
  roomId: number;
  playerName: string;
  socket: ClientSocket;
  timestamp: number;
};

export class RoomStore {
  @mobx.observable.ref
  clientRoomInfo: ClientRoomInfo;
  @mobx.observable.ref
  room: ClientRoom;

  @mobx.observable.ref
  clientPlayerId: PlayerId;

  @mobx.observable.ref
  selectorDialog: JSX.Element | undefined;

  @mobx.observable.ref
  incomingConversation: JSX.Element | undefined;

  @mobx.observable.shallow
  gameLog: (string | JSX.Element)[] = [];
  @mobx.observable.shallow
  messageLog: (string | JSX.Element)[] = [];

  @mobx.observable.shallow
  displayedCards: { card: Card; tag?: string }[] = [];

  @mobx.observable.ref
  canReforge: boolean = false;

  @mobx.observable.ref
  updateUIFlag: boolean = false;

  @mobx.observable.ref
  animationPosition = new AnimationPosition();

  @mobx.observable.ref
  actionButtonStatus: {
    confirm: boolean;
    cancel: boolean;
    finish: boolean;
    reforge: boolean;
  } = {
    confirm: false,
    cancel: false,
    finish: false,
    reforge: false,
  };

  @mobx.observable.ref
  selectedSkill: Skill | undefined;

  @mobx.observable.ref
  awaitingResponseEvent: {
    identifier: GameEventIdentifiers;
    event: ServerEventFinder<GameEventIdentifiers>;
  } = {} as any;

  @mobx.observable.ref
  inAction: boolean;
  @mobx.observable.shallow
  notifiedPlayers: PlayerId[] = [];

  @mobx.observable.ref
  numberOfDrawStack: number;
  @mobx.observable.ref
  currentRound: number = -1;

  @mobx.observable.ref
  notificationTime: number = 60;

  @mobx.observable.ref
  delightedPlayers: boolean | undefined = false;
  @mobx.observable.ref
  highlightedCards: boolean | undefined = true;
  @mobx.observable.shallow
  selectedCards: CardId[] = [];
  @mobx.observable.shallow
  selectedPlayers: ClientPlayer[] = [];

  @mobx.observable.ref
  incomingUserMessages: {
    [K in PlayerId]: string;
  } = {};

  @mobx.observable.ref
  onceSkillUsedHistory: {
    [K in PlayerId]: string[];
  } = {};

  @mobx.observable.ref
  clientPlayerCardActionsMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  clientPlayerOutsideCardActionsMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  onClickHandCardToPlay: (card: Card, selected: boolean) => void;
  @mobx.observable.ref
  onClickEquipmentToDoAction: (card: Card, selected: boolean) => void;
  @mobx.observable.ref
  playersHighlightedMatcher: (player: Player) => boolean;
  @mobx.observable.ref
  playersSelectionMatcher: (player: Player) => boolean;
  @mobx.observable.ref
  cardSkillsSelectionMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  onClickPlayer: (player: Player, selected: boolean) => void;
  @mobx.observable.ref
  onClickSkill: (skill: Skill, selected: boolean) => void;
  @mobx.observable.ref
  isSkillDisabled: (skill: Skill) => boolean = () => false;

  @mobx.observable.ref
  confirmButtonAction: (() => void) | undefined;
  @mobx.observable.ref
  cancelButtonAction: (() => void) | undefined;
  @mobx.observable.ref
  finishButtonAction: (() => void) | undefined;
  @mobx.observable.ref
  reforgeButtonAction: (() => void) | undefined;
}

export class RoomPresenter {
  constructor(private imageLoader: ImageLoader) {}

  private store: RoomStore;
  public createStore() {
    this.store = new RoomStore();
    return this.store;
  }

  private tryToThrowUninitializedError() {
    Precondition.assert(this.store !== undefined, 'Uninitialized room store');
  }

  @mobx.computed
  get ClientPlayer(): ClientPlayer | undefined {
    return this.store.room?.getPlayerById(this.store.clientPlayerId);
  }

  @mobx.action
  broadcastUIUpdate() {
    this.store.updateUIFlag = !this.store.updateUIFlag;
  }

  @mobx.action
  setupRoomStatus(info: ClientRoomInfo) {
    this.store.clientRoomInfo = info;
  }

  @mobx.action
  setupClientPlayerId(playerId: PlayerId) {
    this.store.clientPlayerId = playerId;
  }

  @mobx.action
  enableActionButton(...buttons: ('confirm' | 'cancel' | 'finish' | 'reforge')[]) {
    buttons.forEach(btn => (this.store.actionButtonStatus[btn] = true));
  }
  @mobx.action
  disableActionButton(...buttons: ('confirm' | 'cancel' | 'finish' | 'reforge')[]) {
    buttons.forEach(btn => (this.store.actionButtonStatus[btn] = false));
  }

  @mobx.action
  playerEnter(playerInfo: PlayerInfo) {
    this.tryToThrowUninitializedError();
    const player = new ClientPlayer(playerInfo.Id, playerInfo.Name, playerInfo.Position, playerInfo.CharacterId);
    this.store.room.addPlayer(player);
    this.broadcastUIUpdate();
  }

  @mobx.action
  playerLeave(playerId: PlayerId, quit?: boolean) {
    this.tryToThrowUninitializedError();
    if (this.store.room.isPlaying()) {
      this.store.room.getPlayerById(playerId).setOffline(quit);
    } else {
      this.store.room.removePlayer(playerId);
      this.broadcastUIUpdate();
    }
  }

  @mobx.action
  createClientRoom(roomId: RoomId, socket: ClientSocket, gameInfo: GameInfo, playersInfo: PlayerInfo[]) {
    this.tryToThrowUninitializedError();
    const players = playersInfo.map(
      playerInfo => new ClientPlayer(playerInfo.Id, playerInfo.Name, playerInfo.Position, playerInfo.CharacterId),
    );

    this.store.room = new ClientRoom(roomId, socket, gameInfo, players, new RecordAnalytics());
    this.broadcastUIUpdate();
  }

  @mobx.action
  addGameLog(log: string | JSX.Element) {
    this.store.gameLog.push(log);
  }
  @mobx.action
  addUserMessage(text: string | JSX.Element) {
    this.store.messageLog.push(text);
  }

  @mobx.action
  showCards(...cards: { card: Card; tag?: string }[]) {
    if (this.store.displayedCards.length >= 7) {
      this.store.displayedCards = [];
    }

    for (const card of cards) {
      this.store.displayedCards.push(card);
    }
  }

  @mobx.action
  createDialog = (dialog: JSX.Element) => {
    this.store.selectorDialog = dialog;
  };

  @mobx.action
  createCardCategoryDialog = (
    props: Pick<CardCategoryDialogProps, Exclude<keyof CardCategoryDialogProps, 'imageLoader'>>,
  ) => {
    this.store.selectorDialog = <CardCategoryDialog imageLoader={this.imageLoader} {...props} />;
  };

  @mobx.action
  closeDialog() {
    this.store.selectorDialog = undefined;
  }

  @mobx.action
  createIncomingConversation = (props: ConversationProps) => {
    if (props.optionsActionHanlder) {
      for (const [option, action] of Object.entries(props.optionsActionHanlder)) {
        props.optionsActionHanlder[option] = () => {
          this.closeIncomingConversation();
          action();
        };
      }
    }
    this.store.incomingConversation = <Conversation {...props} />;
  };

  @mobx.action
  enableCardReforgeStatus() {
    this.store.canReforge = true;
  }
  @mobx.action
  disableCardReforgeStatus() {
    this.store.canReforge = false;
  }

  @mobx.action
  closeIncomingConversation() {
    this.store.incomingConversation = undefined;
  }

  @mobx.action
  setupClientPlayerCardActionsMatcher(matcher: (card: Card) => boolean) {
    this.store.clientPlayerCardActionsMatcher = matcher;
  }
  @mobx.action
  setupClientPlayerOutsideCardActionsMatcher(matcher: (card: Card) => boolean) {
    this.store.clientPlayerOutsideCardActionsMatcher = matcher;
  }
  @mobx.action
  onClickPlayerCard(handler: (card: Card, selected: boolean) => void) {
    this.store.onClickHandCardToPlay = handler;
  }
  @mobx.action
  onClickEquipment(handler: (card: Card, selected: boolean) => void) {
    this.store.onClickEquipmentToDoAction = handler;
  }

  @mobx.action
  setupPlayersHighlightedStatus(matcher: (player: Player) => boolean) {
    this.store.playersHighlightedMatcher = matcher;
  }
  @mobx.action
  setupPlayersSelectionMatcher(matcher: (player: Player) => boolean) {
    this.store.playersSelectionMatcher = matcher;
  }
  @mobx.action
  setupCardSkillSelectionMatcher(matcher: (card: Card) => boolean) {
    this.store.cardSkillsSelectionMatcher = matcher;
  }
  @mobx.action
  onClickPlayer(handler: (player: Player, selected: boolean) => void) {
    this.store.onClickPlayer = handler;
  }
  @mobx.action
  onClickSkill(handler: (skill: Skill, selected: boolean) => void) {
    this.store.onClickSkill = handler;
  }

  @mobx.action
  isSkillDisabled(handler: (skill: Skill) => boolean) {
    this.store.isSkillDisabled = handler;
  }

  @mobx.action
  resetSelectedSkill() {
    this.store.selectedSkill = undefined;
  }

  @mobx.action
  defineConfirmButtonActions(handler: () => void) {
    this.store.confirmButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.confirm = false;
      this.store.confirmButtonAction = undefined;
      handler();
    });
  }

  @mobx.action
  defineReforgeButtonActions(handler: () => void) {
    this.store.reforgeButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.reforge = false;
      this.store.actionButtonStatus.confirm = false;
      this.store.reforgeButtonAction = undefined;
      handler();
    });
  }

  @mobx.action
  defineFinishButtonActions(handler: () => void) {
    this.store.actionButtonStatus.finish = true;
    this.store.finishButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.finish = false;
      this.store.actionButtonStatus.confirm = false;
      this.store.actionButtonStatus.cancel = false;
      this.store.actionButtonStatus.reforge = false;
      this.store.finishButtonAction = undefined;
      handler();
    });
  }
  @mobx.action
  defineCancelButtonActions(handler: () => void) {
    this.store.actionButtonStatus.cancel = true;
    this.store.cancelButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.cancel = false;
      this.store.actionButtonStatus.confirm = false;
      this.store.actionButtonStatus.reforge = false;
      this.store.cancelButtonAction = undefined;
      handler();
    });
  }

  @mobx.action
  endAction() {
    this.store.inAction = false;
    delete this.store.awaitingResponseEvent.identifier;
    delete this.store.awaitingResponseEvent.event;
  }
  @mobx.action
  startAction(identifier: GameEventIdentifiers, event: ServerEventFinder<GameEventIdentifiers>) {
    this.store.inAction = true;
    this.store.awaitingResponseEvent = {
      identifier,
      event,
    };
  }

  @mobx.action
  clearSelectedCards() {
    this.store.selectedCards = [];
  }
  @mobx.action
  selectCard(card: Card) {
    this.store.selectedCards.push(card.Id);
  }
  @mobx.action
  unselectCard(card: Card) {
    const index = this.store.selectedCards.findIndex(selected => selected === card.Id);
    index >= 0 && this.store.selectedCards.splice(index, 1);
  }

  @mobx.action
  clearSelectedPlayers() {
    this.store.selectedPlayers = [];
  }
  @mobx.action
  selectPlayer(player: ClientPlayer) {
    this.store.selectedPlayers.push(player);
  }
  @mobx.action
  unselectPlayer(player: ClientPlayer) {
    const index = this.store.selectedPlayers.findIndex(selected => selected === player);
    index >= 0 && this.store.selectedPlayers.splice(index, 1);
  }

  @mobx.action
  notify(toIds: PlayerId[], notificationTime: number) {
    this.store.notifiedPlayers.push(...toIds);
    this.store.notificationTime = notificationTime;
  }
  @mobx.action
  clearNotifiers() {
    this.store.notifiedPlayers.splice(0, this.store.notifiedPlayers.length);
  }

  @mobx.action
  updateNumberOfDrawStack(numberOfDrawStack: number) {
    if (numberOfDrawStack !== undefined) {
      this.store.numberOfDrawStack = numberOfDrawStack;
    }
  }

  @mobx.action
  updateGameRound(round: number) {
    if (round !== undefined) {
      this.store.currentRound = round;
    }
  }

  @mobx.action
  delightPlayers(delight?: boolean) {
    this.store.delightedPlayers = delight;
  }
  @mobx.action
  highlightCards(highlight?: boolean) {
    this.store.highlightedCards = highlight;
  }

  @mobx.action
  onIncomingMessage(player: PlayerId, message?: string) {
    if (message === undefined) {
      delete this.store.incomingUserMessages[player];
    } else {
      this.store.incomingUserMessages[player] = message;
    }
  }

  @mobx.action
  onceSkillUsed(player: PlayerId, skillName: string) {
    if (!this.store.onceSkillUsedHistory[player]) {
      this.store.onceSkillUsedHistory[player] = [skillName];
    } else {
      this.store.onceSkillUsedHistory[player].push(skillName);
    }
  }
}
