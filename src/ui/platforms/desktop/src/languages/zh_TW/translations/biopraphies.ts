import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'biographies', target: '武將列傳' },

  { source: 'caosong', target: '曹嵩' },
  { source: 'lilu', target: '禮賂' },
  { source: 'lilu count: {0}', target: '禮賂[{0}]' },
  { source: 'yizheng', target: '翊正' },

  { source: 'xushao', target: '許劭' },
  { source: 'pingjian', target: '評薦' },
  { source: '#pingjian', target: '評薦' },

  { source: 'wangrong', target: '王榮' },
  { source: 'minsi', target: '敏思' },
  { source: 'jijing', target: '吉境' },
  { source: 'zhuide', target: '追德' },

  { source: 'dingyuan', target: '丁原' },
  { source: 'cixiao', target: '慈孝' },
  { source: 'cixiao:yizi', target: '義子' },
  { source: 'xianshuai', target: '先率' },
  { source: 'panshi', target: '叛弒' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'lilu_description',
    target:
      '摸牌階段，你可以改為將手牌摸至體力上限（最多摸至五張，且無法摸牌也可發動），然後你將至少一張手牌交給一名其他角色。若你此次交出的牌數大於你上次以此法交出的牌數，你加1點體力上限並回復1點體力。',
  },
  {
    source: 'yizheng_description',
    target:
      '結束階段開始時，你可以選擇一名其他角色。若如此做，直到你的下個回合開始，當其造成傷害或回覆體力時，若其體力上限小於你，你減1點體力上限，令此傷害值或回覆值+1。',
  },

  {
    source: 'pingjian_description',
    target:
      '出牌階段限一次，結束階段開始時或當你受到傷害後，你可以觀看三個可於當前時機發動的技能，你選擇其中一個技能並可發動該技能（每個技能限發動一次）。',
  },

  {
    source: 'minsi_description',
    target:
      '出牌階段限一次，你可以棄置至少一張點數和為13的牌，然後摸等量的牌。你以此法摸的：紅色牌於本回合不計入手牌上限；黑色牌於本回合無距離限制。',
  },
  {
    source: 'jijing_description',
    target: '當你受到傷害後，你可以判定，然後若你棄置至少一張點數和為判定結果點數的牌，你回覆1點體力。',
  },
  {
    source: 'zhuide_description',
    target: '當你死亡時，你可以令一名其他角色獲得牌堆裡牌名各不相同的四張基本牌。',
  },

  {
    source: 'cixiao_description',
    target:
      '準備階段開始時，你可以選擇一名沒有“義子”的其他角色，移去場上所有的“義子”標記，其獲得1枚“義子”標記，其視為擁有“叛弒”（<b>鎖定技</b>，準備階段開始時，你將一張手牌交給一名擁有技能“慈孝”的其他角色；當你於出牌階段內使用【殺】對擁有技能“慈孝”的角色造成傷害時，此傷害+1且你結束此階段）。',
  },
  {
    source: 'xianshuai_description',
    target:
      '<b>鎖定技，</b>當一名角色造成傷害後，若此傷害時本輪內造成過的第一次傷害，你摸一張牌，然後若傷害來源為你，你對受傷角色造成1點傷害。',
  },
  {
    source: 'panshi_description',
    target:
      '<b>鎖定技</b>，準備階段開始時，你將一張手牌交給一名擁有技能“慈孝”的其他角色；當你於出牌階段內使用【殺】對擁有技能“慈孝”的角色造成傷害時，此傷害+1且你結束此階段。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw {1} card(s) instead of drawing cards by rule?',
    target: '{0}：你可以放棄摸牌，改為摸 {1} 張牌',
  },
  {
    source: '{0}: do you want to give up to draw cards by rule?',
    target: '{0}：你可以放棄摸牌',
  },
  {
    source: 'lilu: please give a handcard to another player',
    target: '禮賂：請將至少一張手牌交給一名其他角色',
  },

  {
    source: '{0}: do you want to choose a target?',
    target: '{0}：你可以選擇一名其他角色',
  },

  {
    source: '{0}: please choose pingjian options',
    target: '{0}：請選擇一項技能，然後你可發動所選技能',
  },

  {
    source: '{0}: do you want to drop cards with sum of {1} Card Number to recover 1 hp?',
    target: '{0}：你可以棄置至少一張點數和為 {1} 的牌來回復1點體力',
  },

  {
    source: '{0}: do you want to let another player draw 4 defferent basic cards?',
    target: '{0}：你可以令一名其他角色獲得牌堆裡四張牌名各不相同的基本牌',
  },

  {
    source: '{0}: do you want to choose another player to be your son?',
    target: '{0}：你可以令一名其他角色獲得“義子”標記',
  },

  {
    source: 'panshi: please choose one hand card and one target',
    target: '叛弒：請選擇一張手牌，交給其中一名角色',
  },
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：請將一張手牌交給 {1}',
  },
];
