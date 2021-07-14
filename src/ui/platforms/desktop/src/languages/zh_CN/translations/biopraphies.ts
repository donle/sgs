import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'biographies', target: '武将列传' },

  { source: 'caosong', target: '曹嵩' },
  { source: 'lilu', target: '礼赂' },
  { source: 'lilu count: {0}', target: '礼赂[{0}]' },
  { source: 'yizheng', target: '翊正' },

  { source: 'xushao', target: '许劭' },
  { source: 'pingjian', target: '评荐' },
  { source: '#pingjian', target: '评荐' },

  { source: 'wangrong', target: '王荣' },
  { source: 'minsi', target: '敏思' },
  { source: 'jijing', target: '吉境' },
  { source: 'zhuide', target: '追德' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'lilu_description',
    target:
      '摸牌阶段，你可以改为将手牌摸至体力上限（至多摸五张，且无法摸牌也可发动），然后你将至少一张手牌交给一名其他角色。若你此次交出的牌数大于你上次以此法交出的牌数，你加1点体力上限并回复1点体力。',
  },
  {
    source: 'yizheng_description',
    target:
      '结束阶段开始时，你可以选择一名其他角色。若如此做，直到你的下个回合开始，当其造成伤害或回复体力时，若其体力上限小于你，你减1点体力上限，令此伤害值或回复值+1。',
  },

  {
    source: 'pingjian_description',
    target:
      '出牌阶段限一次，结束阶段开始时或当你受到伤害后，你可以观看三个可于当前时机发动的技能，你选择其中一个技能并可发动该技能（每个技能限发动一次）。',
  },

  {
    source: 'minsi_description',
    target:
      '出牌阶段限一次，你可以弃置至少一张点数和为13的牌，然后摸等量的牌。你以此法摸的：红色牌于本回合不计入手牌上限；黑色牌于本回合无距离限制。',
  },
  {
    source: 'jijing_description',
    target:
      '当你受到伤害后，你可以判定，然后若你弃置至少一张点数和为判定结果点数的牌，你回复1点体力。',
  },
  {
    source: 'zhuide_description',
    target:
      '当你死亡时，你可以令一名其他角色获得牌堆里牌名各不相同的四张基本牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw {1} card(s) instead of drawing cards by rule?',
    target: '{0}：你可以放弃摸牌，改为摸 {1} 张牌',
  },
  {
    source: '{0}: do you want to give up to draw cards by rule?',
    target: '{0}：你可以放弃摸牌',
  },
  {
    source: 'lilu: please give a handcard to another player',
    target: '礼赂：请将至少一张手牌交给一名其他角色',
  },

  {
    source: '{0}: do you want to choose a target?',
    target: '{0}：你可以选择一名其他角色',
  },

  {
    source: '{0}: please choose pingjian options',
    target: '{0}：请选择一项技能，然后你可发动所选技能',
  },

  {
    source: '{0}: do you want to drop cards with sum of {1} Card Number to recover 1 hp?',
    target: '{0}：你可以弃置至少一张点数和为 {1} 的牌来回复1点体力',
  },

  {
    source: '{0}: do you want to let another player draw 4 defferent basic cards?',
    target: '{0}：你可以令一名其他角色获得牌堆里四张牌名各不相同的基本牌',
  },
];
