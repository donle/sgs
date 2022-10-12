import { Card } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers } from 'core/event/event';
import type { ServerEventFinder } from 'core/event/event';
import type { GameInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ClientSocket } from 'core/network/socket.client';
import { Player } from 'core/player/player';
import { ClientPlayer } from 'core/player/player.client';
import type { PlayerId, PlayerInfo, PlayerShortcutInfo } from 'core/player/player_props';
import type { RoomId } from 'core/room/room';
import { ClientRoom } from 'core/room/room.client';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Skill } from 'core/skills/skill';
import { ImageLoader } from 'image_loader/image_loader';
import * as mobx from 'mobx';
import * as React from 'react';
import { Point } from './animations/position';
import { ClientRoomInfo, DisplayCardProp, RoomStore } from './room.store';
import { Conversation, ConversationProps } from './ui/conversation/conversation';
import { CardCategoryDialog, CardCategoryDialogProps } from './ui/dialog/card_category_dialog/card_category_dialog';

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
    const player = new ClientPlayer(
      playerInfo.Id,
      playerInfo.Name,
      playerInfo.Position,
      playerInfo.CharacterId,
      undefined,
      playerInfo.Status,
    );
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
  createClientRoom(
    roomId: RoomId,
    socket: ClientSocket,
    gameInfo: GameInfo,
    playersInfo: (PlayerShortcutInfo | PlayerInfo)[],
  ) {
    this.tryToThrowUninitializedError();
    const players = playersInfo.map(playerInfo => {
      const player = new ClientPlayer(
        playerInfo.Id,
        playerInfo.Name,
        playerInfo.Position,
        playerInfo.CharacterId,
        undefined,
        playerInfo.Status,
      );

      for (const [key, properties] of Object.entries(playerInfo.Flags)) {
        player.setFlag(key, properties.value, key, properties.visiblePlayers);
      }
      for (const [mark, value] of Object.entries(playerInfo.Marks)) {
        player.setMark(mark, value);
      }

      if ('equipSectionsStatus' in playerInfo) {
        const info = playerInfo as PlayerShortcutInfo;
        player.syncUpPlayer(info);
      }

      return player;
    });

    this.store.room = new ClientRoom(
      roomId,
      socket,
      gameInfo,
      players,
      new RecordAnalytics(),
      new GameCommonRules(),
      new RoomEventStacker(),
    );
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
  showCards(...cards: DisplayCardProp[]) {
    if (this.store.displayedCards.length > 7) {
      const deletedCards: DisplayCardProp[] = [];
      for (let i = 0; i < 7; i++) {
        const cardInfo = this.store.displayedCards[i];
        this.store.displayedCardsAnimationStyles[cardInfo.card.Id] =
          this.store.displayedCardsAnimationStyles[cardInfo.card.Id] || {};
        this.store.displayedCardsAnimationStyles[cardInfo.card.Id].opacity = 0;
        deletedCards.push(cardInfo);
      }
      setTimeout(
        mobx.action(() => {
          for (const cardInfo of deletedCards) {
            this.store.displayedCardsAnimationStyles[cardInfo.card.Id] = {};
          }
          this.store.displayedCards = this.store.displayedCards.filter(card => !deletedCards.includes(card));
        }),
        600,
      );
    }

    for (const card of cards) {
      this.store.displayedCards.push(card);
    }
  }

  @mobx.action
  buryCards(...cards: CardId[]) {
    for (const cardId of cards) {
      const exist = this.store.displayedCards.find(_card => cardId === _card.card.Id);
      if (exist) {
        exist.buried = true;
      }
    }
  }

  private getCardElementPosition(cardId: CardId): Point {
    const cardElement = document.getElementById(cardId.toString());
    if (!cardElement) {
      return { x: 0, y: 0 };
    }

    const offset = this.store.displayedCards.length * 120 > 600 ? 300 : this.store.displayedCards.length * 60;
    return {
      x: cardElement.getBoundingClientRect().x + offset,
      y: cardElement.getBoundingClientRect().y,
    };
  }

  @mobx.action
  playCardAnimation(cardInfo: DisplayCardProp, from?: Point) {
    if (cardInfo.animationPlayed || !document.getElementById(cardInfo.card.Id.toString())) {
      return;
    }

    this.store.displayedCardsAnimationStyles[cardInfo.card.Id] =
      this.store.displayedCardsAnimationStyles[cardInfo.card.Id] || {};

    const cardStyle = this.store.displayedCardsAnimationStyles[cardInfo.card.Id];
    const originalPosition = this.getCardElementPosition(cardInfo.card.Id);

    if (from) {
      cardStyle.transition = 'unset';
      cardStyle.opacity = 0;
      cardStyle.transform = `translate(${from.x - originalPosition.x}px, ${from.y - originalPosition.y}px)`;
    } else {
      delete this.store.displayedCardsAnimationStyles[cardInfo.card.Id];
      cardInfo.animationPlayed = true;
      return;
    }

    setTimeout(
      mobx.action(() => {
        delete this.store.displayedCardsAnimationStyles[cardInfo.card.Id];
        cardInfo.animationPlayed = true;
        this.broadcastUIUpdate();
      }),
      100,
    );
  }

  @mobx.action
  createViewDialog = (dialog: JSX.Element) => {
    this.store.selectorViewDialog = dialog;
  };
  @mobx.action
  closeViewDialog() {
    this.store.selectorViewDialog = undefined;
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
    this.disableActionButton('cancel');
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
  setupClientPlayerHandardsActionsMatcher(matcher: (card: Card) => boolean) {
    this.store.clientPlayerHandcardShowMatcher = matcher;
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
      this.store.actionButtonStatus.cancel = false;
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
    this.store.cancelButtonAction = mobx.action(() => {
      this.store.actionButtonStatus.cancel = false;
      this.store.actionButtonStatus.confirm = false;
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
  setValidSelectionReflectAction(handler: () => void) {
    this.store.validSelectionAction = handler;
  }
  @mobx.action
  clearSelectionReflectAction() {
    this.store.validSelectionAction = undefined;
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
  updateGameCircle(circle: number) {
    if (circle !== undefined) {
      this.store.currentCircle = circle;
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

  @mobx.action
  refreshOnceSkillUsed(player: PlayerId, skillName: string) {
    const history = this.store.onceSkillUsedHistory[player];
    if (history && history.includes(skillName)) {
      const index = history.findIndex(name => name === skillName);
      index !== -1 && history.splice(index, 1);
    }
  }

  @mobx.action
  switchSkillStateChanged(player: PlayerId, skillName: string, initState: boolean = false) {
    if (!this.store.switchSkillState[player]) {
      this.store.switchSkillState[player] = [skillName];
    } else if (!this.store.switchSkillState[player].includes(skillName)) {
      initState || this.store.switchSkillState[player].push(skillName);
    } else {
      const index = this.store.switchSkillState[player].findIndex(name => name === skillName);
      index !== -1 && this.store.switchSkillState[player].splice(index, 1);
    }
  }
}
