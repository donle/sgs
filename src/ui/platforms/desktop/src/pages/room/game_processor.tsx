import { Card } from 'core/cards/card';
import { EquipCard } from 'core/cards/equip_card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { Character } from 'core/characters/character';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { PlayerPhase } from 'core/game/stage_processor';
import { PlayerCardsArea } from 'core/player/player_props';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { CardResponseAction } from './actions/card_response_action';
import { PlayPhaseAction } from './actions/play_phase_action';
import { ResponsiveUseCardAction } from './actions/responsive_card_use_action';
import { SelectCardAction } from './actions/select_card_action';
import { SkillUseAction } from './actions/skill_use_action';
import { RoomPresenter, RoomStore } from './room.presenter';
import { CardSelectorDialog } from './ui/dialog/card_selector_dialog/card_selector_dialog';
import { CharacterSelectorDialog } from './ui/dialog/character_selector_dialog/character_selector_dialog';
import { WuGuFengDengDialog } from './ui/dialog/wugufengdeng_dialog/wugufengdeng_dialog';

export class GameClientProcessor {
  constructor(
    private presenter: RoomPresenter,
    private store: RoomStore,
    private translator: ClientTranslationModule,
  ) {}

  private tryToThrowNotReadyException(e: GameEventIdentifiers) {
    if (!this.store.room && e !== GameEventIdentifiers.PlayerEnterEvent) {
      throw new Error('Game client process does not work when client room is not initialized');
    }
  }

  async onHandleIncomingEvent<T extends GameEventIdentifiers>(e: T, content: ServerEventFinder<T>) {
    this.tryToThrowNotReadyException(e);
    switch (e) {
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
      case GameEventIdentifiers.CardUseEvent:
        await this.onHandleCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardResponseEvent:
        await this.onHandleCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardDropEvent:
        await this.onHandleCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.ObtainCardEvent:
        await this.onHandelObtainCardEvent(e as any, content);
        break;
      case GameEventIdentifiers.EquipEvent:
        await this.onHandleEquipEvent(e as any, content);
        break;
      case GameEventIdentifiers.DamageEvent:
        await this.onHandleDamageEvent(e as any, content);
        break;
      case GameEventIdentifiers.RecoverEvent:
        await this.onHandleRecoverEvent(e as any, content);
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
      case GameEventIdentifiers.AskForPeachEvent:
        await this.onHandleAskForPeachEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingCardFromPlayerEvent:
        await this.onHandleAskForChoosingCardFromPlayerEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardLostEvent:
        await this.onHandleCardLoseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AimEvent:
        await this.onHandleAimEvent(e as any, content);
        break;
      case GameEventIdentifiers.CustomGameDialog:
        await this.onHandleCustomDialogEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForWuGuFengDengEvent:
        await this.onHandleWuGuFengDengEvent(e as any, content);
        break;
      case GameEventIdentifiers.WuGuFengDengFinishEvent:
        await this.onHandleWuGuFengDengFinish(e as any, content);
        break;
      case GameEventIdentifiers.AskForChoosingOptionsEvent:
        await this.onHandleAskForChoosingOptionsEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  private onHandleAskForCardResponseEvent<T extends GameEventIdentifiers.AskForCardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new CardResponseAction(content.toId, this.store, this.presenter, content);
    this.presenter.isSkillDisabled(CardResponseAction.isSkillsOnCardResponseDisabled(new CardMatcher(content.cardMatcher)));

    action.onPlay(this.translator);
  }

  private async onHandleAskForCardDropEvent<T extends GameEventIdentifiers.AskForCardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.createIncomingConversation({
      conversation: TranslationPack.translationJsonPatcher('please drop {0} cards', content.cardAmount).extract(),
      translator: this.translator,
    });
    const action = new SelectCardAction(content.toId, this.store, this.presenter, content);
    const selectedCards = await action.onSelect(content.fromArea, content.cardAmount);

    this.presenter.closeIncomingConversation();
    const event: ClientEventFinder<T> = {
      fromId: content.toId,
      droppedCards: selectedCards,
    };
    this.store.room.broadcast(type, EventPacker.createIdentifierEvent(type, event));
  }

