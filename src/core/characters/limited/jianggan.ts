import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLorderInstance = SkillLoader.getInstance();

export class JiangGan extends Character {
  constructor(id: number) {
    super(id, 'jianggan', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Limited, [
      skillLorderInstance.getSkillByName('weicheng'),
      ...skillLorderInstance.getSkillsByName('daoshu'),
    ]);
  }
}
