import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'benevolence', target: '仁包' },

  { source: 'caizhenji', target: '蔡贞姬' },
  { source: 'sheyi', target: '舍裔' },
  { source: 'tianyin', target: '天音' },

  { source: 'ren_xujing', target: '仁许靖' },
  { source: 'boming', target: '博名' },
  { source: '#boming', target: '博名（摸牌）' },
  { source: 'ejian', target: '恶荐' },

  { source: 'xiangchong', target: '向宠' },
  { source: 'guying', target: '固营' },
  { source: 'guying: {0}', target: '固营[{0}]' },
  { source: 'muzhen', target: '睦阵' },

  { source: 'liuzhang', target: '刘璋' },
  { source: 'jutu', target: '据土' },
  { source: 'yaohu', target: '邀虎' },
  { source: 'yaohu: {0}', target: '邀虎[{0}]' },
  { source: '#yaohu', target: '邀虎' },
  { source: '#s_yaohu_debuff', target: '邀虎（负面）' },
  { source: 'huaibi', target: '怀璧' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sheyi_description',
    target:
      '每轮限一次，当其他角色受到伤害时，若其体力值小于你，你可以交给其至少X张牌（X为你的体力值），然后防止此伤害。',
  },
  {
    source: 'tianyin_description',
    target: '<b>锁定技</b>，结束阶段开始时，你从牌堆中随机获得你于本回合内未使用过的类别的牌各一张。',
  },

  {
    source: 'guying_description',
    target:
      '<b>锁定技</b>，此项每回合限一次，当你于回合外因使用、打出或弃置而失去仅一张牌后，你获得一枚“固营”标记，然后当前回合角色须选择一项：1.随机交给你一张牌；2.令你获得此牌（若为装备牌，则改为你使用之）。准备阶段开始时，若X大于0，你弃置X张牌（X为你的“固营”标记数），然后移去你的所有“固营”标记。',
  },
  {
    source: 'muzhen_description',
    target:
      '出牌阶段每项限一次，你可以：1.将两张牌交给一名装备区里有牌的其他角色，然后你获得其装备区里的一张牌；2.将一张装备牌置入一名其他角色的装备区，然后获得其一张手牌。',
  },

  {
    source: 'boming_description',
    target:
      '出牌阶段限两次，你可以将一张牌交给一名其他角色，若此为你于此阶段内以此法给出的第二张牌，你于本回合的下个结束阶段开始时摸一张牌。',
  },
  {
    source: 'ejian_description',
    target:
      '<b>锁定技</b>，当其他角色因“博名”而获得牌后，若其有与此牌类别相同的其他牌，其选择一项：1.受到1点伤害；2.展示所有手牌，然后弃置其中所有与此牌类别相同的牌。',
  },

  {
    source: 'jutu_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，你获得你的所有“生”，摸X+1张牌，然后将X张牌置于你的武将牌上，称为“生”（X为你的“邀虎”势力的存活角色数）。',
  },
  {
    source: 'yaohu_description',
    target:
      '回合开始时，你选择场上一个有存活角色的势力作为新的“邀虎”势力（此项每轮限一次）；其他“邀虎”势力角色的出牌阶段开始时，其获得你的一张“生”，然后其选择一项：1.对其攻击范围内由你指定的一名其他角色使用一张【杀】；2.当其于此阶段内使用伤害类牌指定你为目标时，其须交给你两张牌，否则取消之。',
  },
  {
    source: 'huaibi_description',
    target: '<b>主公技</b>，<b>锁定技</b>，你的手牌上限+X（X为你的“邀虎”势力的存活角色数）。',
  },
];

export const skillAudios: Word[] = [];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose ejian options: {1}',
    target: '{0}；请选择以下一项，其中须弃置的牌类别为：{1}',
  },
  { source: 'ejian:damage', target: '受到1点伤害' },
  { source: 'ejian:discard', target: '展示所有手牌并弃置所有此类别的牌' },

  {
    source: '{0}: please choose guying options: {1}',
    target: '{0}；请选择令 {1} 重新获得其失去的牌，或随机交给其一张牌',
  },
  { source: 'guying:giveRandomly', target: '随机交给其一张牌' },
  { source: 'guying:gainCard', target: '令其获得失去的牌' },

  {
    source: '{0}: please choose {1} card(s) to put on your general card as ‘Sheng’',
    target: '{0}；请选择 {1} 张牌置于你的武将牌上，称为“生”',
  },

  {
    source: '{0}: please choose a nationality as ‘Yao Hu’',
    target: '{0}；请选择一个势力作为“邀虎”势力',
  },
  {
    source: 'yaohu: please choose a target to be the target of the slash',
    target: '邀虎：请选择其攻击范围内的一名其他角色作为其需要使用【杀】的目标',
  },
  {
    source: '{0}: please use a slash to {1}',
    target: '{0}：请对 {1} 使用一张【杀】',
  },
  {
    source: '{0}: you need to give 2 cards to {1}, or he/she will be removed from the targets of {2}',
    target: '{0}：请交给 {1} 两张牌，否则其将会从 {2} 的目标中被取消',
  },
];
