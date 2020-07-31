import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterId } from 'core/characters/character';
import {
  CardMoveArea,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
  serverResponsiveListenerEvents,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { PlayerPhase } from 'core/game/stage_processor';
import { PlayerCardsArea } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { SkillType } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { AskForPeachAction } from './actions/ask_for_peach_action';
import { CardResponseAction } from './actions/card_response_action';
import { PlayPhaseAction } from './actions/play_phase_action';
import { ResponsiveUseCardAction } from './actions/responsive_card_use_action';
import { SelectAction } from './actions/select_action';
import { SkillUseAction } from './actions/skill_use_action';
import { RoomPresenter, RoomStore } from './room.presenter';
import { CardSelectorDialog } from './ui/dialog/card_selector_dialog/card_selector_dialog';
import { CharacterSelectorDialog } from './ui/dialog/character_selector_dialog/character_selector_dialog';
import { GameOverDialog } from './ui/dialog/game_over_dialog/game_over_dialog';
import { GuanXingDialog } from './ui/dialog/guanxing_dialog/guanxing_dialog';
import { WuGuFengDengDialog } from './ui/dialog/wugufengdeng_dialog/wugufengdeng_dialog';

export class GameClientProcessor {
  private onPlayTrustedActionTimer: NodeJS.Timer | undefined;

  private excludedResponsiveEvents: GameEventIdentifiers[] = [GameEventIdentifiers.UserMessageEvent];

  constructor(
    private presenter: RoomPresenter,
    private store: RoomStore,
    private translator: ClientTranslationModule,
    private imageLoader: ImageLoader,
  ) {}

  private tryToThrowNotReadyException(e: GameEventIdentifiers) {
    if (!this.store.room && e !== GameEventIdentifiers.PlayerEnterEvent) {
      throw new Error('Game client process does not work when client room is not initialized');
    }
  }

  private eventFilter<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (identifier !== GameEventIdentifiers.PlayerEnterEvent) {
      this.store.room.Analytics.record(event, this.store.room.CurrentPlayerPhase);
      if (this.store.room.isPlaying()) {
        const { round, numberOfDrawStack, numberOfDropStack } = EventPacker.getGameRunningInfo(event);
        this.store.room.Round = round;
        this.store.room.DrawStack = numberOfDrawStack;
        this.store.room.DropStack = numberOfDropStack;
      }
    }
    if (identifier !== GameEventIdentifiers.UserMessageEvent) {
      this.presenter.clearNotifiers();
    }
  }

  private record<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (serverResponsiveListenerEvents.includes(identifier) && !this.excludedResponsiveEvents.includes(identifier)) {
      this.presenter.startAction(identifier, event);
      this.onPlayTrustedAction(identifier, event);
    }
  }

  public onPlayTrustedAction<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    this.onPlayTrustedActionTimer = setTimeout(() => {
      const result = this.presenter.ClientPlayer!.AI.onAction(this.store.room, identifier, event) as ClientEventFinder<
        T
      >;
      this.store.room.broadcast(identifier, result);
      this.presenter.closeDialog();
      this.presenter.closeIncomingConversation();

      this.endAction();
    }, this.store.notificationTime * 1000);
  }
  public endAction() {
    if (this.onPlayTrustedActionTimer !== undefined) {
      clearTimeout(this.onPlayTrustedActionTimer);
      this.onPlayTrustedActionTimer = undefined;
    }
    this.presenter.disableActionButton('finish');
    this.store.inAction && this.presenter.endAction();
  }

  async onHandleIncomingEvent<T extends GameEventIdentifiers>(e: T, content: ServerEventFinder<T>) {
    this.tryToThrowNotReadyException(e);
    this.eventFilter(e, content);
    this.record(e, content);

    switch (e) {
      case GameEventIdentifiers.UserMessageEvent:
        this.onHandleUserMessageEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerStatusEvent:
        this.onHandlePlayerStatusEvent(e as any, content);
        break;
      case GameEventIdentifiers.SetFlagEvent:
        this.onHandleSetFlagEvent(e as any, content);
        break;
      case GameEventIdentifiers.RemoveFlagEvent:
        this.onHandleRemoveFlagEvent(e as any, content);
        break;
      case GameEventIdentifiers.ClearFlagEvent:
        this.onHandleClearFlagEvent(e as any, content);
        break;
      case GameEventIdentifiers.AddMarkEvent:
        this.onHandleAddMarkEvent(e as any, content);
        break;
      case GameEventIdentifiers.SetMarkEvent:
        this.onHandleSetMarkEvent(e as any, content);
        break;
      case GameEventIdentifiers.RemoveMarkEvent:
        this.onHandleRemoveMarkEvent(e as any, content);
        break;
      case GameEventIdentifiers.ClearMarkEvent:
        this.onHandleClearMarkEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameReadyEvent:
        await this.onHandleGameReadyEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameStartEvent:
        await this.onHandleGameStartEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerEnterEvent:
        await this.onHandlePlayerEnterEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        await this.onHandlePlayerLeaveEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCharacterEvent:
        await this.onHandleChoosingCharacterEvent(e as any, content);
        break;
      case GameEventIdentifiers.SyncGameCommonRulesEvent:
        await this.onHandleSyncGameCommonRulesEvent(e as any, content);
        break;
      case GameEventIdentifiers.DrawCardEvent:
        await this.onHandleDrawCardsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent:
        await this.onHandlePlayCardStage(e as any, content);
        break;
      case GameEventIdentifiers.PhaseChangeEvent:
        this.onHandlePhaseChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.PhaseStageChangeEvent:
        this.onHandlePhaseStageChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.LoseSkillEvent:
        await this.onHandleLoseSkillEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObtainSkillEvent:
        await this.onHandleObtainSkillEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardUseEvent:
        await this.onHandleCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardResponseEvent:
        await this.onHandleCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardDisplayEvent:
        await this.onHandleCardDisplayEvent(e as any, content);
        break;
      case GameEventIdentifiers.DamageEvent:
        await this.onHandleDamageEvent(e as any, content);
        break;
      case GameEventIdentifiers.LoseHpEvent:
        await this.onHandleLoseHpEvent(e as any, content);
        break;
      case GameEventIdentifiers.ChangeMaxHpEvent:
        await this.onHandleChangeMaxHpEvent(e as any, content);
        break;
      case GameEventIdentifiers.RecoverEvent:
        await this.onHandleRecoverEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardEvent:
        await this.onHandleAskForCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardUseEvent:
        await this.onHandleAskForCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardResponseEvent:
        await this.onHandleAskForCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardDropEvent:
        await this.onHandleAskForCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardDisplayEvent:
        await this.onHandleAskForCardDisplayEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForSkillUseEvent:
        await this.onHandleAskForSkillUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.SkillUseEvent:
        await this.onHandleSkillUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.MoveCardEvent:
        await this.onHandleMoveCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.JudgeEvent:
        await this.onHandleJudgeEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerTurnOverEvent:
        await this.onHandlePlayerTurnOverEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPeachEvent:
        await this.onHandleAskForPeachEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCardFromPlayerEvent:
        await this.onHandleAskForChoosingCardFromPlayerEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCardEvent:
        await this.onHandleAskForChoosingCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.AimEvent:
        await this.onHandleAimEvent(e as any, content);
        break;
      case GameEventIdentifiers.CustomGameDialog:
        await this.onHandleCustomDialogEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPlaceCardsInDileEvent:
        await this.onHandlePlaceCardsInDileEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForContinuouslyChoosingCardEvent:
        await this.onHandleContinuouslyChoosingCard(e as any, content);
        break;
      case GameEventIdentifiers.ObserveCardFinishEvent:
        await this.onHandleContinuouslyChoosingCardFinish(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingOptionsEvent:
        await this.onHandleAskForChoosingOptionsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingPlayerEvent:
        await this.onHandleAskForChoosingPlayerEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPinDianCardEvent:
        await this.onHandleAskForPinDianCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerDyingEvent:
        await this.onHandlePlayerDyingEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerDiedEvent:
        await this.onHandlePlayerDiedEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameOverEvent:
        await this.onHandleGameOverEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObserveCardsEvent:
        await this.onHandleObserveCardsEvent(e as any, content);
        break;
      case GameEventIdentifiers.ChainLockedEvent:
        await this.onHandleChainLockedEvent(e as any, content);
        break;
      case GameEventIdentifiers.DrunkEvent:
        await this.onHandleDrunkEvent(e as any, content);
        break;
      case GameEventIdentifiers.NotifyEvent:
        await this.onHandleNotifyEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerPropertiesChangeEvent:
        await this.onHandlePlayerPropertiesChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.SetOutsideCharactersEvent:
        await this.onHandleSetOutsideCharactersEvent(e as any, content);
        break;
      case GameEventIdentifiers.HuaShenCardUpdatedEvent:
        await this.onHandleHuaShenCardUpdatedEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  private async onHandlePlayerStatusEvent<T extends GameEventIdentifiers.PlayerStatusEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.updatePlayerStatus(content.status, content.toId);
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleUserMessageEvent<T extends GameEventIdentifiers.UserMessageEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.addUserMessage(this.translator.trx(content.message));
    this.presenter.onIncomingMessage(content.playerId, content.originalMessage);
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleSetFlagEvent<T extends GameEventIdentifiers.SetFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).setFlag(content.name, content.value, content.invisible);
  }
  private async onHandleRemoveFlagEvent<T extends GameEventIdentifiers.RemoveFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).removeFlag(content.name);
  }
  private async onHandleClearFlagEvent<T extends GameEventIdentifiers.ClearFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).clearFlags();
  }
  private async onHandleAddMarkEvent<T extends GameEventIdentifiers.AddMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).addMark(content.name, content.value);
  }
  private async onHandleSetMarkEvent<T extends GameEventIdentifiers.SetMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).setMark(content.name, content.value);
  }
  private async onHandleRemoveMarkEvent<T extends GameEventIdentifiers.RemoveMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).removeMark(content.name);
  }
  private async onHandleClearMarkEvent<T extends GameEventIdentifiers.ClearMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).clearMarks();
  }

  private async onHandleAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new CardResponseAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(
      CardResponseAction.isSkillsOnCardResponseDisabled(
        this.store.room,
        new CardMatcher(content.cardMatcher),
        this.store.room.getPlayerById(content.toId),
      ),
    );

    await action.onPlay(this.translator);
    this.endAction();
  }

  private async onHandleAskForPinDianCardEvent<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.randomPinDianCardPlayer.includes(this.store.clientPlayerId)) {
      const handcards = this.presenter.ClientPlayer!.getCardIds(PlayerCardsArea.HandArea);
      const randomCardIndex = Math.floor(Math.random() * handcards.length);
      const event: ClientEventFinder<T> = {
        fromId: content.toId,
        pindianCard: handcards[randomCardIndex],
      };
      this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
      this.endAction();
      return;
    }

    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
    const action = new SelectAction<GameEventIdentifiers.AskForPinDianCardEvent>(
      content.toId,
      this.store,
      this.presenter,
      this.translator,
      EventPacker.createUncancellableEvent(content),
    );
    const selectedCards = await action.onSelectCard([PlayerCardsArea.HandArea], 1);

    this.presenter.closeIncomingConversation();
    const event: ClientEventFinder<T> = {
      fromId: content.toId,
      pindianCard: selectedCards[0],
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
    this.endAction();
  }

  private async onHandleAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.cardAmount <= 0) {
      const event: ClientEventFinder<T> = {
        fromId: content.toId,
        droppedCards: [],
      };
      this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
      this.endAction();
      return;
    }

    this.presenter.createIncomingConversation({
      conversation: content.conversation
        ? content.conversation
        : TranslationPack.translationJsonPatcher('please drop {0} cards', content.cardAmount).extract(),
      translator: this.translator,
    });

    const action = new SelectAction(content.toId, this.store, this.presenter, this.translator, content);
    const selectedCards = await action.onSelectCard(content.fromArea, content.cardAmount, content.except);

    this.presenter.closeIncomingConversation();
    const event: ClientEventFinder<T> = {
      fromId: content.toId,
      droppedCards: selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
    this.endAction();
  }

  private async onHandleAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { cardMatcher, cardAmount, toId, conversation } = content;

    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });

    const action = new SelectAction(
      toId,
      this.store,
      this.presenter,
      this.translator,
      content,
      new CardMatcher(cardMatcher),
    );
    const selectedCards = await action.onSelectCard([PlayerCardsArea.HandArea], cardAmount);

    this.presenter.closeIncomingConversation();
    const displayEvent: ClientEventFinder<T> = {
      fromId: toId,
      selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, displayEvent));
    this.endAction();
  }

  private async onHandleAskForCardEvent<T extends GameEventIdentifiers.AskForCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { cardMatcher, cardAmount, conversation, fromArea, toId, cardAmountRange } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });

    const action = new SelectAction(
      toId,
      this.store,
      this.presenter,
      this.translator,
      content,
      new CardMatcher(cardMatcher),
    );
    const selectedCards = await action.onSelectCard(fromArea, cardAmount || cardAmountRange!);

    this.presenter.closeIncomingConversation();
    const askForCardEvent: ClientEventFinder<GameEventIdentifiers.AskForCardEvent> = {
      fromId: toId,
      selectedCards,
    };
    this.store.room.broadcast(type, askForCardEvent);
    this.endAction();
  }

  private async onHandleAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new ResponsiveUseCardAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(
      ResponsiveUseCardAction.isSkillsOnResponsiveCardUseDisabled(
        this.store.room,
        new CardMatcher(content.cardMatcher),
        this.store.room.getPlayerById(content.toId),
      ),
    );

    await action.onPlay(this.translator);
    this.endAction();
  }

  private async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useCard(content);
    this.presenter.showCards(...Card.getActualCards([content.cardId]).map(cardId => Sanguosha.getCardById(cardId)));
    this.presenter.broadcastUIUpdate();
  }

  private onHandleCardResponseEvent<T extends GameEventIdentifiers.CardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.showCards(...Card.getActualCards([content.cardId]).map(cardId => Sanguosha.getCardById(cardId)));
  }

  private onHandleCardDisplayEvent<T extends GameEventIdentifiers.CardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.showCards(...Card.getActualCards(content.displayCards).map(cardId => Sanguosha.getCardById(cardId)));
  }

  // tslint:disable-next-line:no-empty
  private onHandleAimEvent<T extends GameEventIdentifiers.AimEvent>(type: T, content: ServerEventFinder<T>) {}
  private onHandleDrawCardsEvent<T extends GameEventIdentifiers.DrawCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  private onHandleCustomDialogEvent<T extends GameEventIdentifiers.CustomGameDialog>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  private onHandlePlayerDyingEvent<T extends GameEventIdentifiers.PlayerDyingEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {
    this.store.room.getPlayerById(content.dying).Dying = true;
  }

  private onHandleSetOutsideCharactersEvent<T extends GameEventIdentifiers.SetOutsideCharactersEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { toId, areaName, characterIds, isPublic } = content;
    const player = this.store.room.getPlayerById(toId);
    player.setCharacterOutsideAreaCards(areaName, characterIds);
    isPublic && player.setVisibleOutsideArea(areaName);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleHuaShenCardUpdatedEvent<T extends GameEventIdentifiers.HuaShenCardUpdatedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { toId, latestHuaShen, latestHuaShenSkillName } = content;
    const player = this.store.room.getPlayerById(toId);
    player.setHuaShenInfo({
      skillName: latestHuaShenSkillName,
      characterId: latestHuaShen,
    });
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayerPropertiesChangeEvent<T extends GameEventIdentifiers.PlayerPropertiesChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { changedProperties } = content;
    for (const { toId, characterId, maxHp, hp, nationality, gender } of changedProperties) {
      const player = this.store.room.getPlayerById(toId);
      characterId !== undefined && (player.CharacterId = characterId);
      maxHp !== undefined && (player.MaxHp = maxHp);
      hp !== undefined && (player.Hp = hp);
      nationality !== undefined && (player.Nationality = nationality);
      gender !== undefined && (player.Gender = gender);
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandleNotifyEvent<T extends GameEventIdentifiers.NotifyEvent>(type: T, content: ServerEventFinder<T>) {
    this.presenter.notify(content.toIds, content.notificationTime);
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayerDiedEvent<T extends GameEventIdentifiers.PlayerDiedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { playerId } = content;
    const player = this.store.room.getPlayerById(playerId);
    this.store.room.kill(player);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleDamageEvent<T extends GameEventIdentifiers.DamageEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.changeHp(-content.damage);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleLoseHpEvent<T extends GameEventIdentifiers.LoseHpEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.changeHp(-content.lostHp);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleChangeMaxHpEvent<T extends GameEventIdentifiers.ChangeMaxHpEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.toId);
    player.MaxHp += content.additionalMaxHp;
    if (player.Hp > player.MaxHp) {
      player.Hp = player.MaxHp;
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandleRecoverEvent<T extends GameEventIdentifiers.RecoverEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.Dying = false;
    player.changeHp(content.recoveredHp);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleGameStartEvent<T extends GameEventIdentifiers.GameStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.isSkillDisabled(() => true);
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleGameReadyEvent<T extends GameEventIdentifiers.GameReadyEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    content.playersInfo.forEach(playerInfo => {
      const player = this.store.room.getPlayerById(playerInfo.Id);
      player.Position = playerInfo.Position;
      player.Role = playerInfo.Role!;
    });
    this.store.room.sortPlayers();
    this.presenter.broadcastUIUpdate();
    await this.store.room.gameStart(content.gameStartInfo);
  }

  private onHandlePlayerEnterEvent<T extends GameEventIdentifiers.PlayerEnterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    Precondition.assert(this.store.clientRoomInfo !== undefined, 'Uninitialized Client room info');

    if (
      content.joiningPlayerName === this.store.clientRoomInfo.playerName &&
      content.timestamp === this.store.clientRoomInfo.timestamp
    ) {
      this.presenter.setupClientPlayerId(content.joiningPlayerId);
      this.presenter.createClientRoom(
        this.store.clientRoomInfo.roomId,
        this.store.clientRoomInfo.socket,
        content.gameInfo,
        content.playersInfo,
      );
      this.translator.setupPlayer(this.presenter.ClientPlayer);
      this.store.animationPosition.insertPlayer(content.joiningPlayerId);
    } else {
      const playerInfo = Precondition.exists(
        content.playersInfo.find(playerInfo => playerInfo.Id === content.joiningPlayerId),
        `Unknown player ${content.joiningPlayerName}`,
      );

      this.store.animationPosition.insertPlayer(playerInfo.Id);
      this.presenter.playerEnter(playerInfo);
    }
  }

  private onHandlePlayerLeaveEvent<T extends GameEventIdentifiers.PlayerLeaveEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.playerLeave(content.playerId);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const selectedCharacters: CharacterId[] = [];

    const onClick = (character: Character) => {
      const index = selectedCharacters.indexOf(character.Id);
      if (index === -1) {
        selectedCharacters.push(character.Id);
        if (selectedCharacters.length === content.amount) {
          this.store.confirmButtonAction && this.store.confirmButtonAction();
          return;
        }
      } else {
        selectedCharacters.splice(index, 1);
      }

      if (selectedCharacters.length > 0) {
        this.presenter.enableActionButton('confirm');
        this.presenter.broadcastUIUpdate();
      } else {
        this.presenter.disableActionButton('confirm');
        this.presenter.broadcastUIUpdate();
      }
    };

    this.presenter.defineConfirmButtonActions(() => {
      this.presenter.closeDialog();

      if (!content.byHuaShen) {
        if (this.presenter.ClientPlayer) {
          this.presenter.ClientPlayer.CharacterId = selectedCharacters[0];
        }
      }

      const response: ClientEventFinder<T> = {
        chosenCharacterIds: selectedCharacters,
        fromId: this.store.clientPlayerId,
      };

      this.store.room.broadcast(type, response);
      this.presenter.broadcastUIUpdate();
      this.endAction();
    });

    this.presenter.createDialog(
      <CharacterSelectorDialog
        imageLoader={this.imageLoader}
        characterIds={content.characterIds}
        onClick={onClick}
        translator={this.translator}
        selectedCharacters={selectedCharacters}
      />,
    );
  }

  private onHandleSyncGameCommonRulesEvent<T extends GameEventIdentifiers.SyncGameCommonRulesEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { commonRules, toId } = content;
    GameCommonRules.syncSocketObject(this.store.room.getPlayerById(toId), commonRules);
  }

  private async onHandleAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new SkillUseAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(SkillUseAction.isSkillDisabled(content));
    await action.onSelect(this.translator);
    this.endAction();
  }

  private onHandlePhaseStageChangeEvent<T extends GameEventIdentifiers.PhaseStageChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.CurrentPlayerStage = content.toStage;
  }

  private async onHandleLoseSkillEvent<T extends GameEventIdentifiers.LoseSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.loseSkill(content.toId, content.skillName);
  }

  private onHandleObtainSkillEvent<T extends GameEventIdentifiers.ObtainSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).obtainSkill(content.skillName);
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePhaseChangeEvent<T extends GameEventIdentifiers.PhaseChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.onPhaseTo(content.toPlayer, content.to);
    if (content.to === PlayerPhase.PrepareStage) {
      // content.fromPlayer && this.presenter.isSkillDisabled(PlayPhaseAction.disableSkills);
      this.store.room.turnTo(content.toPlayer);
      this.store.room.Analytics.turnTo(content.toPlayer);
    }

    if (content.fromPlayer) {
      for (const player of this.store.room.AlivePlayers) {
        for (const skill of player.getSkills()) {
          if (this.store.room.CurrentPlayerPhase === PlayerPhase.PrepareStage) {
            player.resetCardUseHistory();
          } else {
            player.resetCardUseHistory('slash');
          }

          if (skill.isRefreshAt(content.to)) {
            player.resetSkillUseHistory(skill.Name);
          }
        }
      }
    }
    this.presenter.broadcastUIUpdate();
  }

  private async onHandlePlayCardStage<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new PlayPhaseAction(content.toId, this.store, this.presenter, this.translator);
    this.presenter.isSkillDisabled(
      PlayPhaseAction.isPlayPhaseSkillsDisabled(this.store.room, this.presenter.ClientPlayer!, content),
    );
    this.presenter.broadcastUIUpdate();
    await action.onPlay();
    this.endAction();
  }

  private onHandleMoveCardEvent<T extends GameEventIdentifiers.MoveCardEvent>(type: T, content: ServerEventFinder<T>) {
    const { toArea, toId, fromId, toOutsideArea, movingCards, isOutsideAreaInPublic } = content;
    const to = toId && this.store.room.getPlayerById(toId);
    const from = fromId ? this.store.room.getPlayerById(fromId) : undefined;

    for (const { card, fromArea, asideMove } of movingCards) {
      if (
        from &&
        !asideMove &&
        ![CardMoveArea.DrawStack, CardMoveArea.DropStack, CardMoveArea.ProcessingArea].includes(
          fromArea as CardMoveArea,
        )
      ) {
        from.dropCards(card);
      }
    }

    const cardIds = movingCards.reduce<CardId[]>((cards, cardInfo) => {
      if (!cardInfo.asideMove) {
        cards.push(cardInfo.card);
      }
      return cards;
    }, []);

    if (
      to &&
      ![CardMoveArea.DrawStack, CardMoveArea.DropStack, CardMoveArea.ProcessingArea].includes(toArea as CardMoveArea)
    ) {
      const actualCardIds = Card.getActualCards(cardIds);
      if (toArea === CardMoveArea.OutsideArea) {
        to.getCardIds((toArea as unknown) as PlayerCardsArea, toOutsideArea).push(...actualCardIds);
      } else if (toArea === CardMoveArea.JudgeArea) {
        const transformedDelayedTricks = cardIds.map(cardId => {
          if (!Card.isVirtualCardId(cardId)) {
            return cardId;
          }

          const card = Sanguosha.getCardById<VirtualCard>(cardId);
          if (card.ActualCardIds.length === 1) {
            const originalCard = Sanguosha.getCardById(card.ActualCardIds[0]);
            if (card.Suit !== originalCard.Suit) {
              card.Suit = originalCard.Suit;
            }
            if (card.CardNumber !== originalCard.CardNumber) {
              card.CardNumber = originalCard.CardNumber;
            }

            return card.Id;
          }

          return cardId;
        });
        to.getCardIds(PlayerCardsArea.JudgeArea).push(...transformedDelayedTricks);
      } else {
        this.store.room.transformCard(
          to,
          actualCardIds,
          toArea as PlayerCardsArea.HandArea | PlayerCardsArea.EquipArea,
        );
        to.getCardIds(toArea as PlayerCardsArea).push(...actualCardIds);
      }
    } else if (toArea === CardMoveArea.DropStack) {
      this.presenter.showCards(...Card.getActualCards(cardIds).map(cardId => Sanguosha.getCardById(cardId)));
    }

    toOutsideArea !== undefined && isOutsideAreaInPublic && to && to.setVisibleOutsideArea(toOutsideArea);

    this.presenter.broadcastUIUpdate();
  }

  private onHandleJudgeEvent<T extends GameEventIdentifiers.JudgeEvent>(type: T, content: ServerEventFinder<T>) {
    const { judgeCardId } = content;
    this.presenter.showCards(Sanguosha.getCardById(judgeCardId));
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayerTurnOverEvent<T extends GameEventIdentifiers.PlayerTurnOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).turnOver();
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const askForPeachMatcher = new CardMatcher({
      name: content.fromId === content.toId ? ['peach', 'alcohol'] : ['peach'],
    });
    this.presenter.isSkillDisabled(
      AskForPeachAction.isSkillDisabled(
        this.store.room,
        content.fromId === content.toId,
        this.store.room.getPlayerById(content.fromId),
      ),
    );
    const action = new AskForPeachAction(
      content.fromId,
      this.store,
      this.presenter,
      content,
      this.translator,
      askForPeachMatcher,
    );
    await action.onPlay(this.translator);
    this.endAction();
  }

  private onHandleAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onSelectedCard = (card: Card | number, fromArea: PlayerCardsArea) => {
      this.presenter.closeDialog();

      const event: ClientEventFinder<T> = {
        fromId: content.fromId,
        fromArea,
        selectedCard: card instanceof Card ? card.Id : undefined,
        selectedCardIndex: card instanceof Card ? undefined : card,
      };
      this.store.room.broadcast(type, event);
      this.endAction();
    };

    this.presenter.createDialog(
      <CardSelectorDialog
        imageLoader={this.imageLoader}
        options={content.options}
        onClick={onSelectedCard}
        translator={this.translator}
        title={content.customMessage}
      />,
    );
  }

  private onHandleAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const selectedCards: CardId[] = [];
    const selectedCardsIndex: number[] = [];
    const onSelectedCard = (card: Card | number) => {
      if (card instanceof Card) {
        const index = selectedCards.findIndex(cardId => cardId === card.Id);
        if (index >= 0) {
          selectedCards.splice(index, 1);
        } else {
          selectedCards.push(card.Id);
        }
      } else {
        const index = selectedCardsIndex.findIndex(cardIndex => cardIndex === card);
        if (index >= 0) {
          selectedCardsIndex.splice(index, 1);
        } else {
          selectedCardsIndex.push(card);
        }
      }

      if (selectedCards.length + selectedCardsIndex.length === content.amount) {
        this.presenter.closeDialog();

        const event: ClientEventFinder<T> = {
          fromId: content.toId,
          selectedCards,
          selectedCardsIndex,
        };
        this.store.room.broadcast(type, event);
        this.endAction();
      }
    };

    const matcher = content.cardMatcher && new CardMatcher(content.cardMatcher);
    const isCardDisabled = matcher ? (card: Card) => !matcher.match(card) : undefined;

    this.presenter.createDialog(
      <CardSelectorDialog
        options={content.cardIds || content.customCardFields!}
        onClick={onSelectedCard}
        translator={this.translator}
        isCardDisabled={isCardDisabled}
        imageLoader={this.imageLoader}
        title={content.customMessage}
      />,
    );

    if (!EventPacker.isUncancellabelEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        this.presenter.closeDialog();

        const event: ClientEventFinder<T> = {
          fromId: content.toId,
        };
        this.store.room.broadcast(type, event);
        this.endAction();
      });
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  private onHandleAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { options, conversation, toId } = content;
    const actionHandlers = {};
    options.forEach(option => {
      actionHandlers[option] = () => {
        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
          selectedOption: option,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.endAction();
        this.presenter.disableActionButton('cancel');
      };
    });

    this.presenter.highlightCards();
    this.presenter.createIncomingConversation({
      optionsActionHanlder: actionHandlers,
      translator: this.translator,
      conversation,
    });

    if (!EventPacker.isUncancellabelEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.endAction();
        this.presenter.closeIncomingConversation();
      });
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  private async onHandleSkillUseEvent<T extends GameEventIdentifiers.SkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useSkill(content);
    const skill = Sanguosha.getSkillBySkillName(content.skillName);
    if (skill.SkillType === SkillType.Limit || skill.SkillType === SkillType.Awaken) {
      this.presenter.onceSkillUsed(content.fromId, content.skillName);
    }
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleGameOverEvent<T extends GameEventIdentifiers.GameOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { winnerIds, loserIds } = content;
    const winners = winnerIds.map(id => this.store.room.getPlayerById(id));
    const losers = loserIds.map(id => this.store.room.getPlayerById(id));
    this.presenter.createDialog(
      <GameOverDialog imageLoader={this.imageLoader} translator={this.translator} winners={winners} losers={losers} />,
    );
    this.presenter.broadcastUIUpdate();
    this.endAction();
    this.store.room.gameOver();
  }

  private async onHandleChainLockedEvent<T extends GameEventIdentifiers.ChainLockedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { toId, linked } = content;
    this.store.room.getPlayerById(toId).ChainLocked = linked;
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleDrunkEvent<T extends GameEventIdentifiers.DrunkEvent>(type: T, content: ServerEventFinder<T>) {
    content.drunk
      ? this.store.room.getPlayerById(content.toId).getDrunk()
      : this.store.room.getPlayerById(content.toId).clearHeaded();
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { players, requiredAmount, conversation } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
    const action = new SelectAction(content.toId, this.store, this.presenter, this.translator, content);
    const selectedPlayers = await action.onSelectPlayer(requiredAmount, players);

    const choosePlayerEvent: ClientEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      fromId: content.toId,
      selectedPlayers,
    };

    this.store.room.broadcast(GameEventIdentifiers.AskForChoosingPlayerEvent, choosePlayerEvent);
    this.endAction();
    this.presenter.closeIncomingConversation();
  }

  private async onHandlePlaceCardsInDileEvent<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const {
      cardIds,
      top,
      bottom,
      toId,
      topStackName,
      bottomStackName,
      movable,
      topMaxCard,
      topMinCard,
      bottomMaxCard,
      bottomMinCard,
    } = content;
    const cards = cardIds.map(cardId => Sanguosha.getCardById(cardId));

    const onConfirm = (top: Card[], bottom: Card[]) => () => {
      const responseEvent: ClientEventFinder<T> = {
        top: top.map(card => card.Id),
        bottom: bottom.map(card => card.Id),
        fromId: toId,
      };

      this.presenter.closeDialog();
      this.store.room.broadcast(GameEventIdentifiers.AskForPlaceCardsInDileEvent, responseEvent);
      this.endAction();
    };

    this.presenter.createDialog(
      <GuanXingDialog
        top={top}
        topStackName={topStackName}
        topMaxCard={topMaxCard}
        topMinCard={topMinCard}
        bottom={bottom}
        bottomStackName={bottomStackName}
        bottomMaxCard={bottomMaxCard}
        bottomMinCard={bottomMinCard}
        imageLoader={this.imageLoader}
        translator={this.translator}
        cards={cards}
        presenter={this.presenter}
        onConfirm={onConfirm}
        movable={movable}
        title={content.triggeredBySkills && content.triggeredBySkills[0]}
      />,
    );
  }

  private async onHandleContinuouslyChoosingCard<T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: 'please choose a card',
      translator: this.translator,
    });

    let selected = false;
    const onClick = (card: Card) => {
      if (selected) {
        return;
      }

      this.presenter.closeIncomingConversation();
      selected = true;
      const responseEvent: ClientEventFinder<T> = {
        fromId: this.store.clientPlayerId,
        selectedCard: card.Id,
      };

      this.store.room.broadcast(type, responseEvent);
      this.endAction();
    };

    this.presenter.createDialog(
      <WuGuFengDengDialog
        imageLoader={this.imageLoader}
        cards={content.cardIds}
        selected={content.selected.map(selectedCard => ({
          card: selectedCard.card,
          playerObjectText:
            selectedCard.player &&
            TranslationPack.patchPlayerInTranslation(this.store.room.getPlayerById(selectedCard.player)),
        }))}
        translator={this.translator}
        onClick={this.store.clientPlayerId === content.toId ? onClick : undefined}
      />,
    );
  }
  private async onHandleObserveCardsEvent<T extends GameEventIdentifiers.ObserveCardsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createDialog(
      <WuGuFengDengDialog
        imageLoader={this.imageLoader}
        cards={content.cardIds}
        unselectable={true}
        highlight={true}
        selected={content.selected.map(selectedCard => ({
          card: selectedCard.card,
          playerObjectText:
            selectedCard.player &&
            TranslationPack.patchPlayerInTranslation(this.store.room.getPlayerById(selectedCard.player)),
        }))}
        translator={this.translator}
      />,
    );
  }

  private async onHandleContinuouslyChoosingCardFinish<T extends GameEventIdentifiers.ObserveCardFinishEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.closeDialog();
  }
}
