import { Card } from '../card';
import { CardSuit } from '../libs/card_props';
import { BaGuaZhen } from './baguazhen';
import { ChiTu } from './chitu';
import { CiXiongJian } from './cixiongjian';
import { DaYuan } from './dayuan';
import { DiLu } from './dilu';
import { Duel } from './duel';
import { FangTianHuaJi } from './fangtianhuaji';
import { GuanShiFu } from './guanshifu';
import { GuoHeChaiQiao } from './guohechaiqiao';
import { HanBingJian } from './hanbingjian';
import { JieDaoShaRen } from './jiedaosharen';
import { Jink } from './jink';
import { JueYing } from './jueying';
import { LeBuSiShu } from './lebusishu';
import { Lightning } from './lightning';
import { NanManRuQing } from './nanmanruqing';
import { Peach } from './peach';
import { QiLinGong } from './qilingong';
import { QingGang } from './qinggang';
import { QingLongYanYueDao } from './qinglongdao';
import { RenWangDun } from './renwangdun';
import { ShunshouQianYang } from './shunshouqianyang';
import { Slash } from './slash';
import { TaoYuanJieYi } from './taoyuanjieyi';
import { WanJianQiFa } from './wanjianqifa';
import { WuGuFengDeng } from './wugufengdeng';
import { WuXieKeJi } from './wuxiekeji';
import { WuZhongShengYou } from './wuzhongshengyou';
import { ZhangBaSheMao } from './zhangbashemao';
import { ZhuaHuangFeiDian } from './zhuahuangfeidian';
import { ZhuGeLianNu } from './zhugeliannu';
import { ZiXing } from './zixing';

export const StandardCardPackage: (index: number) => Card[] = index => [
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

  new GuoHeChaiQiao(index++, 3, CardSuit.Spade),
  new GuoHeChaiQiao(index++, 4, CardSuit.Spade),
  new GuoHeChaiQiao(index++, 12, CardSuit.Spade),
  new GuoHeChaiQiao(index++, 3, CardSuit.Club),
  new GuoHeChaiQiao(index++, 4, CardSuit.Club),
  new GuoHeChaiQiao(index++, 12, CardSuit.Heart),

  new ShunshouQianYang(index++, 3, CardSuit.Spade),
  new ShunshouQianYang(index++, 4, CardSuit.Spade),
  new ShunshouQianYang(index++, 11, CardSuit.Spade),
  new ShunshouQianYang(index++, 3, CardSuit.Diamond),
  new ShunshouQianYang(index++, 4, CardSuit.Diamond),

  new WuXieKeJi(index++, 11, CardSuit.Spade),
  new WuXieKeJi(index++, 12, CardSuit.Club),
  new WuXieKeJi(index++, 13, CardSuit.Club),
  new WuXieKeJi(index++, 12, CardSuit.Diamond),

  new Duel(index++, 1, CardSuit.Spade),
  new Duel(index++, 1, CardSuit.Club),
  new Duel(index++, 1, CardSuit.Diamond),

  new WuZhongShengYou(index++, 7, CardSuit.Heart),
  new WuZhongShengYou(index++, 8, CardSuit.Heart),
  new WuZhongShengYou(index++, 9, CardSuit.Heart),
  new WuZhongShengYou(index++, 11, CardSuit.Heart),

  new LeBuSiShu(index++, 6, CardSuit.Spade),
  new LeBuSiShu(index++, 6, CardSuit.Club),

  new JieDaoShaRen(index++, 12, CardSuit.Club),
  new JieDaoShaRen(index++, 13, CardSuit.Club),

  new TaoYuanJieYi(index++, 1, CardSuit.Heart),

  new WuGuFengDeng(index++, 3, CardSuit.Heart),
  new WuGuFengDeng(index++, 4, CardSuit.Heart),

  new BaGuaZhen(index++, 2, CardSuit.Spade),
  new BaGuaZhen(index++, 2, CardSuit.Club),

  new RenWangDun(index++, 2, CardSuit.Club),

  new ZiXing(index++, 13, CardSuit.Diamond),
  new ChiTu(index++, 5, CardSuit.Heart),
  new DaYuan(index++, 13, CardSuit.Spade),
  new JueYing(index++, 5, CardSuit.Spade),
  new DiLu(index++, 5, CardSuit.Club),
  new ZhuaHuangFeiDian(index++, 13, CardSuit.Heart),

  new QingGang(index++, 6, CardSuit.Spade),
  new ZhuGeLianNu(index++, 1, CardSuit.Club),
  new ZhuGeLianNu(index++, 1, CardSuit.Diamond),
  new GuanShiFu(index++, 5, CardSuit.Diamond),
  new ZhangBaSheMao(index++, 12, CardSuit.Spade),
  new FangTianHuaJi(index++, 12, CardSuit.Diamond),
  new QingLongYanYueDao(index++, 5, CardSuit.Spade),
  new QiLinGong(index++, 5, CardSuit.Heart),
  new CiXiongJian(index++, 2, CardSuit.Spade),
  new HanBingJian(index++, 2, CardSuit.Spade),
];
