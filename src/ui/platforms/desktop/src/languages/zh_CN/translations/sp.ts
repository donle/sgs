import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'maliang', target: '马良' },
  { source: 'zishu', target: '自书' },
  { source: 'yingyuan', target: '应援' },

  { source: 'sp_zhaoyun', target: '群赵云' },
  { source: 'std_longdan', target: '龙胆' },
  { source: 'chongzhen', target: '冲阵' },

  { source: 'quyi', target: '麴义' },
  { source: 'fuji', target: '伏骑' },
  { source: 'jiaozi', target: '骄恣' },

  { source: 'liuqi', target: '刘琦' },
  { source: 'wenji', target: '问计' },
  { source: 'tunjiang', target: '屯江' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zishu_description',
    target:
      '<b>锁定技，</b>当你获得牌后，若此时是你的：回合内且这些牌不因此技能而获得，你摸一张牌；回合外，本回合结束时，你将这些牌中仍在你手牌中的牌置入弃牌堆。',
  },
  {
    source: 'yingyuan_description',
    target: '当你于回合内使用基本牌或普通锦囊牌结算结束后，你可以将此牌交给一名其他角色（每种牌名每回合限一次）。',
  },

  {
    source: 'std_longdan_description',
    target: '你可以将【杀】当【闪】，【闪】当【杀】使用或打出。',
  },
  {
    source: 'chongzhen_description',
    target: '当你发动“龙胆”后，你可以获得对方的一张手牌。',
  },

  {
    source: 'fuji_description',
    target: '<b>锁定技，</b>距离至你为1的角色不能响应你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '<b>锁定技，</b>当你造成或受到伤害时，若你的手牌数为全场唯一最多，此伤害+1。',
  },

  {
    source: 'wenji_description',
    target:
      '出牌阶段开始时，你可以令一名其他角色交给你一张牌。若如此做，你于本回合内使用与该牌同名的牌不能被其他角色响应。',
  },
  {
    source: 'tunjiang_description',
    target:
      '结束阶段开始时，若你于此回合内未使用牌指定过其他角色为目标，且未跳过本回合的出牌阶段，你可以摸X张牌（X为存活势力数）。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以将 {1} 交给一名其他角色',
  },

  {
    source: '{0}: do you want to prey {1} a hand card?',
    target: '{0}：你可以获得 {1} 的一张手牌',
  },

  {
    source: '{0}: you can let anothor player give you a card',
    target: '{0}：你可以令一名有牌的其他角色交给你一张牌',
  },
  {
    source: '{0}: you need to give a card to {1}',
    target: '{0}：请选择一张牌交给 {1}',
  },
];
