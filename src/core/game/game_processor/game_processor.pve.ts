import { Character } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Sanguosha } from '../engine';
import { StandardGameProcessor } from './game_processor.standard';

export class PveGameProcessor extends StandardGameProcessor {
  protected proposalCharacters: string[] = [
    'simayi',
    'yujin',
    'guojia',
    'caoren',
    'xuchu',
    'guanyu',
    'wolong',
    'zhangfei',
    'huangzhong',
    'machao',
    'luxun',
    'sunce',
    'zhouyu',
    'lvmeng',
    'lusu',
    'liubei',
    'caocao',
    'sunquan',
    'zhangjiao',
    'xingdaorong',
  ];

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
    const otherPlayersInfo = playersInfo.filter(info => !this.room.getPlayerById(info.Id).isSmartAI())!;

    await this.sequentialChooseCharacters(otherPlayersInfo, selectableCharacters, []);
  }
}
