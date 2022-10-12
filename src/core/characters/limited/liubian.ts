import { Character, CharacterGender, CharacterNationality, Lord } from '../character';
import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';

const skillLorderInstance = SkillLoader.getInstance();

@Lord
export class LiuBian extends Character {
  constructor(id: number) {
    super(id, 'liubian', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.Limited, [
      ...skillLorderInstance.getSkillsByName('shiyuan'),
      ...skillLorderInstance.getSkillsByName('dushi'),
      skillLorderInstance.getSkillByName('yuwei'),
    ]);
  }
}
