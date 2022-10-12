import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class LiuChen extends Character {
  constructor(id: number) {
    super(id, 'liuchen', CharacterGender.Male, CharacterNationality.Shu, 4, 4, GameCharacterExtensions.YiJiang2015, [
      ...skillLoaderInstance.getSkillsByName('zhanjue'),
    ]);
  }
}
