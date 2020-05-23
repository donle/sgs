import { Card } from 'core/cards/card';
import type { GameInfo } from 'core/game/game_props';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import type { PlayerId, PlayerInfo } from 'core/player/player_props';
import type { RoomId } from 'core/room/room';
import { ClientRoom } from 'core/room/room.client';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Skill } from 'core/skills/skill';
import * as mobx from 'mobx';
import * as React from 'react';
import { AnimationPosition } from './animations/position';
import { Conversation, ConversationProps } from './ui/conversation/conversation';

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
  displayedCards: Card[] = [];

  @mobx.observable.ref
  updateUIFlag: boolean = false;

  @mobx.observable.ref
  animationPosition = new AnimationPosition();

  @mobx.observable.ref
  actionButtonStatus: {
    confirm: boolean;
    cancel: boolean;
    finish: boolean;
  } = {
    confirm: false,
    cancel: false,
    finish: false,
  };

  @mobx.observable.ref
  selectedSkill: Skill | undefined;

  @mobx.observable.ref
  clientPlayerCardActionsMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  onClickHandCardToPlay: (card: Card, selected: boolean) => void;
  @mobx.observable.ref
  onClickEquipmentToDoAction: (card: Card, selected: boolean) => void;
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
}

export class RoomPresenter {
  private store: RoomStore;
  public createStore() {
    this.store = new RoomStore();
    return this.store;
  }

  private tryToThrowUninitializedError() {
    Precondition.assert(this.store !== undefined, 'Uninitialized room store');
  }

  @mobx.computed
  get ClientPlayer(): Player | undefined {
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
  enableActionButton(...buttons: ('confirm' | 'cancel' | 'finish')[]) {
    buttons.forEach(btn => (this.store.actionButtonStatus[btn] = true));
  }
  @mobx.action
  disableActionButton(...buttons: ('confirm' | 'cancel' | 'finish')[]) {
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
  playerLeave(playerId: PlayerId) {
    this.tryToThrowUninitializedError();
    if (this.store.room.isPlaying()) {
      this.store.room.getPlayerById(playerId).offline();
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

    this.store.room = new ClientRoom(roomId, socket, gameInfo, players);
    this.broadcastUIUpdate();
  }

  @mobx.action
  addGameLog(log: string | JSX.Element) {
    this.store.gameLog.push(log);
  }

  @mobx.action
  showCards(...cards: Card[]) {
    if (this.store.displayedCards.length >= 7) {
      this.store.displayedCards = [];
    }

    for (const card of cards) {
      !this.store.displayedCards.includes(card) && this.store.displayedCards.push(card);
    }
  }

  @mobx.action
  createDialog = (dialog: JSX.Element) => {
    this.store.selectorDialog = dialog;
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
          action();
          this.closeIncomingConversation();
        };
      }
    }
    this.store.incomingConversation = <Conversation {...props} />;
  };

  @mobx.action
  closeIncomingConversation() {
    this.store.incomingConversation = undefined;
  }

  @mobx.action
  setupClientPlayerCardActionsMatcher(matcher: (card: Card) => boolean) {
    this.store.clientPlayerCardActionsMatcher = matcher;
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
  defineFinishButtonActions(handler: () => void) {
    this.store.actionButtonStatus.finish = true;
    this.store.finishButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.finish = false;
      this.store.actionButtonStatus.confirm = false;
      this.store.actionButtonStatus.cancel = false;
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
      this.store.cancelButtonAction = undefined;
      handler();
    });
  }
}
