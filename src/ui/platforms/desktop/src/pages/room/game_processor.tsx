import { Character, CharacterId } from 'core/characters/character';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import { Action } from './action';
import { CharacterCard } from './character/character';
import styles from './room.module.css';
import { RoomPresenter, RoomStore } from './room.presenter';

export class GameClientProcessor {
  private actionHandler: Action;
  constructor(
    private presenter: RoomPresenter,
    private store: RoomStore,
    private translator: ClientTranslationModule,
  ) {
    this.actionHandler = new Action(this.store, this.presenter);
  }

  private tryToThrowNotReadyException(e: GameEventIdentifiers) {
    if (!this.store.room && e !== GameEventIdentifiers.PlayerEnterEvent) {
      throw new Error(
        'Game client process does not work when client room is not initialized',
      );
    }
  }

  async onHandleIncomingEvent<T extends GameEventIdentifiers>(
    e: T,
    content: ServerEventFinder<T>,
  ) {
    this.tryToThrowNotReadyException(e);

    switch (e) {
      case GameEventIdentifiers.GameReadyEvent:
        this.onHandleGameReadyEvent(e as any, content);
        break;
      case GameEventIdentifiers.GameStartEvent:
        await this.onHandleGameStartEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerEnterEvent:
        this.onHandlePlayerEnterEvent(e as any, content);
        break;
      case GameEventIdentifiers.PlayerLeaveEvent:
        this.onHandlePlayerLeaveEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForChooseCharacterEvent:
        this.onHandleChooseCharacterEvent(e as any, content);
        break;
      case GameEventIdentifiers.DrawCardEvent:
        this.onHandleDrawCardsEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent:
        this.onHandlePlayCardStage(e as any, content);
        break;
      case GameEventIdentifiers.PhaseChangeEvent:
        this.onHandlePhaseChangeEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardUseEvent:
        this.onHandleCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardUseEvent:
        this.onHandleAskForCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardResponseEvent:
        this.onHandleAskForCardResponseEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  private onHandleAskForCardResponseEvent<
    T extends GameEventIdentifiers.AskForCardResponseEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onResponseCardAction(content);
    this.presenter.updateDashboardUI();
    this.presenter.updateClientPlayerUI();
  }

  private onHandleAskForCardUseEvent<
    T extends GameEventIdentifiers.AskForCardUseEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onResponsiveUseCard(content);
    this.presenter.updateDashboardUI();
    this.presenter.updateClientPlayerUI();
  }

  private onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (content.fromId === this.store.clientPlayerId) {
      this.presenter.ClientPlayer?.dropCards(content.cardId);
      this.presenter.updateClientPlayerUI();
    }
  }

  private onHandleGameStartEvent<T extends GameEventIdentifiers.GameStartEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    content.otherPlayers.forEach(playerInfo => {
      this.store.room.getPlayerById(
        playerInfo.Id,
      ).CharacterId = playerInfo.CharacterId!;
    });
    this.presenter.updateDashboardUI();
  }

  private async onHandleGameReadyEvent<
    T extends GameEventIdentifiers.GameReadyEvent
  >(type: T, content: ServerEventFinder<T>) {
    //TODO: fix the bug of player seats
    content.playersInfo.forEach(playerInfo => {
      const player = this.store.room.getPlayerById(playerInfo.Id);
      player.Position = playerInfo.Position;
      player.Role = playerInfo.Role!;
    });
    this.presenter.updateClientPlayerUI();
    this.presenter.updateDashboardUI();
    await this.store.room.gameStart(content.gameStartInfo);
  }

  private onHandlePlayerEnterEvent<
    T extends GameEventIdentifiers.PlayerEnterEvent
  >(type: T, content: ServerEventFinder<T>) {
    if (this.store.clientRoomInfo === undefined) {
      throw new Error('Uninitialized Client room info');
    }

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
    } else {
      const playerInfo = content.playersInfo.find(
        playerInfo => playerInfo.Id === content.joiningPlayerId,
      );

      if (!playerInfo) {
        throw new Error(`Unknown player ${content.joiningPlayerName}`);
      }

      this.presenter.playerEnter(playerInfo);
    }
  }

  private onHandlePlayerLeaveEvent<
    T extends GameEventIdentifiers.PlayerLeaveEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.presenter.playerLeave(content.playerId);
  }

  private onHandleChooseCharacterEvent<
    T extends GameEventIdentifiers.AskForChooseCharacterEvent
  >(type: T, content: ServerEventFinder<T>) {
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
      this.presenter.updateClientPlayerUI();
    };

    this.presenter.createDialog(
      this.translator.tr('please choose a character'),
      this.getCharacterSelector(content.characterIds, onClick),
    );
  }

  private onHandleDrawCardsEvent<T extends GameEventIdentifiers.DrawCardEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    if (this.store.clientPlayerId === content.playerId) {
      this.presenter.ClientPlayer?.obtainCardIds(...content.cardIds);
      this.presenter.updateClientPlayerUI();
    } else {
      this.store.room
        .getPlayerById(content.playerId)
        .obtainCardIds(...content.cardIds);
      this.presenter.updateDashboardUI();
    }
  }

  private onHandlePhaseChangeEvent<
    T extends GameEventIdentifiers.PhaseChangeEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.store.room.turnTo(content.toPlayer, content.to);
    this.presenter.updateClientPlayerUI();
    this.presenter.updateDashboardUI();
  }

  private onHandlePlayCardStage<
    T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onPlayAction(content.fromId);
    this.presenter.enableActionButton('finish');
  }

  private getCharacterSelector(
    characterIds: CharacterId[],
    onClick?: (character: Character) => void,
  ) {
    const characters = characterIds.map(characterId => {
      const character = Sanguosha.getCharacterById(characterId);

      return (
        <CharacterCard
          translator={this.translator}
          character={character}
          key={characterId}
          onClick={onClick}
          className={styles.characterSelectorItem}
        />
      );
    });

    return <div className={styles.characterSelector}>{characters}</div>;
  }
}
