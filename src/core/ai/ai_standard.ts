// import { BaGuaZhen } from 'core/cards/standard/baguazhen';
// import { ChiTu } from 'core/cards/standard/chitu';
// import { CiXiongJian } from 'core/cards/standard/cixiongjian';
// import { DaYuan } from 'core/cards/standard/dayuan';
// import { DiLu } from 'core/cards/standard/dilu';
// import { Duel } from 'core/cards/standard/duel';
// import { FangTianHuaJi } from 'core/cards/standard/fangtianhuaji';
// import { GuanShiFu } from 'core/cards/standard/guanshifu';
// import { GuoHeChaiQiao } from 'core/cards/standard/guohechaiqiao';
// import { HanBingJian } from 'core/cards/standard/hanbingjian';
// import { JieDaoShaRen } from 'core/cards/standard/jiedaosharen';
// import { Jink } from 'core/cards/standard/jink';
// import { JueYing } from 'core/cards/standard/jueying';
// import { LeBuSiShu } from 'core/cards/standard/lebusishu';
// import { Lightning } from 'core/cards/standard/lightning';
// import { NanManRuQing } from 'core/cards/standard/nanmanruqing';
// import { Peach } from 'core/cards/standard/peach';
// import { QiLinGong } from 'core/cards/standard/qilingong';
// import { QingGang } from 'core/cards/standard/qinggang';
// import { QingLongYanYueDao } from 'core/cards/standard/qinglongdao';
// import { RenWangDun } from 'core/cards/standard/renwangdun';
// import { ShunshouQianYang } from 'core/cards/standard/shunshouqianyang';
// import { Slash } from 'core/cards/standard/slash';
// import { TaoYuanJieYi } from 'core/cards/standard/taoyuanjieyi';
// import { WanJianQiFa } from 'core/cards/standard/wanjianqifa';
// import { WuGuFengDeng } from 'core/cards/standard/wugufengdeng';
// import { WuXieKeJi } from 'core/cards/standard/wuxiekeji';
// import { WuZhongShengYou } from 'core/cards/standard/wuzhongshengyou';
// import { ZhangBaSheMao } from 'core/cards/standard/zhangbashemao';
// import { ZhuaHuangFeiDian } from 'core/cards/standard/zhuahuangfeidian';
// import { ZhuGeLianNu } from 'core/cards/standard/zhugeliannu';
// import { ZiXing } from 'core/cards/standard/zixing';

// import { Alcohol } from 'core/cards/legion_fight/alcohol';
// import { BaiYinShiZi } from 'core/cards/legion_fight/baiyinshizi';
// import { BingLiangCunDuan } from 'core/cards/legion_fight/bingliangcunduan';
// import { FireAttack } from 'core/cards/legion_fight/fire_attack';
// import { FireSlash } from 'core/cards/legion_fight/fire_slash';
// import { GuDingDao } from 'core/cards/legion_fight/gudingdao';
// import { HuaLiu } from 'core/cards/legion_fight/hualiu';
// import { MuNiuLiuMa } from 'core/cards/legion_fight/muniuliuma';
// import { TengJia } from 'core/cards/legion_fight/tengjia';
// import { ThunderSlash } from 'core/cards/legion_fight/thunder_slash';
// import { TieSuoLianHuan } from 'core/cards/legion_fight/tiesuolianhuan';
// import { ZhuQueYuShan } from 'core/cards/legion_fight/zhuqueyushan';

