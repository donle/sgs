import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'maliang', target: '馬良' },
  { source: 'zishu', target: '自書' },
  { source: 'yingyuan', target: '應援' },

  { source: 'sp_zhaoyun', target: '群趙雲' },
  { source: 'std_longdan', target: '龍膽' },
  { source: 'chongzhen', target: '衝陣' },

  { source: 'quyi', target: '麴義' },
  { source: 'fuji', target: '伏騎' },
  { source: 'jiaozi', target: '驕恣' },

  { source: 'liuqi', target: '劉琦' },
  { source: 'wenji', target: '問計' },
  { source: 'tunjiang', target: '屯江' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zishu_description',
    target:
      '<b>鎖定技，</b>當你獲得牌後，若此時是你的：回合內且這些牌不因此技能而獲得，你摸一張牌；回合外，本回合結束時，你將這些牌中仍在你手牌中的牌置入棄牌堆。',
  },
  {
    source: 'yingyuan_description',
    target: '當你於回合內使用基本牌或普通錦囊牌結算結束後，你可以將此牌交給一名其他角色（每種牌名每回合限一次）。',
  },

  {
    source: 'std_longdan_description',
    target: '你可以將【殺】當【閃】，【閃】當【殺】使用或打出。',
  },
  {
    source: 'chongzhen_description',
    target: '當你發動“龍膽”後，你可以獲得對方的一張手牌。',
  },

  {
    source: 'fuji_description',
    target: '<b>鎖定技，</b>距離至你為1的角色不能響應你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '<b>鎖定技，</b>當你造成或受到傷害時，若你的手牌數為全場唯一最多，此傷害+1。',
  },

  {
    source: 'wenji_description',
    target:
      '出牌階段開始時，你可以令一名其他角色交給你一張牌。若如此做，你於本回合內使用與該牌同名的牌不能被其他角色響應。',
  },
  {
    source: 'tunjiang_description',
    target:
      '結束階段開始時，若你於此回合內未使用牌指定過其他角色為目標，且未跳過本回合的出牌階段，你可以摸X張牌（X為存活勢力數）。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以將 {1} 交給一名其他角色',
  },

  {
    source: '{0}: do you want to prey {1} a hand card?',
    target: '{0}：你可以獲得 {1} 的一張手牌',
  },

  {
    source: '{0}: you can let anothor player give you a card',
    target: '{0}：你可以令一名有牌的其他角色交給你一張牌',
  },
  {
    source: '{0}: you need to give a card to {1}',
    target: '{0}：請選擇一張牌交給 {1}',
  },
];
