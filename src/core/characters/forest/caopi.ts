import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class CaoPi extends Character {
  constructor(id: number) {
    super(id, 'caopi', CharacterGender.Male, CharacterNationality.Wei, 3, 3, GameCharacterExtensions.Forest, [
      skillLoaderInstance.getSkillByName('fangzhu'),
      skillLoaderInstance.getSkillByName('xingshang'),
      skillLoaderInstance.getSkillByName('songwei'),
    ]);
  }
}
