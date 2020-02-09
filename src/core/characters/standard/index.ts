import { GameCharacterExtensions } from 'core/game/game_props';
import { CharacterPackage } from 'core/game/package_loader/loader.characters';
import { CaoCao } from './caocao';
import { LiuBei } from './liubei';
import { SunQuan } from './sunquan';

export const StandardCharacterPackage: (
  index: number,
) => CharacterPackage<GameCharacterExtensions.Standard> = index => ({
  [GameCharacterExtensions.Standard]: [
    new SunQuan(index++),
    new LiuBei(index++),
    new CaoCao(index++),
  ],
});
