import { CardId } from 'core/cards/libs/card_props';
import {
  Character,
  CharacterGender,
  CharacterId,
  CharacterNationality,
  HegemonyCharacter,
} from 'core/characters/character';
import {
  CardMoveArea,
  CardMoveReason,
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { HegemonyPlayer, Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { HegemonyServerRoom } from 'core/room/room.hegemony.server';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameMode } from 'core/shares/types/room_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { Sanguosha } from '../engine';
import { GameEventStage, PlayerDiedStage } from '../stage_processor';
import { StandardGameProcessor } from './game_processor.standard';

export class HegemonyGameProcessor extends StandardGameProcessor {
  protected room: HegemonyServerRoom;

  // tslint:disable-next-line: no-empty
  public assignRoles(players: Player[]) {}

  public getWinners(players: HegemonyPlayer[]) {
    const alives = players.filter(player => !player.Dead);
    const nationality = alives[0].Nationality;
    if (alives.every(player => player.Nationality === nationality)) {
      if (nationality !== CharacterNationality.Ambitioner || alives.length === 1) {
        return alives;
      }
    }
  }

  protected async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    const sequentialAsyncResponse: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent>>[] = [];
    const selectedCharacters: CharacterId[] = [];
    const notifyOtherPlayer: PlayerId[] = playersInfo.map(info => info.Id);
    this.room.doNotify(notifyOtherPlayer);

    for (let i = 0; i < playersInfo.length; i++) {
      const playerInfo = playersInfo[i];

      const characters = this.getSelectableCharacters(
        playerInfo.Role === PlayerRole.Lord ? 7 : 5,
        selectableCharacters,
        selectedCharacters,
        character => (playerInfo.Role === PlayerRole.Rebel ? character.Nationality !== CharacterNationality.God : true),
      );
      characters.forEach(character => selectedCharacters.push(character.Id));
      this.room.notify(
        GameEventIdentifiers.AskForChoosingCharacterEvent,
        {
          amount: 1,
          characterIds: characters.map(character => character.Id),
          toId: playerInfo.Id,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'your role is {0}, please choose a character',
            Functional.getPlayerRoleRawText(playerInfo.Role!, GameMode.OneVersusTwo),
          ).extract(),
          ignoreNotifiedStatus: true,
          isHegemonyMode: true,
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
      secondaryCharacterId?: CharacterId;
      maxHp?: number;
      hp?: number;
      nationality?: CharacterNationality;
      gender?: CharacterGender;
    }[] = [];
    for (const response of await Promise.all(sequentialAsyncResponse)) {
      const playerInfo = Precondition.exists(
        playersInfo.find(info => info.Id === response.fromId),
        'Unexpected player id received',
      );

      const character = Sanguosha.getCharacterById<HegemonyCharacter>(response.chosenCharacterIds[0]);
      const secondCharacter = Sanguosha.getCharacterById<HegemonyCharacter>(response.chosenCharacterIds[1]);

      changedProperties.push({
        toId: playerInfo.Id,
        characterId: character.Id,
        secondaryCharacterId: secondCharacter.Id,
      });
    }

    this.room.changePlayerProperties({ changedProperties });
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
          let winner = winners.find(player => player.Role === PlayerRole.Lord);
          if (winner === undefined) {
            winner = winners.find(player => player.Role === PlayerRole.Rebel);
          }

          this.stageProcessor.clearProcess();
          this.playerStages = [];
          this.room.gameOver();
          this.room.broadcast(GameEventIdentifiers.GameOverEvent, {
            translationsMessage: TranslationPack.translationJsonPatcher(
              'game over, winner is {0}',
              Functional.getPlayerRoleRawText(winner!.Role, GameMode.OneVersusTwo),
            ).extract(),
            winnerIds: winners.map(winner => winner.Id),
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

      this.room.getPlayerById(playerId).clearMarks();
      this.room.getPlayerById(playerId).clearFlags();

      if (this.room.CurrentPlayer.Id === playerId) {
        await this.room.skip(playerId);
      }

      if (deadPlayer.Role === PlayerRole.Rebel) {
        const anotherRebel = this.room.AlivePlayers.find(player => player.Role === PlayerRole.Rebel);
        if (!anotherRebel) {
          return;
        }

        const askForChooseOptions: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
          options: anotherRebel.isInjured() ? ['1v2:recover', '1v2:draw'] : ['1v2:draw'],
          toId: anotherRebel.Id,
          conversation: 'please choose',
        };

        this.room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChooseOptions, anotherRebel.Id);
        const { selectedOption } = await this.room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          anotherRebel.Id,
        );
        if (selectedOption) {
          if (selectedOption === '1v2:draw') {
            await this.room.drawCards(2, anotherRebel.Id);
          } else {
            await this.room.recover({
              toId: anotherRebel.Id,
              recoveredHp: 1,
            });
          }
        }
      }
    }
  }
}
