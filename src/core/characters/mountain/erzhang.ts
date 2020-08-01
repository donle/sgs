import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class ErZhang extends Character {
  constructor(id: number) {
    super(
      id,
      'zhangzhaozhanghong',
      CharacterGender.Male,
      CharacterNationality.Wu,
      3,
      3,
      GameCharacterExtensions.Mountain,
      [...skillLoaderInstance.getSkillsByName('zhijian'), skillLoaderInstance.getSkillByName('guzheng')],
    );
  }
}
