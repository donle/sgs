import { Card, CardType, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterGender, CharacterId } from 'core/characters/character';
import {
  CardMoveArea,
  CardMovedBySpecifiedReason,
  CardMoveReason,
  clientAsyncEvents,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
  serverResponsiveListenerEvents,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { System } from 'core/shares/libs/system';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { SkillType } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { CharacterSkinInfo } from 'skins/skins';
import { AudioService } from 'ui/audio/install';
import { AskForPeachAction } from './actions/ask_for_peach_action';
import { CardResponseAction } from './actions/card_response_action';
import { PlayPhaseAction } from './actions/play_phase_action';
import { ResponsiveUseCardAction } from './actions/responsive_card_use_action';
import { SelectAction } from './actions/select_action';
import { SkillUseAction } from './actions/skill_use_action';
import { RoomPresenter } from './room.presenter';
import { DisplayCardProp, RoomStore } from './room.store';
import { CardDisplayDialog } from './ui/dialog/card_display_dialog/card_display_dialog';
import { CardSelectorDialog } from './ui/dialog/card_selector_dialog/card_selector_dialog';
import { CharacterSelectorDialog } from './ui/dialog/character_selector_dialog/character_selector_dialog';
import { GameOverDialog } from './ui/dialog/game_over_dialog/game_over_dialog';
import { GuanXingDialog } from './ui/dialog/guanxing_dialog/guanxing_dialog';
import { WuGuFengDengDialog } from './ui/dialog/wugufengdeng_dialog/wugufengdeng_dialog';
import { getSkinName } from './ui/switch_avatar/switch_skin';

export class GameClientProcessor {
  private isObserver: boolean = false;
  protected onPlayTrustedActionTimer: NodeJS.Timer | undefined;

  protected excludedResponsiveEvents: GameEventIdentifiers[] = [
    GameEventIdentifiers.UserMessageEvent,
    GameEventIdentifiers.PlayerStatusEvent,
  ];

  constructor(
    protected presenter: RoomPresenter,
    protected store: RoomStore,
    protected translator: ClientTranslationModule,
    protected imageLoader: ImageLoader,
    protected audioService: AudioService,
    protected electron: ElectronLoader,
    protected skinData?: CharacterSkinInfo[],
    protected createWaitingRoomCaller?: (roomInfo: TemporaryRoomCreationInfo, roomId: number) => void,
  ) {}

  protected tryToThrowNotReadyException(e: GameEventIdentifiers) {
    if (
      !this.store.room &&
      e !== GameEventIdentifiers.PlayerEnterEvent &&
      e !== GameEventIdentifiers.ObserverEnterEvent
    ) {
      throw new Error('Game client process does not work when client room is not initialized');
    }
  }

  protected eventFilter<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (
      identifier !== GameEventIdentifiers.PlayerEnterEvent &&
      identifier !== GameEventIdentifiers.ObserverEnterEvent
    ) {
      this.store.room.Analytics.record(event, this.store.room.CurrentPlayerPhase);
      if (this.store.room.isPlaying()) {
        const { circle, numberOfDrawStack, numberOfDropStack } = EventPacker.getGameRunningInfo(event);
        this.store.room.Circle = circle;
        this.store.room.DrawStack = numberOfDrawStack;
        this.store.room.DropStack = numberOfDropStack;
      }
    }
    if (!this.excludedResponsiveEvents.includes(identifier)) {
      this.presenter.clearNotifiers();
    }
  }

  protected record<T extends GameEventIdentifiers>(identifier: T, event: ServerEventFinder<T>) {
    if (this.isObserver) {
      return;
    }

    if (this.store.inAction && !event.ignoreNotifiedStatus) {
      this.endAction();
    }
    if (serverResponsiveListenerEvents.includes(identifier)) {
      this.presenter.startAction(identifier, event);
      this.doTrustedAction();
    }

    if (this.store.room && (this.store.room.isPlaying() || identifier === GameEventIdentifiers.GameReadyEvent)) {
      this.electron.sendReplayEventFlow(event, {
        version: Sanguosha.Version,
        roomId: this.store.room.RoomId,
        gameInfo: this.store.room.Info,
        viewerId: this.store.clientPlayerId,
        viewerName: this.store.clientRoomInfo.playerName,
        playersInfo: this.store.room.Players.map(p => ({ Id: p.Id, Name: p.Name, Position: p.Position })),
      });
    }
  }

  protected calculateInitialFixedPosition(cardInfo: DisplayCardProp, index: number) {
    if (!cardInfo.from) {
      return;
    } else {
      const fromPosition = this.store.animationPosition.getPosition(
        cardInfo.from.Id,
        cardInfo.from.Id === this.store.clientPlayerId,
      );
      return {
        x: fromPosition.x - index * 16,
        y: fromPosition.y,
      };
    }
  }

  protected calculateFinalFixedPosition(cardInfo: DisplayCardProp, index: number) {
    if (cardInfo.to) {
      const fromPosition = this.store.animationPosition.getPosition(
        cardInfo.to.Id,
        cardInfo.to.Id === this.store.clientPlayerId,
      );
      return {
        x: fromPosition.x - index * 16,
        y: fromPosition.y,
      };
    }
  }

  public onPlayTrustedAction() {
    const { identifier, event } = this.store.awaitingResponseEvent;
    if (identifier === undefined) {
      // tslint:disable-next-line:no-console
      console.warn(`unknown identifier event: ${JSON.stringify(event, null, 2)}`);
    } else {
      const result = this.presenter.ClientPlayer!.AI.onAction(this.store.room, identifier, event!);
      this.store.room.broadcast(identifier, result);
    }
    this.presenter.closeDialog();
    this.presenter.closeIncomingConversation();
    this.presenter.disableActionButton('cancel', 'confirm', 'finish');

    this.endAction();
  }

  private doTrustedAction() {
    this.onPlayTrustedActionTimer = setTimeout(
      () => this.onPlayTrustedAction(),
      this.store.notificationTime * (this.presenter.ClientPlayer!.isTrusted() ? 0 : 1000),
    );
  }

  public endAction() {
    if (this.onPlayTrustedActionTimer !== undefined) {
      clearTimeout(this.onPlayTrustedActionTimer);
      this.onPlayTrustedActionTimer = undefined;
    }
    this.presenter.endAction();
  }

  private clearDialogs(e: GameEventIdentifiers) {
    if (this.isObserver && clientAsyncEvents.includes(e)) {
      this.presenter.closeIncomingConversation();
      this.presenter.closeDialog();
    }
  }

  async onHandleIncomingEvent<T extends GameEventIdentifiers>(e: T, content: ServerEventFinder<T>) {
    this.tryToThrowNotReadyException(e);
    this.eventFilter(e, content);
    this.record(e, content);
    this.clearDialogs(e);

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
      case GameEventIdentifiers.CircleStartEvent:
        await this.onHandleCircleStartEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerEnterEvent:
        await this.onHandlePlayerEnterEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerReenterEvent:
        await this.onHandlePlayerReenterEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        await this.onHandlePlayerLeaveEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObserverEnterEvent:
        await this.onHandleObserverEnterEvent(e as any, content);
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
      case GameEventIdentifiers.ArmorChangeEvent:
        await this.onHandleArmorChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.DamageEvent:
        await this.onHandleDamageEvent(e as any, content);
        break;
      case GameEventIdentifiers.HpChangeEvent:
        await this.onHandleHpChangeEvent(e as any, content);
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
      case GameEventIdentifiers.AskForChoosingCardWithConditionsEvent:
        await this.onHandleAskForChoosingCardWithConditionsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForFortuneCardExchangeEvent:
        await this.onHandleAskForFortuneCardExchangeEvent(e as any, content);
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
      case GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent:
        await this.onHandleAskForChoosingCardAvailableTargetEvent(e as any, content);
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
      case GameEventIdentifiers.AbortOrResumePlayerSectionsEvent:
        await this.onHandleAbortOrResumePlayerSectionsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent:
        await this.onHandleAbortOrResumePlayerJudgeAreaEvent(e as any, content);
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
      case GameEventIdentifiers.UpgradeSideEffectSkillsEvent:
        await this.onHandleUpgradeSideEffectSkillsEvent(e as any, content);
        break;
      case GameEventIdentifiers.RefreshOnceSkillEvent:
        await this.onHandleRefreshOnceSkillEvent(e as any, content);
        break;
      case GameEventIdentifiers.HookUpSkillsEvent:
        await this.onHandleHookUpSkillsEvent(e as any, content);
        break;
      case GameEventIdentifiers.UnhookSkillsEvent:
        await this.onHandleUnhookSkillsEvent(e as any, content);
        break;
      case GameEventIdentifiers.BackToWaitingRoomEvent:
        await this.BackingToWaitingRoomEvent(e as any, content);
        break;
      case GameEventIdentifiers.SetCardTagEvent:
        await this.onHandleSetCardTagEvent(e as any, content);
        break;
      case GameEventIdentifiers.RemoveCardTagEvent:
        await this.onHandleRemoveCardTagEvent(e as any, content);
        break;
      case GameEventIdentifiers.ClearCardTagsEvent:
        await this.onHandleClearCardTagsEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  protected async onHandlePlayerStatusEvent<T extends GameEventIdentifiers.PlayerStatusEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.updatePlayerStatus(content.status, content.toId);
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleUserMessageEvent<T extends GameEventIdentifiers.UserMessageEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const matchArray =
      content.originalMessage.match(/\$([a-z_]+)\.([a-z_]+):(\d+)/) ||
      content.originalMessage.match(/\$([a-z_]+):(\d+)/);

    const quickChatMatchArray = content.originalMessage.match(/^quickChat:(\d|1\d|2[0-2])$/);
    if (matchArray) {
      // play skill audio
      const skill = matchArray[1];
      const characterName = matchArray.length > 3 ? matchArray[2] : undefined;
      const index = parseInt(matchArray.length > 3 ? matchArray[3] : matchArray[2], 10);
      this.audioService.playSkillAudio(skill, CharacterGender.Male, index, undefined, undefined, characterName); // player's character may be undefined

      const player = this.store.room.getPlayerById(content.playerId);
      this.presenter.addUserMessage(
        this.translator.trx(
          TranslationPack.translationJsonPatcher(
            '{0} {1} says: {2}',
            TranslationPack.patchPureTextParameter(player.Name),
            player.CharacterId === undefined ? '' : TranslationPack.patchPlayerInTranslation(player),
            this.translator.tr(content.originalMessage),
          ).toString(),
        ),
      );
      this.presenter.onIncomingMessage(content.playerId, this.translator.tr(content.originalMessage));
    } else if (quickChatMatchArray) {
      const player = this.store.room.getPlayerById(content.playerId);
      this.audioService.playQuickChatAudio(
        parseInt(quickChatMatchArray[1], 10) + 1,
        player.Character ? player.Character.Gender : CharacterGender.Male,
      );

      this.presenter.addUserMessage(
        this.translator.trx(
          TranslationPack.translationJsonPatcher(
            '{0} {1} says: {2}',
            TranslationPack.patchPureTextParameter(player.Name),
            player.CharacterId === undefined ? '' : TranslationPack.patchPlayerInTranslation(player),
            this.translator.tr(content.originalMessage),
          ).toString(),
        ),
      );
      this.presenter.onIncomingMessage(content.playerId, this.translator.tr(content.originalMessage));
    } else {
      this.presenter.addUserMessage(this.translator.trx(content.message));
      this.presenter.onIncomingMessage(content.playerId, content.originalMessage);
    }
    this.presenter.broadcastUIUpdate();
    this.electron.flashFrame();
  }

  protected async onHandleSetFlagEvent<T extends GameEventIdentifiers.SetFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room
      .getPlayerById(content.to)
      .setFlag(content.name, content.value, content.tagName, content.visiblePlayers);
  }
  protected async onHandleRemoveFlagEvent<T extends GameEventIdentifiers.RemoveFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).removeFlag(content.name);
  }
  protected async onHandleClearFlagEvent<T extends GameEventIdentifiers.ClearFlagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).clearFlags();
  }
  protected async onHandleAddMarkEvent<T extends GameEventIdentifiers.AddMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).addMark(content.name, content.value);
  }
  protected async onHandleSetMarkEvent<T extends GameEventIdentifiers.SetMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).setMark(content.name, content.value);
  }
  protected async onHandleRemoveMarkEvent<T extends GameEventIdentifiers.RemoveMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).removeMark(content.name);
  }
  protected async onHandleClearMarkEvent<T extends GameEventIdentifiers.ClearMarkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.to).clearMarks();
  }

  protected async onHandleAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new CardResponseAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(
      CardResponseAction.isSkillsOnCardResponseDisabled(
        this.store.room,
        new CardMatcher(content.cardMatcher),
        this.store.room.getPlayerById(content.toId),
        content,
      ),
    );

    await action.onPlay(this.translator);
  }

  protected async onHandleAskForPinDianCardEvent<T extends GameEventIdentifiers.AskForPinDianCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.randomPinDianCard) {
      const handcards = this.presenter.ClientPlayer!.getCardIds(PlayerCardsArea.HandArea);
      const randomCardIndex = Math.floor(Math.random() * handcards.length);
      const event: ClientEventFinder<T> = {
        fromId: content.toId,
        pindianCard: handcards[randomCardIndex],
      };
      this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
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
  }

  protected async onHandleAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: content.conversation
        ? content.conversation
        : TranslationPack.translationJsonPatcher(
            'please drop ' + (content.cardAmount instanceof Array ? '{1} to {2}' : '{0}') + ' cards',
            content.cardAmount as number,
            (content.cardAmount as [number, number])[0],
            (content.cardAmount as [number, number])[1],
          ).extract(),
      translator: this.translator,
    });

    const action = new SelectAction(content.toId, this.store, this.presenter, this.translator, content);
    const selectedCards = await action.onSelectCard(
      content.fromArea,
      content.cardAmount,
      content.except,
      content.hideExclusive ? cardId => content.except!.includes(cardId) : undefined,
    );

    this.presenter.closeIncomingConversation();
    const event: ClientEventFinder<T> = {
      fromId: content.toId,
      droppedCards: selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
  }

  protected async onHandleAskForCardDisplayEvent<T extends GameEventIdentifiers.AskForCardDisplayEvent>(
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
      cardMatcher && new CardMatcher(cardMatcher),
    );
    const selectedCards = await action.onSelectCard([PlayerCardsArea.HandArea], cardAmount);

    this.presenter.closeIncomingConversation();
    const displayEvent: ClientEventFinder<T> = {
      fromId: toId,
      selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, displayEvent));
  }

  protected async onHandleAskForCardEvent<T extends GameEventIdentifiers.AskForCardEvent>(
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
      cardMatcher && new CardMatcher(cardMatcher),
    );
    const selectedCards = await action.onSelectCard(fromArea, cardAmount || cardAmountRange!);

    this.presenter.closeIncomingConversation();
    const askForCardEvent: ClientEventFinder<GameEventIdentifiers.AskForCardEvent> = {
      fromId: toId,
      selectedCards,
    };
    this.store.room.broadcast(type, askForCardEvent);
  }

  protected async onHandleAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new ResponsiveUseCardAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(
      ResponsiveUseCardAction.isSkillsOnResponsiveCardUseDisabled(
        this.store.room,
        new CardMatcher(content.cardMatcher),
        this.store.room.getPlayerById(content.toId),
        content,
      ),
    );

    await action.onPlay(this.translator);
  }

  protected async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const from = this.store.room.getPlayerById(content.fromId);
    const card = Sanguosha.getCardById(content.cardId);
    if (!card.is(CardType.Equip)) {
      this.audioService.playCardAudio(card.Name, from.Gender, from.Character.Name);
    } else {
      this.audioService.playEquipAudio();
    }

    const tos = TargetGroupUtil.getRealTargets(content.targetGroup)?.map(id =>
      this.store.room.getPlayerById(id),
    ) as Player[];

    await this.store.room.useCard(content);
    const showCards = VirtualCard.getActualCards([content.cardId]).map(cardId => ({
      card: Sanguosha.getCardById(cardId),
      tag: TranslationPack.translationJsonPatcher(
        tos ? '{0} used card to {1}' : '{0} used card',
        TranslationPack.patchPlayerInTranslation(from),
        tos && TranslationPack.patchPlayerInTranslation(...tos),
      ).toString(),
      from,
      to: undefined,
    }));

    this.presenter.showCards(...showCards);
    for (let i = 0; i < showCards.length; i++) {
      const showCard = showCards[i];
      const from = this.calculateInitialFixedPosition(showCard, i);
      // const to = this.calculateFinalFixedPosition(showCard, i);
      this.presenter.playCardAnimation(showCard, from);
    }
  }

  protected async onHandleCardResponseEvent<T extends GameEventIdentifiers.CardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const from = this.store.room.getPlayerById(content.fromId);
    const card = Sanguosha.getCardById(content.cardId);
    if (!card.is(CardType.Equip) && !content.mute) {
      this.audioService.playCardAudio(card.Name, from.Gender, from.Character.Name);
    }
    const showCards = VirtualCard.getActualCards([content.cardId]).map(cardId => ({
      card: Sanguosha.getCardById(cardId),
      tag: TranslationPack.translationJsonPatcher(
        '{0} responded card',
        TranslationPack.patchPlayerInTranslation(from),
      ).toString(),
      from,
      to: undefined,
    }));
    this.presenter.showCards(...showCards);

    for (let i = 0; i < showCards.length; i++) {
      const showCard = showCards[i];
      const from = this.calculateInitialFixedPosition(showCard, i);
      // const to = this.calculateFinalFixedPosition(showCard, i);
      this.presenter.playCardAnimation(showCard, from);
    }
  }

  protected async onHandleCardDisplayEvent<T extends GameEventIdentifiers.CardDisplayEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const from = content.fromId ? this.store.room.getPlayerById(content.fromId) : undefined;
    if (content.engagedPlayerIds && content.engagedPlayerIds.includes(this.store.clientPlayerId)) {
      const onCloseDialog = () => {
        this.presenter.closeDialog();
        this.presenter.broadcastUIUpdate();
      };

      this.presenter.createDialog(
        <CardDisplayDialog
          onConfirm={onCloseDialog}
          from={from}
          translator={this.translator}
          imageLoader={this.imageLoader}
          cards={content.displayCards}
        />,
      );
    } else {
      const showCards = VirtualCard.getActualCards(content.displayCards).map(cardId => ({
        card: Sanguosha.getCardById(cardId),
        tag:
          from &&
          TranslationPack.translationJsonPatcher(
            '{0} displayed card',
            TranslationPack.patchPlayerInTranslation(from),
          ).toString(),
        from: undefined,
        to: undefined,
      }));
      this.presenter.showCards(...showCards);

      if (showCards.length > 0) {
        for (let i = 0; i < showCards.length; i++) {
          const showCard = showCards[i];
          const from = this.calculateInitialFixedPosition(showCard, i);
          // const to = this.calculateFinalFixedPosition(showCard, i);
          this.presenter.playCardAnimation(showCard, from);
        }
      }
    }
    if (content.toIds && !content.toIds.includes(this.store.clientPlayerId)) {
      return;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected onHandleAimEvent<T extends GameEventIdentifiers.AimEvent>(type: T, content: ServerEventFinder<T>) {}
  protected onHandleDrawCardsEvent<T extends GameEventIdentifiers.DrawCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {}
  protected onHandleCustomDialogEvent<T extends GameEventIdentifiers.CustomGameDialog>(
    type: T,
    content: ServerEventFinder<T>,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {}
  protected onHandlePlayerDyingEvent<T extends GameEventIdentifiers.PlayerDyingEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ) {
    this.store.room.getPlayerById(content.dying).Dying = true;
  }

  protected onHandleSetOutsideCharactersEvent<T extends GameEventIdentifiers.SetOutsideCharactersEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { toId, areaName, characterIds, isPublic } = content;
    const player = this.store.room.getPlayerById(toId);
    player.setCharacterOutsideAreaCards(areaName, characterIds);
    isPublic && player.setVisibleOutsideArea(areaName);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleHuaShenCardUpdatedEvent<T extends GameEventIdentifiers.HuaShenCardUpdatedEvent>(
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

  protected onHandleUpgradeSideEffectSkillsEvent<T extends GameEventIdentifiers.UpgradeSideEffectSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.skillName !== undefined) {
      this.store.room.installSideEffectSkill(content.sideEffectSkillApplier, content.skillName, content.sourceId!);
    } else {
      this.store.room.uninstallSideEffectSkill(content.sideEffectSkillApplier);
    }
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleRefreshOnceSkillEvent<T extends GameEventIdentifiers.RefreshOnceSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const skill = Sanguosha.getSkillBySkillName(content.skillName);

    this.store.room.refreshPlayerOnceSkill(content.toId, content.skillName);
    if (skill.SkillType === SkillType.Limit || skill.SkillType === SkillType.Awaken) {
      this.presenter.refreshOnceSkillUsed(content.toId, content.skillName);
      this.presenter.broadcastUIUpdate();
    }
  }

  protected onHandlePlayerPropertiesChangeEvent<T extends GameEventIdentifiers.PlayerPropertiesChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { changedProperties } = content;
    for (const {
      toId,
      characterId,
      armor,
      maxHp,
      hp,
      nationality,
      gender,
      handCards,
      equips,
      playerPosition,
      activate,
    } of changedProperties) {
      const player = this.store.room.getPlayerById(toId);
      characterId !== undefined && (player.CharacterId = characterId);
      armor !== undefined && (player.Armor = armor);
      maxHp !== undefined && (player.MaxHp = maxHp);
      hp !== undefined && (player.Hp = hp);
      nationality !== undefined && (player.Nationality = nationality);
      gender !== undefined && (player.Gender = gender);

      if (activate !== undefined) {
        activate && player.Dead && player.revive();
        activate || player.Dead || player.bury();
      }
      playerPosition !== undefined && (player.Position = playerPosition);

      if (handCards !== undefined) {
        player.getCardIds(PlayerCardsArea.HandArea).splice(0, player.getCardIds(PlayerCardsArea.HandArea).length);
        player.getCardIds(PlayerCardsArea.HandArea).push(...handCards);
      }
      if (equips !== undefined) {
        player.getCardIds(PlayerCardsArea.EquipArea).splice(0, player.getCardIds(PlayerCardsArea.EquipArea).length);
        player.getCardIds(PlayerCardsArea.EquipArea).push(...equips);
      }
    }

    changedProperties.find(property => property.playerPosition) && this.store.room.sortPlayers();

    this.presenter.broadcastUIUpdate();
  }

  protected onHandleNotifyEvent<T extends GameEventIdentifiers.NotifyEvent>(type: T, content: ServerEventFinder<T>) {
    this.presenter.notify(content.toIds, content.notificationTime);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandlePlayerDiedEvent<T extends GameEventIdentifiers.PlayerDiedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { playerId } = content;
    const player = this.store.room.getPlayerById(playerId);
    const skinName = getSkinName(player.Character.Name, player.Id, this.skinData).skinName;
    this.audioService.playDeathAudio(player.Character.Name, undefined, this.skinData, skinName);
    this.store.room.kill(player);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleArmorChangeEvent<T extends GameEventIdentifiers.ArmorChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.toId);
    player.changeArmor(content.amount);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleDamageEvent<T extends GameEventIdentifiers.DamageEvent>(type: T, content: ServerEventFinder<T>) {
    this.audioService.playDamageAudio(content.damage);
  }

  protected onHandleHpChangeEvent<T extends GameEventIdentifiers.HpChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.toId);
    player.changeHp(content.byReaon !== 'recover' ? -content.amount : content.amount);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleLoseHpEvent<T extends GameEventIdentifiers.LoseHpEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    this.audioService.playLoseHpAudio();
    player.changeHp(-content.lostHp);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleChangeMaxHpEvent<T extends GameEventIdentifiers.ChangeMaxHpEvent>(
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

  protected onHandleRecoverEvent<T extends GameEventIdentifiers.RecoverEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.Dying = false;
    player.changeHp(content.recoveredHp);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleGameStartEvent<T extends GameEventIdentifiers.GameStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.isSkillDisabled(() => true);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleCircleStartEvent<T extends GameEventIdentifiers.CircleStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.Analytics.turnToNextCircle();
    for (const player of this.store.room.AlivePlayers) {
      const skillsUsed = Object.keys(player.SkillUsedHistory);
      if (skillsUsed.length > 0) {
        for (const skill of skillsUsed) {
          if (player.hasUsedSkill(skill)) {
            const reaSkill = Sanguosha.getSkillBySkillName(skill);
            reaSkill.isCircleSkill() && player.resetSkillUseHistory(skill);
          }
        }
      }
    }
  }

  protected async onHandleGameReadyEvent<T extends GameEventIdentifiers.GameReadyEvent>(
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
    this.audioService.playGameStartAudio();
    this.electron.flashFrame();
    await this.store.room.gameStart(content.gameStartInfo);
  }

  protected onHandlePlayerEnterEvent<T extends GameEventIdentifiers.PlayerEnterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    Precondition.assert(this.store.clientRoomInfo !== undefined, 'Uninitialized Client room info');
    if (
      content.joiningPlayerId === this.store.clientRoomInfo.playerId &&
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
      for (const player of content.playersInfo) {
        this.store.animationPosition.insertPlayer(player.Id);
      }

      this.presenter.ClientPlayer?.getReady();
      this.store.room.broadcast(GameEventIdentifiers.PlayerReadyEvent, { playerId: this.store.clientPlayerId });
    } else {
      const playerInfo = Precondition.exists(
        content.playersInfo.find(playerInfo => playerInfo.Id === content.joiningPlayerId),
        `Unknown player ${content.joiningPlayerName}`,
      );

      this.store.animationPosition.insertPlayer(playerInfo.Id);

      if (this.store.room) {
        this.presenter.playerEnter(playerInfo);
      }
    }
  }

  protected onHandleObserverEnterEvent<T extends GameEventIdentifiers.ObserverEnterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    Precondition.assert(this.store.clientRoomInfo !== undefined, 'Uninitialized Client room info');
    if (
      content.joiningPlayerId === this.store.clientRoomInfo.playerId &&
      content.timestamp === this.store.clientRoomInfo.timestamp
    ) {
      this.presenter.setupClientPlayerId(content.observePlayerId);

      this.presenter.createClientRoom(
        this.store.clientRoomInfo.roomId,
        this.store.clientRoomInfo.socket,
        content.gameInfo,
        content.playersInfo,
      );
      this.store.room.syncUpRoom(content.roomInfo);

      this.translator.setupPlayer(this.presenter.ClientPlayer);
      for (const player of content.playersInfo) {
        this.store.animationPosition.insertPlayer(player.Id);
      }

      this.isObserver = true;
      this.presenter.broadcastUIUpdate();
    }
  }

  protected async onHandlePlayerReenterEvent<T extends GameEventIdentifiers.PlayerReenterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).setOnline();
    this.presenter.broadcastUIUpdate();
  }

  protected onHandlePlayerLeaveEvent<T extends GameEventIdentifiers.PlayerLeaveEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.playerLeave(content.playerId, content.quit);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const selectedCharacters: CharacterId[] = [];

    const onClick = (character: Character) => {
      const index = selectedCharacters.indexOf(character.Id);
      if (index === -1) {
        selectedCharacters.push(character.Id);
        if (selectedCharacters.length === content.amount) {
          this.store.confirmButtonAction?.();
          return;
        }
      } else {
        selectedCharacters.splice(index, 1);
      }

      if (selectedCharacters.length > 0) {
        this.presenter.enableActionButton('confirm');
      } else {
        this.presenter.disableActionButton('confirm');
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
    });

    if (content.conversation) {
      this.presenter.createIncomingConversation({ conversation: content.conversation, translator: this.translator });
    }

    this.presenter.createDialog(
      <CharacterSelectorDialog
        imageLoader={this.imageLoader}
        characterIds={content.characterIds}
        onClick={this.isObserver ? undefined : onClick}
        translator={this.translator}
        selectedCharacters={selectedCharacters}
      />,
    );
  }

  protected onHandleSyncGameCommonRulesEvent<T extends GameEventIdentifiers.SyncGameCommonRulesEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { commonRules, toId } = content;
    this.store.room.CommonRules.syncSocketObject(this.store.room.getPlayerById(toId), commonRules);
  }

  protected async onHandleAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new SkillUseAction(content.toId, this.store, this.presenter, content, this.translator);
    this.presenter.isSkillDisabled(SkillUseAction.isSkillDisabled(content));
    await action.onSelect(this.translator);
  }

  protected async onHandleAskForFortuneCardExchangeEvent<T extends GameEventIdentifiers.AskForFortuneCardExchangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (this.isObserver) {
      return;
    }

    this.presenter.defineConfirmButtonActions(() => {
      const response: ClientEventFinder<T> = {
        doChange: true,
        fromId: this.store.clientPlayerId,
      };
      this.store.room.broadcast(type, response);
      this.presenter.closeIncomingConversation();
      this.endAction();
    });
    this.presenter.defineCancelButtonActions(() => {
      const response: ClientEventFinder<T> = {
        doChange: false,
        fromId: this.store.clientPlayerId,
      };
      this.store.room.broadcast(type, response);
      this.presenter.closeIncomingConversation();
      this.endAction();
    });

    this.presenter.enableActionButton('confirm', 'cancel');
    this.presenter.createIncomingConversation({
      conversation: content.conversation,
      translator: this.translator,
    });
    this.presenter.broadcastUIUpdate();
  }

  protected onHandlePhaseStageChangeEvent<T extends GameEventIdentifiers.PhaseStageChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.CurrentPlayerStage = content.toStage;
  }

  protected async onHandleLoseSkillEvent<T extends GameEventIdentifiers.LoseSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.loseSkill(content.toId, content.skillName);
  }

  protected async onHandleObtainSkillEvent<T extends GameEventIdentifiers.ObtainSkillEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.obtainSkill(content.toId, content.skillName, false, content.insertIndex);
    this.presenter.broadcastUIUpdate();
  }

  protected onHandlePhaseChangeEvent<T extends GameEventIdentifiers.PhaseChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.onPhaseTo(content.toPlayer, content.to);
    this.store.room.Analytics.turnToNextPhase();
    if (content.to === PlayerPhase.PhaseBegin) {
      this.store.room.turnTo(content.toPlayer);
      this.store.room.Analytics.turnTo(content.toPlayer);
    }

    if (content.fromPlayer) {
      for (const player of this.store.room.AlivePlayers) {
        if (this.store.room.CurrentPlayerPhase === PlayerPhase.PhaseBegin) {
          player.resetCardUseHistory();
        } else {
          player.resetCardUseHistory('slash');
        }

        const skillsUsed = Object.keys(player.SkillUsedHistory);
        if (skillsUsed.length > 0) {
          for (const skill of skillsUsed) {
            if (player.hasUsedSkill(skill)) {
              const reaSkill = Sanguosha.getSkillBySkillName(skill);
              if (reaSkill.isCircleSkill()) {
                continue;
              }
              reaSkill.isRefreshAt(this.store.room, player, content.to) && player.resetSkillUseHistory(skill);
            }
          }
        }
      }
    }
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandlePlayCardStage<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new PlayPhaseAction(content.toId, this.store, this.presenter, this.translator);
    this.presenter.isSkillDisabled(
      PlayPhaseAction.isPlayPhaseSkillsDisabled(this.store.room, this.presenter.ClientPlayer!, content),
    );
    this.presenter.broadcastUIUpdate();
    await action.onPlay();
  }

  protected onHandleMoveCardEvent<T extends GameEventIdentifiers.MoveCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    for (const info of content.infos) {
      const {
        toArea,
        toId,
        fromId,
        toOutsideArea,
        movingCards,
        isOutsideAreaInPublic,
        moveReason,
        movedByReason,
        proposer,
        engagedPlayerIds,
      } = info;
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
        const actualCardIds = VirtualCard.getActualCards(cardIds);
        if (toArea === CardMoveArea.OutsideArea) {
          to.getCardIds(toArea as unknown as PlayerCardsArea, toOutsideArea).push(...actualCardIds);
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
      }

      const showCards: DisplayCardProp[] = [];

      if (
        moveReason !== CardMoveReason.CardUse &&
        moveReason !== CardMoveReason.CardResponse &&
        (toArea === CardMoveArea.ProcessingArea || toArea === CardMoveArea.DropStack)
      ) {
        for (const movingCard of movingCards) {
          for (const cardId of VirtualCard.getActualCards([movingCard.card])) {
            showCards.push({
              card: Sanguosha.getCardById(cardId),
              tag:
                movedByReason === CardMovedBySpecifiedReason.JudgeProcess
                  ? TranslationPack.translationJsonPatcher(
                      "{0}'s judge card",
                      TranslationPack.patchPlayerInTranslation(this.store.room.getPlayerById(proposer!)),
                    ).toString()
                  : toArea === CardMoveArea.DropStack
                  ? 'move to drop stack'
                  : undefined,
              buried: !to && toArea !== CardMoveArea.ProcessingArea,
              from,
              to: to ? to : undefined,
              hiddenMove: engagedPlayerIds ? !engagedPlayerIds.includes(this.store.clientPlayerId) : false,
            });
          }
        }
      }

      if (showCards.length > 0) {
        this.presenter.showCards(...showCards);
        for (let i = 0; i < showCards.length; i++) {
          const showCard = showCards[i];
          const from = this.calculateInitialFixedPosition(showCard, i);
          // const to = this.calculateFinalFixedPosition(showCard, i);
          this.presenter.playCardAnimation(showCard, from);
        }
      }

      for (const movingCard of movingCards) {
        if (movingCard.fromArea === CardMoveArea.ProcessingArea) {
          this.presenter.buryCards(movingCard.card);
        }
      }

      toOutsideArea !== undefined && isOutsideAreaInPublic && to && to.setVisibleOutsideArea(toOutsideArea);

      this.presenter.broadcastUIUpdate();
    }
  }

  protected onHandleJudgeEvent<T extends GameEventIdentifiers.JudgeEvent>(type: T, content: ServerEventFinder<T>) {
    const { judgeCardId, toId } = content;
    const to = this.store.room.getPlayerById(toId);
    const displayedCard = this.store.displayedCards.find(cardInfo => cardInfo.card.Id === judgeCardId);
    if (displayedCard) {
      displayedCard.buried = true;
      displayedCard.tag = TranslationPack.translationJsonPatcher(
        "{0}'s judge card",
        TranslationPack.patchPlayerInTranslation(to),
      ).toString();
    }

    this.presenter.broadcastUIUpdate();
  }

  protected onHandlePlayerTurnOverEvent<T extends GameEventIdentifiers.PlayerTurnOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).turnOver();
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleAskForPeachEvent<T extends GameEventIdentifiers.AskForPeachEvent>(
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
        content,
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
  }

  protected onHandleAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
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
    };

    this.presenter.createDialog(
      <CardSelectorDialog
        imageLoader={this.imageLoader}
        options={content.options}
        onClick={this.isObserver ? undefined : onSelectedCard}
        translator={this.translator}
        title={content.customTitle}
      />,
    );
  }

  protected onHandleAskForChoosingCardWithConditionsEvent<
    T extends GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
  >(type: T, content: ServerEventFinder<T>) {
    const selectedCards: CardId[] = [];
    const selectedCardsIndex: number[] = [];
    const involvedTargets = content.involvedTargets?.map(target => this.store.room.getPlayerById(target));
    const matcher = content.cardFilter !== undefined && System.AskForChoosingCardEventFilters[content.cardFilter];
    const isCardDisabled = matcher
      ? (card: Card) => {
          if (content.cardIds) {
            if (typeof content.cardIds === 'number') {
              return true;
            } else {
              return !matcher(content.cardIds, selectedCards, card.Id, involvedTargets);
            }
          } else if (content.customCardFields) {
            const cards = Object.values(content.customCardFields).reduce<CardId[]>((allCards, currentSection) => {
              if (currentSection instanceof Array) {
                allCards.push(...currentSection);
              }
              return allCards;
            }, []);
            return !matcher(cards, selectedCards, card.Id, involvedTargets);
          }

          return true;
        }
      : undefined;

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

      if (content.amount === undefined) {
        Precondition.assert(matcher !== undefined, 'no valid card filter');
        const cards = content.customCardFields
          ? Object.values(content.customCardFields)
              .reduce<CardId[]>(
                (allCards, currentSection) => {
                  if (currentSection instanceof Array) {
                    allCards.push(...currentSection);
                  }
                  return allCards;
                },
                content.cardIds instanceof Array ? content.cardIds : [],
              )
              .filter(cardId => !selectedCards.includes(cardId))
          : [];
        for (const card of cards) {
          if (matcher && matcher(cards, selectedCards, card, involvedTargets)) {
            this.presenter.disableActionButton('confirm');
            return;
          }
        }
        this.presenter.enableActionButton('confirm');
      } else if (content.amount instanceof Array) {
        const selectedLength = selectedCards.length + selectedCardsIndex.length;
        if (selectedLength >= content.amount[0] && selectedLength <= content.amount[1]) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
      } else {
        if (selectedCards.length + selectedCardsIndex.length === content.amount) {
          this.presenter.enableActionButton('confirm');
        } else {
          this.presenter.disableActionButton('confirm');
        }
      }
      this.presenter.broadcastUIUpdate();
    };

    this.presenter.createDialog(
      <CardSelectorDialog
        options={content.cardIds || content.customCardFields!}
        onClick={this.isObserver ? undefined : onSelectedCard}
        translator={this.translator}
        isCardDisabled={isCardDisabled}
        imageLoader={this.imageLoader}
        title={content.customTitle && this.translator.tr(content.customTitle)}
      />,
    );

    if (!EventPacker.isUncancellableEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        this.presenter.closeDialog();

        const event: ClientEventFinder<T> = {
          fromId: content.toId,
        };
        this.store.room.broadcast(type, event);
      });
    } else {
      this.presenter.disableActionButton('cancel');
    }

    this.presenter.defineConfirmButtonActions(() => {
      this.presenter.closeDialog();

      const event: ClientEventFinder<T> = {
        fromId: content.toId,
        selectedCards,
        selectedCardsIndex,
      };
      this.store.room.broadcast(type, event);
    });
  }

  protected onHandleAskForChoosingCardEvent<T extends GameEventIdentifiers.AskForChoosingCardEvent>(
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
      }
    };

    const matcher = content.cardMatcher && new CardMatcher(content.cardMatcher);

    const isCardDisabled = matcher ? (card: Card) => !matcher.match(card) : undefined;
    this.presenter.createDialog(
      <CardSelectorDialog
        options={content.cardIds || content.customCardFields!}
        onClick={this.isObserver ? undefined : onSelectedCard}
        translator={this.translator}
        isCardDisabled={isCardDisabled}
        imageLoader={this.imageLoader}
        title={content.customTitle}
      />,
    );

    if (!EventPacker.isUncancellableEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        this.presenter.closeDialog();

        const event: ClientEventFinder<T> = {
          fromId: content.toId,
        };
        this.store.room.broadcast(type, event);
      });
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  protected onHandleAskForChoosingOptionsEvent<T extends GameEventIdentifiers.AskForChoosingOptionsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { options, conversation, toId, optionPrompt } = content;

    const actionHandlers = {};
    options.forEach(option => {
      actionHandlers[option] = () => {
        if (this.isObserver) {
          return;
        }

        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
          selectedOption: option,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.presenter.disableActionButton('cancel');
      };
    });

    this.presenter.highlightCards();
    this.presenter.createIncomingConversation({
      optionsActionHanlder: actionHandlers,
      translator: this.translator,
      optionPrompt,
      conversation,
    });
    if (!EventPacker.isUncancellableEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        const response: ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          fromId: toId,
        };

        this.store.room.broadcast(GameEventIdentifiers.AskForChoosingOptionsEvent, response);
        this.presenter.closeIncomingConversation();
      });
    } else {
      this.presenter.disableActionButton('cancel');
    }
  }

  protected async onHandleSkillUseEvent<T extends GameEventIdentifiers.SkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const skill = Sanguosha.getSkillBySkillName(content.skillName);
    const from = this.store.room.getPlayerById(content.fromId);
    const skinName = getSkinName(from.Character.Name, from.Id, this.skinData).skinName;
    !content.mute &&
      this.audioService.playSkillAudio(
        skill.GeneralName,
        from.Gender,
        content.audioIndex,
        undefined,
        this.skinData,
        from.Character.Name,
        skinName,
      );

    await this.store.room.useSkill(content);
    if (skill.SkillType === SkillType.Limit || skill.SkillType === SkillType.Awaken) {
      this.presenter.onceSkillUsed(content.fromId, content.skillName);
    } else if (skill.isSwitchSkill() && skill.isSwitchable()) {
      this.presenter.switchSkillStateChanged(content.fromId, skill.GeneralName);
    }
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleGameOverEvent<T extends GameEventIdentifiers.GameOverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { winnerIds, loserIds } = content;
    const winners = winnerIds.map(id => this.store.room.getPlayerById(id));
    const losers = loserIds.map(id => this.store.room.getPlayerById(id));
    this.presenter.createDialog(
      <GameOverDialog
        imageLoader={this.imageLoader}
        translator={this.translator}
        electron={this.electron}
        gameMode={this.store.room.Info.gameMode}
        winners={winners}
        losers={losers}
        onBackingToWaitingRoom={this.store.room.Info.campaignMode ? undefined : this.onBackingToWaitingRoom}
      />,
    );
    this.presenter.broadcastUIUpdate();
    this.store.room.gameOver();
  }

  private readonly onBackingToWaitingRoom = () => {
    this.store.room.broadcast(GameEventIdentifiers.BackToWaitingRoomEvent, {
      playerId: this.store.clientPlayerId!,
      playerName: this.store.clientRoomInfo.playerName,
    });
  };

  protected async onHandleChainLockedEvent<T extends GameEventIdentifiers.ChainLockedEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.audioService.playChainAudio();
    const { toId, linked } = content;
    this.store.room.getPlayerById(toId).ChainLocked = linked;
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleDrunkEvent<T extends GameEventIdentifiers.DrunkEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.drunk) {
      this.store.room.getPlayerById(content.toId).getDrunk();
    } else {
      this.store.room.getPlayerById(content.toId).clearHeaded();
    }
    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleAskForChoosingPlayerEvent<T extends GameEventIdentifiers.AskForChoosingPlayerEvent>(
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
    this.presenter.closeIncomingConversation();
  }

  protected async onHandleAskForChoosingCardAvailableTargetEvent<
    T extends GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent,
  >(type: T, content: ServerEventFinder<T>) {
    const { user, cardId, exclude, conversation } = content;
    this.presenter.createIncomingConversation({
      conversation,
      translator: this.translator,
    });
    const action = new SelectAction(this.store.clientPlayerId, this.store, this.presenter, this.translator, content);
    const selectedPlayers = await action.onSelectCardTargets(user, cardId, exclude);

    const choosePlayerEvent: ClientEventFinder<GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent> = {
      fromId: this.store.clientPlayerId,
      selectedPlayers,
    };

    this.store.room.broadcast(GameEventIdentifiers.AskForChoosingCardAvailableTargetEvent, choosePlayerEvent);
    this.presenter.closeIncomingConversation();
  }

  protected async onHandlePlaceCardsInDileEvent<T extends GameEventIdentifiers.AskForPlaceCardsInDileEvent>(
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
        onConfirm={this.isObserver ? undefined : onConfirm}
        movable={movable}
        title={content.triggeredBySkills && content.triggeredBySkills[0]}
      />,
    );
  }

  protected async onHandleContinuouslyChoosingCard<T extends GameEventIdentifiers.AskForContinuouslyChoosingCardEvent>(
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
        onClick={this.store.clientPlayerId === content.toId && !this.isObserver ? onClick : undefined}
      />,
    );
  }
  protected async onHandleObserveCardsEvent<T extends GameEventIdentifiers.ObserveCardsEvent>(
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

  protected async onHandleContinuouslyChoosingCardFinish<T extends GameEventIdentifiers.ObserveCardFinishEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.closeDialog();
  }

  protected async onHandleAbortOrResumePlayerSectionsEvent<
    T extends GameEventIdentifiers.AbortOrResumePlayerSectionsEvent,
  >(type: T, content: ServerEventFinder<T>) {
    const { toId, isResumption, toSections } = content;
    const to = this.store.room.getPlayerById(toId);
    if (isResumption) {
      to.resumeEquipSections(...toSections);
    } else {
      to.abortEquipSections(...toSections);
    }

    this.presenter.broadcastUIUpdate();
  }

  protected async onHandleAbortOrResumePlayerJudgeAreaEvent<
    T extends GameEventIdentifiers.AbortOrResumePlayerJudgeAreaEvent,
  >(type: T, content: ServerEventFinder<T>) {
    const { toId, isResumption } = content;
    const to = this.store.room.getPlayerById(toId);
    if (isResumption) {
      to.resumeJudgeArea();
    } else {
      to.abortJudgeArea();
    }

    this.presenter.broadcastUIUpdate();
  }

  protected onHandleHookUpSkillsEvent<T extends GameEventIdentifiers.HookUpSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room
      .getPlayerById(content.toId)
      .hookUpSkills(content.skillNames.map(name => Sanguosha.getSkillBySkillName(name)));
    this.presenter.broadcastUIUpdate();
  }

  protected onHandleUnhookSkillsEvent<T extends GameEventIdentifiers.UnhookSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room
      .getPlayerById(content.toId)
      .removeHookedSkills(content.skillNames.map(name => Sanguosha.getSkillBySkillName(name)));
    this.presenter.broadcastUIUpdate();
  }

  protected BackingToWaitingRoomEvent<T extends GameEventIdentifiers.BackToWaitingRoomEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { roomId, roomInfo } = content;
    this.createWaitingRoomCaller?.(roomInfo, roomId);
  }

  protected async onHandleSetCardTagEvent<T extends GameEventIdentifiers.SetCardTagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).setCardTag(content.cardTag, content.cardIds);
  }

  protected async onHandleRemoveCardTagEvent<T extends GameEventIdentifiers.RemoveCardTagEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).removeCardTag(content.cardTag);
  }

  protected async onHandleClearCardTagsEvent<T extends GameEventIdentifiers.ClearCardTagsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.getPlayerById(content.toId).clearCardTags();
  }
}
