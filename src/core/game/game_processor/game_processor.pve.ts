import { Character } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Sanguosha } from '../engine';
import { PveClassicGameProcessor } from './game_processor.pve_classic';

export class PveGameProcessor extends PveClassicGameProcessor {
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
      players[i].Role = players[i].isSmartAI() ? PlayerRole.Lord : PlayerRole.Rebel;
      players[i].Position = i;
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
