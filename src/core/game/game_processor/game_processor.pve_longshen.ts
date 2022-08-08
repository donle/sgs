import { Character } from 'core/characters/character';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerInfo, PlayerRole } from 'core/player/player_props';
import { Sanguosha } from '../engine';
import { PveClassicGameProcessor } from './game_processor.pve_classic';
import { pveLongShenSkills } from '../../../core/skills/game_mode/pve/pve_longshen_skills';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TranslationPack } from 'core/translations/translation_json_tool';

export class PveLongshenGameProcessor extends PveClassicGameProcessor {
  protected proposalCharacters: string[] = [];

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
      changedProperties: [{ toId: boss.Id, maxHp: boss.MaxHp + 1, hp: boss.MaxHp + 1, activate: true }],
    });

    const candSkills = pveLongShenSkills.slice();
    console.log(candSkills);
    Algorithm.shuffle(candSkills);

    let weights = 0;
    const except_weights = this.level * this.room.Players.filter(player => !player.isSmartAI()).length + 1;
    while (weights < except_weights) {
      const item = candSkills.shift();
      if (item === undefined) {
        break;
      }

      if (item.weights + weights > except_weights) {
        continue;
      }
      weights += item.weights;
      this.room.obtainSkill(boss.Id, item.name);
    }

    if (this.level > 1) {
      this.drawGameBeginsCards(boss.getPlayerInfo());
    }

    const levelBeginEvent: ServerEventFinder<GameEventIdentifiers.LevelBeginEvent> = {};
    levelBeginEvent.messages = [TranslationPack.translationJsonPatcher('{0} level start', this.level).toString()];
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
