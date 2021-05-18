import { CardValue, CardId } from 'core/cards/libs/card_props';
import { Sanguosha } from 'core/game/engine';

export const standardCardValue = [
  // {Card,value, wane, priority}
  // Equipment
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
  { cardName: 'zhugeliannu'        , value: 35, wane: 0,   priority: 80 },
  { cardName: 'zixing'             , value: 35, wane: 0,   priority: 95 },
  { cardName: 'baiyinshizi'        , value: 35, wane: 0,   priority: 95 },
  { cardName: 'gudingdao'          , value: 35, wane: 0,   priority: 95 },
  { cardName: 'hualiu'             , value: 35, wane: 0,   priority: 95 },
  { cardName: 'muniuliuma'         , value: 35, wane: 0,   priority: 95 },
  { cardName: 'tengjia'            , value: 35, wane: 0,   priority: 95 },
  { cardName: 'zhuqueyushan'       , value: 35, wane: 0,   priority: 95 },

  // Trick
  { cardName: 'wuzhongshengyou'    , value: 59, wane: 0.9, priority: 84 },
  { cardName: 'shunshouqianyang'   , value: 58, wane: 0.9, priority: 83 },
  { cardName: 'guohechaiqiao'      , value: 57, wane: 0.9, priority: 85 },
  { cardName: 'lebusishu'          , value: 56, wane: 0.9, priority: 82 },
  { cardName: 'bingliangcunduan'   , value: 55, wane: 0.9, priority: 81 },
  { cardName: 'duel'               , value: 50, wane: 0.8, priority: 80 },
  { cardName: 'fireattack'         , value: 50, wane: 0.8, priority: 81 },
  { cardName: 'nanmanruqing'       , value: 45, wane: 0,   priority: 85 },
  { cardName: 'wanjianqifa'        , value: 45, wane: 0,   priority: 85 },
  { cardName: 'taoyuanjieyi'       , value: 25, wane: 0,   priority: 0 },
  { cardName: 'wuxiekeji'          , value: 25, wane: 0,   priority: 85 },
  { cardName: 'wugufengdeng'       , value: 25, wane: 0,   priority: 85 },
  { cardName: 'jiedaosharen'       , value: 25, wane: 0,   priority: 0 },
  { cardName: 'tiesuolianhuan'     , value: 22, wane: 0,   priority: 85 },
  { cardName: 'lightning'          , value: 25, wane: 0,   priority: 85 },

  // Basic
  { cardName: 'peach'              , value: 70, wane: 0.5, priority: 50 },
  { cardName: 'jink'               , value: 65, wane: 0.5, priority: 0 },
  { cardName: 'fire_slash'          , value: 60, wane: 0.3, priority: 45 },
  { cardName: 'thunder_slash'       , value: 55, wane: 0.3, priority: 43 },
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