// import { Card } from 'core/cards/card';
import { CardValue, CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export const standardCardValue = [
  // {Card,value, wane, priority}
  { cardName: 'baguazhen'          , value: 35, wane: 0,   priority: 95 },
  { cardName: 'chitu'              , value: 35, wane: 0,   priority: 95 },
  { cardName: 'cixiongjian'        , value: 35, wane: 0,   priority: 95 },
  { cardName: 'dayuan'             , value: 35, wane: 0,   priority: 95 },
  { cardName: 'dilu'               , value: 35, wane: 0,   priority: 95 },
  { cardName: 'fangtianhuaji'      , value: 35, wane: 0,   priority: 95 },
  { cardName: 'guanshifu'          , value: 35, wane: 0,   priority: 95 },
  { cardName: 'jueying'            , value: 35, wane: 0,   priority: 95 },
  { cardName: 'hanbingjian'        , value: 35, wane: 0,   priority: 95 },
  { cardName: 'qilingong'          , value: 35, wane: 0,   priority: 95 },
  { cardName: 'qinggang'           , value: 35, wane: 0,   priority: 95 },
  { cardName: 'qinglongyanyuedao'  , value: 35, wane: 0,   priority: 95 },
  { cardName: 'renwangdun'         , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zhangbashemao'      , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zhuahuangfeidian'   , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zhugeliannu'        , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zixing'             , value: 35, wane: 0,   priority: 95 },
  { cardName: 'baiyinshizi'        , value: 35, wane: 0,   priority: 95 },
  { cardName: 'gudingdao'          , value: 35, wane: 0,   priority: 95 },
  { cardName: 'hualiu'             , value: 35, wane: 0,   priority: 95 },
  { cardName: 'muniuliuma'         , value: 35, wane: 0,   priority: 95 },
  { cardName: 'tengjia'            , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zhuqueyushan'       , value: 35, wane: 0,   priority: 95 },

  // Trick
  { cardName: 'wuzhongshengyou'    , value: 59, wane: 0.9, priority: 85 },
  { cardName: 'shunshouqianyang'   , value: 58, wane: 0.9, priority: 84 },
  { cardName: 'guohechaiqiao'      , value: 57, wane: 0.9, priority: 83 },
  { cardName: 'lebusishu'          , value: 56, wane: 0.9, priority: 82 },
  { cardName: 'bingliangcunduan'   , value: 55, wane: 0.9, priority: 81 },
  { cardName: 'duel'               , value: 50, wane: 0.8, priority: 80 },
  { cardName: 'fireattack'         , value: 50, wane: 0.8, priority: 81 },
  { cardName: 'nanmanruqing'       , value: 45, wane: 0,   priority: 85 },
  { cardName: 'wanjianqifa'        , value: 45, wane: 0,   priority: 85 },
  { cardName: 'taoyuanjieyi'       , value: 25, wane: 0,   priority: 85 },
  { cardName: 'wuxiekeji'          , value: 25, wane: 0,   priority: 85 },
  { cardName: 'wugufengdeng'       , value: 25, wane: 0,   priority: 85 },
  { cardName: 'jiedaosharen'       , value: 25, wane: 0,   priority: 0 },
  { cardName: 'tiesuolianhuan'     , value: 22, wane: 0,   priority: 85 },
  { cardName: 'lightning'          , value: 25, wane: 0,   priority: 85 },

  // Basic
  { cardName: 'peach'              , value: 70, wane: 0.5, priority: 50 },
  { cardName: 'jink'               , value: 65, wane: 0.5, priority: 0 },
  { cardName: 'fireslash'          , value: 60, wane: 0.3, priority: 45 },
  { cardName: 'thunderslash'       , value: 55, wane: 0.3, priority: 43 },
  { cardName: 'alcohol'            , value: 52, wane: 0.4, priority: 49 },
  { cardName: 'slash'              , value: 50, wane: 0.3, priority: 35 },
];


export function getCardValueofCard(cardId: CardId): CardValue {

  let cardValue: CardValue = {
    value: 50,
    wane: 0.5,
    priority: 50
  }

  for (const card of standardCardValue) {
    if (card.cardName === Sanguosha.getCardById(cardId).Name) {
      cardValue = {
        value: card.value,
        wane: card.wane,
        priority: card.priority
      }
      break;
    }
  }

  return cardValue;
}
