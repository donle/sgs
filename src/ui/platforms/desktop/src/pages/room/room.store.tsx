import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import type { ServerEventFinder } from 'core/event/event';
import { GameEventIdentifiers } from 'core/event/event';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import type { PlayerId } from 'core/player/player_props';
import { ClientRoom } from 'core/room/room.client';
import { Skill } from 'core/skills/skill';
import * as mobx from 'mobx';
import * as React from 'react';
import { AnimationPosition } from './animations/position';

export type ClientRoomInfo = {
  roomId: number;
  playerName: string;
  socket: ClientSocket;
  timestamp: number;
  playerId: PlayerId;
};

export type DisplayCardProp = {
  card: Card;
  tag?: string;
  buried?: boolean;
  from: Player | undefined;
  to: Player | undefined;
  hiddenMove?: boolean;
  animationPlayed?: boolean;
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
  selectorViewDialog: JSX.Element | undefined;

  @mobx.observable.ref
  incomingConversation: JSX.Element | undefined;

  @mobx.observable.shallow
  gameLog: (string | JSX.Element)[] = [];
  @mobx.observable.shallow
  messageLog: (string | JSX.Element)[] = [];

  @mobx.observable.shallow
  displayedCards: DisplayCardProp[] = [];
  @mobx.observable.shallow
  displayedCardsAnimationStyles: {
    [K in CardId]: React.CSSProperties;
  } = {};

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
  } = {
    confirm: false,
    cancel: false,
    finish: false,
  };

  @mobx.observable.ref
  selectedSkill: Skill | undefined;

  @mobx.observable.ref
  awaitingResponseEvent: {
    identifier?: GameEventIdentifiers;
    event?: ServerEventFinder<GameEventIdentifiers>;
  } = {} as any;

  @mobx.observable.ref
  inAction: boolean;
  @mobx.observable.shallow
  notifiedPlayers: PlayerId[] = [];

  @mobx.observable.ref
  numberOfDrawStack: number;
  @mobx.observable.ref
  currentCircle: number = 0;

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
  switchSkillState: {
    [K in PlayerId]: string[];
  } = {};

  @mobx.observable.ref
  clientPlayerCardActionsMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  clientPlayerOutsideCardActionsMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  clientPlayerHandcardShowMatcher: (card: Card) => boolean;
  @mobx.observable.ref
  clientPlayerOutsideCardShowMatcher: (card: Card) => boolean;
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
  validSelectionAction?: () => void;

  @mobx.observable.ref
  confirmButtonAction: (() => void) | undefined;
  @mobx.observable.ref
  cancelButtonAction: (() => void) | undefined;
  @mobx.observable.ref
  finishButtonAction: (() => void) | undefined;
}
