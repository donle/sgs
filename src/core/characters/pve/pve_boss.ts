import { GameCharacterExtensions } from 'core/game/game_props';
import { Character, CharacterGender, CharacterNationality } from '../character';

export class PveBoss extends Character {
  constructor(id: number) {
    super(id, 'pve_boss', CharacterGender.Female, CharacterNationality.God, 3, 3, GameCharacterExtensions.Pve, []);
  }
}
