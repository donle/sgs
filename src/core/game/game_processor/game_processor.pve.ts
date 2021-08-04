import { Character, CharacterId, CharacterNationality } from 'core/characters/character';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId, PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameMode } from 'core/shares/types/room_props';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { Sanguosha } from '../engine';
import { StandardGameProcessor } from './game_processor.standard';

export class PveGameProcessor extends StandardGameProcessor {
  public assignRoles(players: Player[]) {
    for (let i = 0; i < players.length; i++) {
      if (players[i].isSmartAI()) {
        players[i].Role = PlayerRole.Lord;
        if (i !== 0) {
          [players[0], players[i]] = [players[i], players[0]];
          [players[0].Position, players[i].Position] = [players[i].Position, players[0].Position];
        }
      } else {
        players[i].Role = PlayerRole.Rebel;
      }
    }
  }

  protected async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    // link to  assignRoles
    const lordInfo = playersInfo[0];
    const lordCharacter = Sanguosha.getCharacterByCharaterName('pve_boss');
    const lordPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [{ toId: lordInfo.Id, characterId: lordCharacter.Id }],
    };

    this.room.changePlayerProperties(lordPropertiesChangeEvent);

    const sequentialAsyncResponse: Promise<ClientEventFinder<GameEventIdentifiers.AskForChoosingCharacterEvent>>[] = [];

    const selectedCharacters: CharacterId[] = [lordCharacter.Id];
    const notifyOtherPlayer: PlayerId[] = playersInfo.map(info => info.Id);
    this.room.doNotify(notifyOtherPlayer);

    for (let i = 1; i < playersInfo.length; i++) {
      const characters = this.getSelectableCharacters(5, selectableCharacters, selectedCharacters);
      characters.forEach(character => selectedCharacters.push(character.Id));
      const playerInfo = playersInfo[i];
      this.room.notify(
        GameEventIdentifiers.AskForChoosingCharacterEvent,
        {
          amount: 1,
          characterIds: characters.map(character => character.Id),
          toId: playerInfo.Id,
          translationsMessage: TranslationPack.translationJsonPatcher(
            'lord is {0}, your role is {1}, please choose a character',
            Sanguosha.getCharacterById(lordCharacter.Id).Name,
            Functional.getPlayerRoleRawText(playerInfo.Role!, GameMode.Pve),
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
      nationality?: CharacterNationality;
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
          '{0} select nationality {1}',
          TranslationPack.patchPlayerInTranslation(player),
          Functional.getPlayerNationalityText(player.Nationality),
        ).toString();
      }),
    });
  }
}
