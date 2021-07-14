import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'quyi', target: '麴义' },
  { source: 'fuji', target: '伏骑' },
  { source: 'jiaozi', target: '骄恣' },

  { source: 'liuqi', target: '刘琦' },
  { source: 'wenji', target: '问计' },
  { source: 'tunjiang', target: '屯江' },
];

export const skillDescriptions: Word[] = [
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
    source: '{0}: you can let anothor player give you a card',
    target: '{0}：你可以令一名有牌的其他角色交给你一张牌',
  },
  {
    source: '{0}: you need to give a card to {1}',
    target: '{0}：请选择一张牌交给 {1}',
  },
];
