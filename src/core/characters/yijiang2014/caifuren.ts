import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class CaiFuRen extends Character {
  constructor(id: number) {
    super(id, 'caifuren', CharacterGender.Female, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2014, [
      skillLoaderInstance.getSkillByName('qieting'),
      skillLoaderInstance.getSkillByName('xianzhou'),
    ]);
  }
}
