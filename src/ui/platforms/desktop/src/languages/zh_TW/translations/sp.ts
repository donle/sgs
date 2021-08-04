import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'maliang', target: '馬良' },
  { source: 'zishu', target: '自書' },
  { source: 'yingyuan', target: '應援' },

  { source: 'zhouqun', target: '周群' },
  { source: 'tiansuan', target: '天算' },
  { source: 'tiansuan:upup', target: '上上籤' },
  { source: 'tiansuan:up', target: '上籤' },
  { source: 'tiansuan:mid', target: '中籤' },
  { source: 'tiansuan:down', target: '下籤' },
  { source: 'tiansuan:downdown', target: '下下籤' },

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
      '<b>鎖定技</b>，當你獲得牌後，若此時是你的：回合內且這些牌不因此技能而獲得，你摸一張牌；回合外，本回合結束時，你將這些牌中仍在你手牌中的牌置入棄牌堆。',
  },
  {
    source: 'yingyuan_description',
    target: '當你於回合內使用基本牌或普通錦囊牌結算結束後，你可以將此牌交給一名其他角色（每種牌名每回合限一次）。',
  },

  {
    source: 'tiansuan_description',
    target:
      '每輪限一次，出牌階段，你可以隨機抽取一個“命運籤”（抽籤開始前，你可以多放入一根想要的“命運籤”），然後選擇一名角色獲得此籤對應的效果直到你的下個回合開始。若為：上上籤，你觀看其手牌並獲得其區域內的一張牌；上籤，你獲得其區域內的一張牌。<br>上上籤：當你受到傷害時，防止之。<br>上籤：當你受到傷害時，傷害值減至1點；當你受到傷害後，你摸X張牌（X為傷害值）。<br>中籤：當你受到傷害時，將此傷害改為火焰傷害，將傷害值減至1點。<br>下籤：當你受到傷害時，此傷害+1。<br>下下籤：當你受到傷害時，此傷害+1；你不能使用【桃】和【酒】。',
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
    target: '<b>鎖定技</b>，距離至你為1的角色不能響應你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '<b>鎖定技</b>，當你造成或受到傷害時，若你的手牌數為全場唯一最多，此傷害+1。',
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

  {
    source: '{0}: do you want to add a stick?',
    target: '{0}：你可以額外加入以下一根“命運籤”',
  },
  {
    source: '{0}: the result is {1}, please choose a target',
    target: '{0}：抽籤結果是 {1}，請選擇一名角色獲得此籤的效果',
  },
];
