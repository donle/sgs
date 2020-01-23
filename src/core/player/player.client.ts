import { CharacterId } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerCards, PlayerCardsOutside, PlayerId } from './player_props';

export class ClientPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & PlayerCardsOutside,
  ) {
    super(playerCards, playerCharacterId);
  }
}
