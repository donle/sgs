import { GameCharacterExtensions } from 'core/game/game_props';
import { SkillLoader } from 'core/game/package_loader/loader.skills';
import { Character, CharacterGender, CharacterNationality, Lord } from '../character';

const skillLoaderInstance = SkillLoader.getInstance();

@Lord
export class XiaoQiao extends Character {
  constructor(id: number) {
    super(id, 'xiaoqiao', CharacterGender.Female, CharacterNationality.Wu, 3, 3, GameCharacterExtensions.Standard, [
      ...skillLoaderInstance.getSkillsByName('hongyan'),
    ]);
  }
}
