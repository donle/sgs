import { GameCharacterExtensions } from 'core/game/game_props';
import { Character, CharacterGender, CharacterNationality } from 'core/characters/character';

export class PveSoldier extends Character {
  constructor(id: number) {
    super(id, 'pve_soldier', CharacterGender.Female, CharacterNationality.God, 4, 4, GameCharacterExtensions.Pve, []);
  }
}
