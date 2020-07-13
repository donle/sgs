import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class Lusu extends Character {
  constructor(id: number) {
    super(id, 'lusu', CharacterGender.Male, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Forest, [
      ...skillLoaderInstance.getSkillsByName('haoshi'),
      skillLoaderInstance.getSkillByName('dimeng'),
    ]);
  }
}
