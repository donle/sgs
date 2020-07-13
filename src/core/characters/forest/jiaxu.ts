import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class JiaXu extends Character {
  constructor(id: number) {
    super(id, 'jiaxu', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Forest, [
      skillLoaderInstance.getSkillByName('wansha'),
      skillLoaderInstance.getSkillByName('luanwu'),
      skillLoaderInstance.getSkillByName('weimu'),
    ]);
  }
}