  private onHandleAskForCardUseEvent<T extends GameEventIdentifiers.AskForCardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new ResponsiveUseCardAction(content.toId, this.store, this.presenter, content);
    this.presenter.isSkillDisabled(
      ResponsiveUseCardAction.isSkillsOnResponsiveCardUseDisabled(new CardMatcher(content.cardMatcher)),
    );

    action.onPlay(this.translator);
  }

  private async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useCard(content);
    this.presenter.broadcastUIUpdate();
  }

  // tslint:disable-next-line:no-empty
  private onHandleAimEvent<T extends GameEventIdentifiers.AimEvent>(type: T, content: ServerEventFinder<T>) {}
  private onHandleCardResponseEvent<T extends GameEventIdentifiers.CardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
    // tslint:disable-next-line:no-empty
  ) {}
  // tslint:disable-next-line:no-empty
  private onHandleCardDropEvent<T extends GameEventIdentifiers.CardDropEvent>(type: T, content: ServerEventFinder<T>) {}
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

  private onHandelObtainCardEvent<T extends GameEventIdentifiers.ObtainCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { cardIds, toId } = content;
    this.store.room.getPlayerById(toId).obtainCardIds(...cardIds);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleEquipEvent<T extends GameEventIdentifiers.EquipEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.fromId);
    player.equip(Sanguosha.getCardById<EquipCard>(content.cardId));
    this.presenter.broadcastUIUpdate();
  }

  private onHandleDamageEvent<T extends GameEventIdentifiers.DamageEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onDamage(content.damage);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleRecoverEvent<T extends GameEventIdentifiers.RecoverEvent>(type: T, content: ServerEventFinder<T>) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onRecoverHp(content.recoveredHp);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleGameStartEvent<T extends GameEventIdentifiers.GameStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    content.otherPlayers.forEach(playerInfo => {
      this.store.room.getPlayerById(playerInfo.Id).CharacterId = playerInfo.CharacterId!;
    });
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
    } else {
      const playerInfo = Precondition.exists(
        content.playersInfo.find(playerInfo => playerInfo.Id === content.joiningPlayerId),
        `Unknown player ${content.joiningPlayerName}`,
      );

      this.presenter.playerEnter(playerInfo);
    }
  }

  private onHandlePlayerLeaveEvent<T extends GameEventIdentifiers.PlayerLeaveEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.playerLeave(content.playerId);
  }

  private onHandleChoosingCharacterEvent<T extends GameEventIdentifiers.AskForChoosingCharacterEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onClick = (character: Character) => {
      if (this.presenter.ClientPlayer) {
        this.presenter.ClientPlayer.CharacterId = character.Id;
      }
      this.presenter.closeDialog();
      const response: ClientEventFinder<T> = {
        isGameStart: content.isGameStart,
        chosenCharacter: character.Id,
        fromId: this.store.clientPlayerId,
      };
      this.store.room.broadcast(type, response);
      this.presenter.broadcastUIUpdate();
    };

    this.presenter.createDialog(
      <CharacterSelectorDialog characterIds={content.characterIds} onClick={onClick} translator={this.translator} />,
    );
  }

  private onHandleSyncGameCommonRulesEvent<T extends GameEventIdentifiers.SyncGameCommonRulesEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const { commonRules, toId } = content;
    GameCommonRules.syncSocketObject(this.store.room.getPlayerById(toId), commonRules);
  }

  private onHandleAskForSkillUseEvent<T extends GameEventIdentifiers.AskForSkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new SkillUseAction(content.to, this.store, this.presenter, content);
    action.onSelect(this.translator);
  }

  private onHandlePhaseChangeEvent<T extends GameEventIdentifiers.PhaseChangeEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.onPhaseTo(content.toPlayer, content.to);
    if (content.to === PlayerPhase.PrepareStage) {
      content.fromPlayer && this.presenter.isSkillDisabled(PlayPhaseAction.disableSkills);
      this.store.room.turnTo(content.toPlayer);
      this.presenter.isSkillDisabled(
        PlayPhaseAction.isPlayPhaseSkillsDisabled(this.store.room, this.presenter.ClientPlayer!),
      );

      if (content.fromPlayer) {
        this.store.room.getPlayerById(content.fromPlayer).resetCardUseHistory();

        for (const player of this.store.room.AlivePlayers) {
          for (const skill of player.getSkills()) {
            if (skill.isRefreshAt(content.to)) {
              player.resetSkillUseHistory(skill.Name);
            }
          }
        }
      }
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayCardStage<T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const action = new PlayPhaseAction(content.fromId, this.store, this.presenter);
    action.onPlay();
  }

  private onHandleMoveCardEvent<T extends GameEventIdentifiers.MoveCardEvent>(type: T, content: ServerEventFinder<T>) {
    for (const cardId of content.cardIds) {
      this.store.room
        .getPlayerById(content.toId)
        .getCardIds(content.toArea)
        .push(cardId);
    }

    this.presenter.broadcastUIUpdate();
  }

  private onHandleJudgeEvent<T extends GameEventIdentifiers.JudgeEvent>(type: T, content: ServerEventFinder<T>) {
    //TODO: add animations here
    this.presenter.broadcastUIUpdate();
  }

  private onHandleAskForPeachEvent<T extends GameEventIdentifiers.JudgeEvent>(type: T, content: ServerEventFinder<T>) {
    //TODO
    console.log(type, content);
  }

  private onHandleAskForChoosingCardFromPlayerEvent<T extends GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const onSelectedCard = (card: Card | number, fromArea: PlayerCardsArea) => {
      this.presenter.closeDialog();

      const event: ClientEventFinder<T> = {
        fromArea,
        selectedCard: card instanceof Card ? card.Id : undefined,
        selectedCardIndex: card instanceof Card ? undefined : card,
      };
      this.store.room.broadcast(type, event);
    };

    this.presenter.createDialog(
      <CardSelectorDialog options={content.options} onClick={onSelectedCard} translator={this.translator} />,
    );
  }

  private onHandleCardLoseEvent<T extends GameEventIdentifiers.CardLostEvent>(type: T, content: ServerEventFinder<T>) {
    const { fromId, cardIds } = content;

    this.store.room.getPlayerById(fromId).dropCards(...cardIds);
    this.presenter.broadcastUIUpdate();
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
        this.presenter.disableActionButton('cancel');
      };
    });

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
        this.presenter.disableActionButton('cancel');
      });
    }
  }

  private async onHandleSkillUseEvent<T extends GameEventIdentifiers.SkillUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    await this.store.room.useSkill(content);
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleWuGuFengDengEvent<T extends GameEventIdentifiers.AskForWuGuFengDengEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    let selected = false;
    const onClick = (card: Card) => {
      if (selected) {
        return;
      }

      selected = true;
      const responseEvent: ClientEventFinder<T> = {
        fromId: this.store.clientPlayerId,
        selectedCard: card.Id,
      };

      this.store.room.broadcast(type, responseEvent);
    };

    this.presenter.createDialog(
      <WuGuFengDengDialog
        cards={content.cardIds}
        selected={content.selected.map(selectedCard => ({
          card: selectedCard.card,
          playerObjectText: TranslationPack.patchPlayerInTranslation(
            this.store.room.getPlayerById(selectedCard.player),
          ),
        }))}
        translator={this.translator}
        onClick={this.store.clientPlayerId === content.toId ? onClick : undefined}
      />,
    );
  }

  private async onHandleWuGuFengDengFinish<T extends GameEventIdentifiers.WuGuFengDengFinishEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.closeDialog();
  }
}
