import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class SunCe extends Character {
  constructor(id: number) {
    super(id, 'sunce', CharacterGender.Male, CharacterNationality.Wu, 4, 4, GameCharacterExtensions.Mountain, [
      skillLoaderInstance.getSkillByName('jiang'),
      skillLoaderInstance.getSkillByName('hunzi'),
      skillLoaderInstance.getSkillByName('zhiba'),
    ]);
  }
}
