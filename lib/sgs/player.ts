import { Character } from 'characters/character';

export type PlayerProps = {
  playerId: string;
  playerName: string;
  playerCharacter: Character;
};

export abstract class Player {
  constructor(props: PlayerProps) {
    for (const [key, value] of Object.entries(props)) {
      this[key] = value;
    }
  }
}
