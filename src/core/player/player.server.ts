import { CardId } from 'core/cards/card';
import { Character } from 'core/characters/character';
import { Player } from 'core/player/player';
import { PlayerCards, PlayerCardsArea, PlayerId } from './player_props';

export class ServerPlayer extends Player {
  constructor(
    protected playerId: PlayerId,
    protected playerName: string,
    playerCharacter?: Character,
    playerCards?: PlayerCards,
  ) {
    super(playerCharacter, playerCards);
  }
}
