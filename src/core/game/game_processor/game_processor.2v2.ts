import { CardId } from 'core/cards/libs/card_props';
import { Character, CharacterGender, CharacterId, CharacterNationality } from 'core/characters/character';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Algorithm } from 'core/shares/libs/algorithm';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameMode } from 'core/shares/types/room_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { Sanguosha } from '../engine';
import { GameEventStage, PlayerDiedStage, PlayerPhase } from '../stage_processor';
import { StandardGameProcessor } from './game_processor.standard';

export class TwoVersusTwoGameProcessor extends StandardGameProcessor {
  public assignRoles(players: Player[]) {
    const combinations = [
      [PlayerRole.Loyalist, PlayerRole.Rebel, PlayerRole.Rebel, PlayerRole.Loyalist],
      [PlayerRole.Loyalist, PlayerRole.Rebel, PlayerRole.Loyalist, PlayerRole.Rebel],
    ];
    const reverseRole = {
      [PlayerRole.Loyalist]: PlayerRole.Rebel,
      [PlayerRole.Rebel]: PlayerRole.Loyalist,
    };
    const randomIndex = Math.random() >= 0.5 ? 1 : 0;
    const roles = combinations[randomIndex];
    const reverse = Math.random() >= 0.5;
    for (let i = 0; i < players.length; i++) {
      players[i].Role = reverse ? reverseRole[roles[i]] : roles[i];
    }
  }

  public getRoles() {
    return [PlayerRole.Loyalist, PlayerRole.Loyalist, PlayerRole.Rebel, PlayerRole.Rebel];
  }

  public getWinners(players: Player[]) {
    const rebels = players.filter(player => player.Role === PlayerRole.Rebel && player.Dead);
    const loyalists = players.filter(player => player.Role === PlayerRole.Loyalist && player.Dead);

    if (loyalists.length === 2) {
      return players.filter(player => player.Role === PlayerRole.Rebel);
    } else if (rebels.length === 2) {
      return players.filter(player => player.Role === PlayerRole.Loyalist);
    }
  }

