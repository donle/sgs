import { EquipCard } from 'core/cards/equip_card';
import { Character, CharacterId } from 'core/characters/character';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerPhase } from 'core/game/stage_processor';
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
        this.onHandleGameStartEvent(e as any, content);
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
        await this.onHandleCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardResponseEvent:
        this.onHandleCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.CardDropEvent:
        this.onHandleCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.EquipEvent:
        this.onHandleEquipEvent(e as any, content);
        break;
      case GameEventIdentifiers.DamageEvent:
        this.onHandleDamageEvent(e as any, content);
        break;
      case GameEventIdentifiers.RecoverEvent:
        this.onHandleRecoverEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardUseEvent:
        this.onHandleAskForCardUseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardResponseEvent:
        this.onHandleAskForCardResponseEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForCardDropEvent:
        this.onHandleAskForCardDropEvent(e as any, content);
        break;
      case GameEventIdentifiers.AskForWuXieKeJiEvent:
        this.onHandleAskForWuXieKeJiEvent(e as any, content);
        break;
      default:
        throw new Error(`Unhandled Game event: ${e}`);
    }
  }

  private onHandleAskForCardResponseEvent<
    T extends GameEventIdentifiers.AskForCardResponseEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onResponseCardAction(content);
  }

  private onHandleAskForCardDropEvent<
    T extends GameEventIdentifiers.AskForCardDropEvent
  >(type: T, content: ServerEventFinder<T>) {
    if (!EventPacker.isUncancellabelEvent(content)) {
      this.presenter.enableActionButton('cancel');
      this.presenter.defineCancelButtonActions(() => {
        const event: ClientEventFinder<T> = {
          fromId: content.toId,
          droppedCards: [],
        };
        this.store.room.broadcast(
          type,
          EventPacker.createIdentifierEvent(type, event),
        );
      });
    }

    this.actionHandler
      .onSelectCardAction(content.fromArea, content.cardAmount)
      .then(selectedCards => {
        const event: ClientEventFinder<T> = {
          fromId: content.toId,
          droppedCards: selectedCards,
        };
        this.store.room.broadcast(
          type,
          EventPacker.createIdentifierEvent(type, event),
        );
      });
  }

  private onHandleAskForCardUseEvent<
    T extends GameEventIdentifiers.AskForCardUseEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onResponsiveUseCard(content);
  }

  private onHandleCardResponseEvent<T extends GameEventIdentifiers.CardResponseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    //TODO: any animations on card response?
    this.store.room.getPlayerById(content.fromId).dropCards(content.cardId);
    this.presenter.broadcastUIUpdate();
  }
  private async onHandleCardUseEvent<T extends GameEventIdentifiers.CardUseEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.store.room.useCard(content);
    this.presenter.broadcastUIUpdate();
  }
  private onHandleCardDropEvent<T extends GameEventIdentifiers.CardDropEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    this.presenter.ClientPlayer!.dropCards(...content.cardIds);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleEquipEvent<T extends GameEventIdentifiers.EquipEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.fromId);
    player.equip(Sanguosha.getCardById<EquipCard>(content.cardId));
    this.presenter.broadcastUIUpdate();
  }

  private onHandleDamageEvent<T extends GameEventIdentifiers.DamageEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onDamage(content.damage);
    this.presenter.broadcastUIUpdate();
  }

  private onHandleRecoverEvent<T extends GameEventIdentifiers.RecoverEvent>(
    type: T,
    content: ServerEventFinder<T>,
  ) {
    const player = this.store.room.getPlayerById(content.toId);
    player.onRecoverHp(content.recoveredHp);
    this.presenter.broadcastUIUpdate();
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
    this.presenter.broadcastUIUpdate();
  }

  private async onHandleGameReadyEvent<
    T extends GameEventIdentifiers.GameReadyEvent
  >(type: T, content: ServerEventFinder<T>) {
    content.playersInfo.forEach(playerInfo => {
      const player = this.store.room.getPlayerById(playerInfo.Id);
      player.Position = playerInfo.Position;
      player.Role = playerInfo.Role!;
    });
    this.store.room.sortPlayers();
    this.presenter.broadcastUIUpdate();
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
      this.presenter.broadcastUIUpdate();
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
    } else {
      this.store.room
        .getPlayerById(content.playerId)
        .obtainCardIds(...content.cardIds);
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePhaseChangeEvent<
    T extends GameEventIdentifiers.PhaseChangeEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.store.room.turnTo(content.toPlayer, content.to);
    if (content.to === PlayerPhase.PrepareStage) {
      content.fromPlayer &&
        this.store.room.getPlayerById(content.fromPlayer).resetCardUseHistory();
    }
    this.presenter.broadcastUIUpdate();
  }

  private onHandlePlayCardStage<
    T extends GameEventIdentifiers.AskForPlayCardsOrSkillsEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.enableFinishButton(content.fromId);
    this.actionHandler.onPlayAction(content.fromId);
  }

  private onHandleAskForWuXieKeJiEvent<
    T extends GameEventIdentifiers.AskForWuXieKeJiEvent
  >(type: T, content: ServerEventFinder<T>) {
    this.actionHandler.onReponseToUseWuXieKeJi(this.presenter.ClientPlayer!.Id);
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
