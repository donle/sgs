import { CharacterId } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerCards, PlayerCardsArea, PlayerCardsOutside, PlayerId } from './player_props';

export class ServerPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    protected playerPosition: number,
    playerCharacterId?: CharacterId,
    playerCards?: PlayerCards & {
      [PlayerCardsArea.OutsideArea]: PlayerCardsOutside;
    },
  ) {
    super(playerCards, playerCharacterId);
  }
}
