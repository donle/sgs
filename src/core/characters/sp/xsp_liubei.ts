import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class XSPLiuBei extends Character {
  constructor(id: number) {
    super(id, 'xsp_liubei', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.Standard, [
      skillLoaderInstance.getSkillByName('zhaolie'),
      ...skillLoaderInstance.getSkillsByName('liubei_shichou'),
    ]);
  }
}
