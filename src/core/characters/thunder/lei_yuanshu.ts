import { Character, CharacterGender, CharacterNationality, Lord } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LeiYuanShu extends Character {
  constructor(id: number) {
    super(id, 'lei_yuanshu', CharacterGender.Male, CharacterNationality.Qun, 4, 4, GameCharacterExtensions.Thunder, [
      ...skillLoaderInstance.getSkillsByName('lei_yongsi'),
      skillLoaderInstance.getSkillByName('lei_weidi'),
    ]);
  }
}
