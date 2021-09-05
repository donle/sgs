import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class SunLuBan extends Character {
  constructor(id: number) {
    super(id, 'sunluban', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.YiJiang2014, [
      ...skillLoaderInstance.getSkillsByName('zenhui'),
      skillLoaderInstance.getSkillByName('jiaojin'),
    ]);
  }
}
