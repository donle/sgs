import { Character, CharacterGender, CharacterNationality } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLoaderInstance = SkillLoader.getInstance();

export class BianFuRen extends Character {
  constructor(id: number) {
    super(id, 'bianfuren', CharacterGender.Female, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Wisdom, [
      ...skillLoaderInstance.getSkillsByName('wanwei'),
      ...skillLoaderInstance.getSkillsByName('yuejian'),
    ]);
  }
}
