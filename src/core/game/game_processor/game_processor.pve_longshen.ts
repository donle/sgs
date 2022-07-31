import { Character } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Sanguosha } from '../engine';
import { PveClassicGameProcessor } from './game_processor.pve_classic';

export class PveLongshenGameProcessor extends PveClassicGameProcessor {
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

  public getWinners(players: Player[]) {
    const alivePlayers = players.filter(player => !player.Dead);
    if (
      alivePlayers.every(player => player.isSmartAI()) ||
      (alivePlayers.every(player => !player.isSmartAI()) && this.level === 7)
    ) {
      return alivePlayers;
    }
  }

  protected async nextLevel() {
    this.level++;
    const boss = this.room.Players.find(player => player.isSmartAI())!;
    const originSkills = Sanguosha.getCharacterByCharaterName('pve_longshen').Skills.map(skill => skill.Name);
    this.room.loseSkill(
      boss.Id,
      boss
        .getPlayerSkills()
        .filter(skill => !originSkills.includes(skill.Name))
        .map(skill => skill.Name),
    );

    this.room.activate({
      changedProperties: [{ toId: boss.Id, maxHp: 4, hp: 4, activate: true }],
    });

    const levelBeginEvent: ServerEventFinder<GameEventIdentifiers.LevelBeginEvent> = {};
    await this.onHandleIncomingEvent(
      GameEventIdentifiers.LevelBeginEvent,
      EventPacker.createIdentifierEvent(GameEventIdentifiers.LevelBeginEvent, levelBeginEvent),
    );
  }

  protected async beforeGameStartPreparation() {
    await this.nextLevel();
  }

  protected async chooseCharacters(playersInfo: PlayerInfo[], selectableCharacters: Character[]) {
    // link to  assignRoles
    const bossPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
      changedProperties: [
        {
          toId: playersInfo.find(info => info.Role === PlayerRole.Rebel)!.Id,
          characterId: Sanguosha.getCharacterByCharaterName('pve_longshen').Id,
        },
      ],
    };

    this.room.changePlayerProperties(bossPropertiesChangeEvent);
    const otherPlayersInfo = playersInfo.filter(info => !this.room.getPlayerById(info.Id).isSmartAI())!;

    await this.sequentialChooseCharacters(otherPlayersInfo, selectableCharacters, []);
  }
}
