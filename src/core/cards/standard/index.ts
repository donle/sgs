import { GameCardExtensions } from 'core/game/game_props';
import { CardPackage } from 'core/game/package_loader/loader.cards';
import { CardSuit } from '../libs/card_props';
import { Jink } from './jink';
import { Lightning } from './lightning';
import { NanManRuQing } from './nanmanruqing';
import { Peach } from './peach';
import { QingGang } from './qinggang';
import { Slash } from './slash';
import { WanJianQiFa } from './wanjianqifa';
import { ZhuGeLianNu } from './zhugeliannu';
import { ZiXin } from './zixin';

export const StandardCardPackage: (
  index: number,
) => CardPackage<GameCardExtensions.Standard> = index => ({
  [GameCardExtensions.Standard]: [
    new Slash(index++, 7, CardSuit.Spade),
    new Slash(index++, 8, CardSuit.Spade),
    new Slash(index++, 8, CardSuit.Spade),
    new Slash(index++, 9, CardSuit.Spade),
    new Slash(index++, 9, CardSuit.Spade),
    new Slash(index++, 10, CardSuit.Spade),
    new Slash(index++, 10, CardSuit.Spade),
    new Slash(index++, 2, CardSuit.Club),
    new Slash(index++, 3, CardSuit.Club),
    new Slash(index++, 4, CardSuit.Club),
    new Slash(index++, 5, CardSuit.Club),
    new Slash(index++, 6, CardSuit.Club),
    new Slash(index++, 7, CardSuit.Club),
    new Slash(index++, 8, CardSuit.Club),
    new Slash(index++, 8, CardSuit.Club),
    new Slash(index++, 9, CardSuit.Club),
    new Slash(index++, 9, CardSuit.Club),
    new Slash(index++, 10, CardSuit.Club),
    new Slash(index++, 10, CardSuit.Club),
    new Slash(index++, 11, CardSuit.Club),
    new Slash(index++, 11, CardSuit.Club),
    new Slash(index++, 10, CardSuit.Heart),
    new Slash(index++, 10, CardSuit.Heart),
    new Slash(index++, 11, CardSuit.Heart),
    new Slash(index++, 6, CardSuit.Diamond),
    new Slash(index++, 7, CardSuit.Diamond),
    new Slash(index++, 8, CardSuit.Diamond),
    new Slash(index++, 9, CardSuit.Diamond),
    new Slash(index++, 10, CardSuit.Diamond),
    new Slash(index++, 13, CardSuit.Diamond),
    new Jink(index++, 2, CardSuit.Heart),
    new Jink(index++, 2, CardSuit.Heart),
    new Jink(index++, 13, CardSuit.Heart),
    new Jink(index++, 2, CardSuit.Diamond),
    new Jink(index++, 2, CardSuit.Diamond),
    new Jink(index++, 3, CardSuit.Diamond),
    new Jink(index++, 4, CardSuit.Diamond),
    new Jink(index++, 5, CardSuit.Diamond),
    new Jink(index++, 6, CardSuit.Diamond),
    new Jink(index++, 7, CardSuit.Diamond),
    new Jink(index++, 8, CardSuit.Diamond),
    new Jink(index++, 9, CardSuit.Diamond),
    new Jink(index++, 10, CardSuit.Diamond),
    new Jink(index++, 11, CardSuit.Diamond),
    new Jink(index++, 11, CardSuit.Diamond),
    new Peach(index++, 3, CardSuit.Heart),
    new Peach(index++, 4, CardSuit.Heart),
    new Peach(index++, 6, CardSuit.Heart),
    new Peach(index++, 7, CardSuit.Heart),
    new Peach(index++, 8, CardSuit.Heart),
    new Peach(index++, 9, CardSuit.Heart),
    new Peach(index++, 12, CardSuit.Heart),
    new Peach(index++, 12, CardSuit.Diamond),

    new NanManRuQing(index++, 7, CardSuit.Spade),
    new NanManRuQing(index++, 13, CardSuit.Spade),
    new NanManRuQing(index++, 7, CardSuit.Club),
    new WanJianQiFa(index++, 1, CardSuit.Heart),

    new Lightning(index++, 12, CardSuit.Heart),
    new Lightning(index++, 1, CardSuit.Spade),

    new ZiXin(index++, 13, CardSuit.Diamond),
    new QingGang(index++, 6, CardSuit.Spade),
    new ZhuGeLianNu(index++, 1, CardSuit.Club),
    new ZhuGeLianNu(index++, 1, CardSuit.Diamond),
  ],
});
