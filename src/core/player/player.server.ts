import { Character, CharacterId } from 'core/characters/character';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Languages } from 'translations/languages';
import { PlayerCards, PlayerId } from './player_props';

export class ServerPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    protected playerLanguage: Languages,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards,
  ) {
    super(Sanguosha.getCharacterById(playerCharacterId), playerCards);
  }
}
