import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { JueCe } from 'core/skills/characters/yijiang2013/juece';
import { Character, CharacterGender, CharacterNationality } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

export class LiRu extends Character {
  constructor(id: number) {
    super(id, 'liru', CharacterGender.Male, CharacterNationality.Qun, 3, 3, GameCharacterExtensions.YiJiang2013, [
      skillLoaderInstance.getSkillByName(JueCe.Name),
    ]);
  }
}
