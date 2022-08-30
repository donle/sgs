import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class MaoJie extends Character {
  constructor(id: number) {
    super(id, 'maojie', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Mobile, [
      ...skillLoaderInstance.getSkillsByName('bingqing'),
      ...skillLoaderInstance.getSkillsByName('yingfeng'),
    ]);
  }
}
