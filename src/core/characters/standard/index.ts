import { GameCharacterExtensions } from 'core/game/game_props';
import { CharacterPackage } from 'core/game/package_loader/loader.characters';
import { SunQuan } from './sunquan';

export const StandardCharacterPackage: (
  index: number,
) => CharacterPackage<GameCharacterExtensions.Standard> = index => ({
  [GameCharacterExtensions.Standard]: [new SunQuan(index++)],
});
