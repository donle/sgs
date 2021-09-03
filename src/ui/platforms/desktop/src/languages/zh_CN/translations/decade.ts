import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'decade', target: '十周年' },

  { source: 'lijue', target: '李傕' },
  { source: 'langxi', target: '狼袭' },
  { source: 'yisuan', target: '亦算' },

  { source: 'guosi', target: '郭汜' },
  { source: 'tanbei', target: '贪狈' },
  { source: 'sidao', target: '伺盗' },

  { source: 'fanchou', target: '樊稠' },
  { source: 'xingluan', target: '兴乱' },

  { source: 'zhangji', target: '张济' },
  { source: 'lveming', target: '掠命' },
  { source: 'lveming times: {0}', target: '掠命[{0}]' },
  { source: 'tunjun', target: '屯军' },

  { source: 'liangxing', target: '梁兴' },
  { source: 'lulve', target: '掳掠' },
  { source: 'zhuixi', target: '追袭' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'langxi_description',
    target:
      '准备阶段开始时，你可以选择一名体力值不大于你的其他角色，你对其造成0~2点随机伤害。',
  },
  {
    source: 'yisuan_description',
    target:
      '每阶段限一次，当你于出牌阶段内使用普通锦囊牌结算结束后，你可以减1点体力上限，获得之。',
  },

  {
    source: 'tanbei_description',
    target:
      '出牌阶段限一次，你可以令一名其他角色选择一项：1.令你随机获得其区域内的一张牌，然后你此阶段内不能对其使用牌；2.令你此阶段内对其使用牌无距离和次数限制。',
  },
  {
    source: 'sidao_description',
    target:
      '每阶段限一次，当你于出牌阶段内使用牌结算结束后，若此牌有包含在你于此阶段内使用过的上一张牌的目标中的目标角色，你可以将一张手牌当【顺手牵羊】对其中一名角色使用（目标须合法）。',
  },

  {
    source: 'xingluan_description',
    target:
      '每阶段限一次，当你于出牌阶段内使用牌结算结束后，你可以从牌堆随机获得点数为6的一张牌。',
  },

  {
    source: 'lveming_description',
    target:
      '出牌阶段限一次，你可以令装备区里牌数小于你的一名角色选择一个点数，然后你判定，若结果点数与其所选点数：相等，你对其造成2点伤害；不等，你随机获得其区域里的一张牌。',
  },
  {
    source: 'tunjun_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以令有空装备栏的一名角色依次从牌堆随机使用X张其装备区内没有的副类别的装备牌（X为你本局游戏发动过“掠命”的次数）。',
  },

  {
    source: 'lulve_description',
    target:
      '出牌阶段开始时，你可以令有手牌且手牌数小于你的一名角色选择一项：1.将所有手牌交给你，然后你翻面；2.翻面，然后视为对你使用一张【杀】。',
  },
  {
    source: 'zhuixi_description',
    target:
      '<b>锁定技</b>，当你对一名角色造成伤害时，或一名角色对你造成伤害时，若其武将牌正面朝向与你不同，此伤害+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
    target:
      '{0}；你可以对体力值不大于你的一名其他角色造成0~2点随机伤害',
  },

  {
    source: '{0}: do you want to lose a max hp to gain {1}?',
    target:
      '{0}；你可以减1点体力上限以获得 {1}',
  },

  {
    source: '{0}: do you want to gain a card with card number 6 from draw stack?',
    target:
      '{0}；你可以从牌堆随机获得点数为6的一张牌',
  },

  {
    source: '{0}: please choose lveming options',
    target:
      '{0}；请选择一个点数',
  },
];
