import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MiFuRen extends Character {
  constructor(id: number) {
    super(id, 'mifuren', CharacterGender.Female, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Sincerity, [
      ...skillLoaderInstance.getSkillsByName('cunsi'),
      skillLoaderInstance.getSkillByName('guixiu'),
    ]);
  }
}
