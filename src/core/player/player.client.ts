import { CharacterId } from 'core/characters/character';
import { Player } from 'core/player/player';
import { Languages } from 'translations/languages';
import { PlayerCards, PlayerId } from './player_props';

export class ClientPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    protected playerLanguage: Languages,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards,
  ) {
    super(playerCharacterId, playerCards);
  }
}
