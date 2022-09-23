import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan6', target: '原6' },

  { source: 'sunziliufang', target: '孫資劉放' },
  { source: 'guizao', target: '瑰藻' },
  { source: 'jiyu', target: '譏諛' },

  { source: 'liyan', target: '李嚴' },
  { source: 'duliang', target: '督糧' },
  { source: 'fulin', target: '腹鱗' },

  { source: 'sundeng', target: '孫登' },
  { source: 'kuangbi', target: '匡弼' },

  { source: 'cenhun', target: '岑昏' },
  { source: 'jishe', target: '極奢' },
  { source: '#jishe', target: '極奢' },
  { source: 'lianhuo', target: '鏈禍' },

  { source: 'zhangrang', target: '張讓' },
  { source: 'taoluan', target: '滔亂' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'guizao_description',
    target:
      '棄牌階段結束時，若你於此階段內因規則棄牌而棄置的牌數大於1，且這些牌的花色各不相同，你可以摸一張牌或回覆1點體力。',
  },
  {
    source: 'jiyu_description',
    target:
      '出牌階段，若你有可以使用的手牌，你可以令一名有手牌的角色棄置一張手牌，然後你於此階段內不能再使用與其棄置的牌花色相同的手牌。若其以此法棄置的牌的花色為黑桃，你翻面，其失去1點體力。',
  },

  {
    source: 'duliang_description',
    target:
      '出牌階段限一次，你可以獲得一名其他角色的一張手牌，然後選擇一項：1.令其觀看牌堆頂兩張牌，然後其獲得其中的基本牌；2.令其於其下個摸牌階段多摸一張牌。',
  },
  {
    source: 'fulin_description',
    target: '<b>鎖定技</b>，你於本回合內獲得的牌不計入你的手牌上限。',
  },

  {
    source: 'kuangbi_description',
    target:
      '出牌階段限一次，你可以令一名有牌的其他角色將一至三張牌扣置於你的武將牌上，稱為“弼”。若如此做，你的下個準備階段開始時，你獲得這些“弼”，其摸等量的牌。',
  },

  {
    source: 'jishe_description',
    target: '出牌階段，若你的手牌上限大於0，你可以摸一張牌，然後你的手牌上限於本回合內-1。',
  },
  {
    source: 'lianhuo_description',
    target: '<b>鎖定技</b>，當你受到不為連環傷害的火焰傷害時，若你處於連環狀態，此傷害+1。',
  },

  {
    source: 'taoluan_description',
    target:
      '你可以將一張牌當任意基本牌或普通錦囊牌（不能為你於本局遊戲內以此法使用過的牌）使用，然後你令一名其他角色選擇一項：1.交給你一張與你以此法使用的牌類別不同的牌；2.令你失去1點體力，且本技能於本回合內失效。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$taoluan:1',
    target: '國家承平，神器穩固，陛下勿憂。',
  },
  {
    source: '$taoluan:2',
    target: '睜開你的眼睛看看，現在是誰說了算？',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please put at least 1 and less than 3 cards onto {1} ’s general card as ‘bi’',
    target: '{0}：請將一至三張牌置為 {1} 的“弼”',
  },

  {
    source: 'taoluan: please choose another player to ask for a card',
    target: '滔亂：請選擇一名其他角色，令其選擇是否交給你牌',
  },
  {
    source: '{0}: please give a card to {1}, or he/she will lose 1 hp',
    target: '{0}：你可以交給 {1} 一張符合條件的牌，否則其會失去1點體力，且“滔亂”於本回合內失效',
  },
];
