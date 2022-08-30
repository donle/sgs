import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'strategem', target: '谋攻篇' },

  { source: 'mou_huangzhong', target: '谋黄忠' },
  { source: 'mou_liegong', target: '烈弓' },
  { source: '#mou_liegong', target: '烈弓（记录花色）' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'mou_liegong_description',
    target:
      '你使用【杀】可指定距离不大于此【杀】点数的其他角色为目标；当你使用牌时，或当你成为其他角色使用牌的目标后，本技能记录此花色；当你使用【杀】指定目标后，你可以亮出牌堆顶X张牌（X为本技能记录的花色数-1），以此法亮出的牌中每有一张与本技能记录的花色相同的牌，此【杀】对其伤害基数便+1。若如此做，当此【杀】结算结束后，清空本技能记录的花色。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$mou_liegong:1',
    target: '勇贯坚石，劲贯三军！',
  },
  {
    source: '$mou_liegong:2',
    target: '吾虽年迈，箭矢犹锋！',
  },
];

export const promptDescriptions: Word[] = [
  
];
