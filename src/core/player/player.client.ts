import { Character } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerCards, PlayerId } from './player_props';

export class ClientPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    playerCharacter?: Character,
    playerCards?: PlayerCards,
    private avatarUrl?: string,
  ) {
    super(playerCharacter, playerCards);
  }

  public get Avatar() {
    return this.avatarUrl;
  }
}
