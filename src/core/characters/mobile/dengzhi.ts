import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class DengZhi extends Character {
  constructor(id: number) {
    super(id, 'dengzhi', CharacterGender.Male, CharacterNationality.Shu, 3, 3, GameCharacterExtensions.Mobile, [
      skillLoaderInstance.getSkillByName('jimeng'),
      skillLoaderInstance.getSkillByName('shuaiyan'),
    ]);
  }
}
