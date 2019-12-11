import { GameCardExtensions } from 'core/game/game_props';
import { CardPackage } from 'core/game/package_loader/loader.cards';
import { ZiXin } from './zixin';

export const StandardCardPackage: CardPackage<GameCardExtensions.Standard> = {
  [GameCardExtensions.Standard]: [ZiXin],
};
