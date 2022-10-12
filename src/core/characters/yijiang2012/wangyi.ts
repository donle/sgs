import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class WangYi extends Character {
  constructor(id: number) {
    super(id, 'wangyi', CharacterGender.Female, CharacterNationality.Wei, 4, 4, GameCharacterExtensions.YiJiang2012, [
      skillLoaderInstance.getSkillByName('zhenlie'),
      ...skillLoaderInstance.getSkillsByName('miji'),
    ]);
  }
}