  protected async drawGameBeginsCards(playerInfo: PlayerInfo) {
    const cardIds = this.room.getCards(playerInfo.Position === 3 ? 5 : 4, 'top');
    const playerId = playerInfo.Id;
    this.room.transformCard(this.room.getPlayerById(playerId), cardIds, PlayerCardsArea.HandArea);

    const drawEvent: ServerEventFinder<GameEventIdentifiers.DrawCardEvent> = {
      drawAmount: cardIds.length,
      fromId: playerId,
      askedBy: playerId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} draws {1} cards',
        TranslationPack.patchPlayerInTranslation(this.room.getPlayerById(playerId)),
        cardIds.length,
      ).extract(),
    };

    this.room.broadcast(GameEventIdentifiers.DrawCardEvent, drawEvent);
    this.room.broadcast(GameEventIdentifiers.MoveCardEvent, {
      moveReason: CardMoveReason.CardDraw,
      movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.DrawStack })),
      toArea: CardMoveArea.HandArea,
      toId: playerId,
    });
    this.room
      .getPlayerById(playerId)
      .getCardIds(PlayerCardsArea.HandArea)
      .push(...cardIds);
  }

  protected async onPlayerDrawCardStage(phase: PlayerPhase) {
    this.logger.debug('enter draw cards phase');
    await this.room.drawCards(
      this.currentPhasePlayer.Position === 0 && this.room.Round === 0 ? 1 : 2,
      this.currentPhasePlayer.Id,
      'top',
      undefined,
      undefined,
      CardDrawReason.GameStage,
    );
  }

  protected async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    const sequentialAsyncResponse: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent>>[] = [];
    const selectedCharacters: CharacterId[] = [];
    const notifyOtherPlayer: PlayerId[] = playersInfo.map(info => info.Id);
    this.room.doNotify(notifyOtherPlayer);

    for (let i = 0; i < playersInfo.length; i++) {
      const playerInfo = playersInfo[i];

      const characters = this.getSelectableCharacters(5, selectableCharacters, selectedCharacters);
      characters.forEach(character => selectedCharacters.push(character.Id));
      this.room.notify(
        GameEventIdentifiers.AskForChoosingCharacterEvent,
        {
          amount: 1,
          characterIds: characters.map(character => character.Id),
          toId: playerInfo.Id,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'your role is {0}, please choose a character',
            Functional.getPlayerRoleRawText(playerInfo.Role!, GameMode.TwoVersusTwo),
          ).extract(),
          ignoreNotifiedStatus: true,
        },
        playerInfo.Id,
      );

      sequentialAsyncResponse.push(
        this.room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingCharacterEvent, playerInfo.Id),
      );
    }

    const changedProperties: {
      toId: PlayerId;
      characterId?: CharacterId;
      maxHp?: number;
      hp?: number;
      nationality?: CharacterNationality;
      gender?: CharacterGender;
    }[] = [];
    const askForChooseNationalities: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent>>[] = [];
    for (const response of await Promise.all(sequentialAsyncResponse)) {
      const playerInfo = Precondition.exists(
        playersInfo.find(info => info.Id === response.fromId),
        'Unexpected player id received',
      );

      const character = Sanguosha.getCharacterById(response.chosenCharacterIds[0]);
      changedProperties.push({
        toId: playerInfo.Id,
        characterId: character.Id,
        maxHp: playerInfo.Role === PlayerRole.Lord ? character.MaxHp + 1 : undefined,
        hp: playerInfo.Role === PlayerRole.Lord ? character.Hp + 1 : undefined,
      });

      if (character.Nationality === CharacterNationality.God) {
        askForChooseNationalities.push(this.askForChoosingNationalities(playerInfo.Id));
      }
    }

    this.room.doNotify(notifyOtherPlayer);
    const godNationalityPlayers: PlayerId[] = [];
    for (const response of await Promise.all(askForChooseNationalities)) {
      const property = Precondition.exists(
        changedProperties.find(obj => obj.toId === response.fromId),
        'Unexpected player id received',
      );

      godNationalityPlayers.push(property.toId);
      property.nationality = Functional.getPlayerNationalityEnum(response.selectedOption!);
    }
    this.room.sortPlayersByPosition(godNationalityPlayers);

    this.room.changePlayerProperties({ changedProperties });
    this.room.broadcast(GameEventIdentifiers.CustomGameDialog, {
      messages: godNationalityPlayers.map(id => {
        const player = this.room.getPlayerById(id);
        return TranslationPack.translationJsonPatcher(
          '{0} select nationaliy {1}',
          TranslationPack.patchPlayerInTranslation(player),
          Functional.getPlayerNationalityText(player.Nationality),
        ).toString();
      }),
    });
  }

  protected async onHandlePlayerDiedEvent(
    identifier: GameEventIdentifiers.PlayerDiedEvent,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>,
    onActualExecuted?: (stage: GameEventStage) => Promise<boolean>,
  ) {
    const deadPlayer = this.room.getPlayerById(event.playerId);
    await this.iterateEachStage(identifier, event, onActualExecuted, async stage => {
      if (stage === PlayerDiedStage.PrePlayerDied) {
        this.room.broadcast(identifier, event);
        deadPlayer.bury();

        const winners = this.room.getGameWinners();
        if (winners) {
          const winner = winners[0];

          this.stageProcessor.clearProcess();
          this.playerStages = [];
          this.room.gameOver();
          this.room.broadcast(GameEventIdentifiers.GameOverEvent, {
            translationsMessage: TranslationPack.translationJsonPatcher(
              'game over, winner is {0}',
              Functional.getPlayerRoleRawText(winner.Role, GameMode.TwoVersusTwo),
            ).extract(),
            winnerIds: winners.map(w => w.Id),
            loserIds: this.room.Players.filter(player => !winners.includes(player)).map(player => player.Id),
          });
        }
      }
    });

    if (!this.room.isGameOver()) {
      const { playerId } = event;
      await this.room.moveCards({
        moveReason: CardMoveReason.SelfDrop,
        fromId: playerId,
        movingCards: deadPlayer
          .getPlayerCards()
          .map(cardId => ({ card: cardId, fromArea: deadPlayer.cardFrom(cardId) })),
        toArea: CardMoveArea.DropStack,
      });

      const outsideCards = Object.entries(deadPlayer.getOutsideAreaCards()).reduce<CardId[]>(
        (allCards, [areaName, cards]) => {
          if (!deadPlayer.isCharacterOutsideArea(areaName)) {
            allCards.push(...cards);
          }
          return allCards;
        },
        [],
      );

      const allCards = [...deadPlayer.getCardIds(PlayerCardsArea.JudgeArea), ...outsideCards];
      await this.room.moveCards({
        moveReason: CardMoveReason.PlaceToDropStack,
        fromId: playerId,
        movingCards: allCards.map(cardId => ({ card: cardId, fromArea: deadPlayer.cardFrom(cardId) })),
        toArea: CardMoveArea.DropStack,
      });

      if (this.room.CurrentPlayer.Id === playerId) {
        await this.room.skip(playerId);
      }

      const teammate = this.room.AlivePlayers.find(player => player.Role === deadPlayer.Role);
      if (teammate) {
        await this.room.drawCards(1, teammate.Id);
      }
    }
  }
}
