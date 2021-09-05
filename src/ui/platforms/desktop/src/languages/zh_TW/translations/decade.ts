import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'decade', target: '十週年' },

  { source: 'lijue', target: '李傕' },
  { source: 'langxi', target: '狼襲' },
  { source: 'yisuan', target: '亦算' },

  { source: 'guosi', target: '郭汜' },
  { source: 'tanbei', target: '貪狽' },
  { source: 'sidao', target: '伺盜' },

  { source: 'fanchou', target: '樊稠' },
  { source: 'xingluan', target: '興亂' },

  { source: 'zhangji', target: '張濟' },
  { source: 'lveming', target: '掠命' },
  { source: 'lveming times: {0}', target: '掠命[{0}]' },
  { source: 'tunjun', target: '屯軍' },

  { source: 'liangxing', target: '梁興' },
  { source: 'lulve', target: '擄掠' },
  { source: 'zhuixi', target: '追襲' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'langxi_description',
    target:
      '準備階段開始時，你可以選擇一名體力值不大於你的其他角色，你對其造成0~2點隨機傷害。',
  },
  {
    source: 'yisuan_description',
    target:
      '每階段限一次，當你於出牌階段內使用普通錦囊牌結算結束後，你可以減1點體力上限，獲得之。',
  },

  {
    source: 'tanbei_description',
    target:
      '出牌階段限一次，你可以令一名其他角色選擇一項：1.令你隨機獲得其區域內的一張牌，然後你此階段內不能對其使用牌；2.令你此階段內對其使用牌無距離和次數限制。',
  },
  {
    source: 'sidao_description',
    target:
      '每階段限一次，當你於出牌階段內使用牌結算結束後，若此牌有包含在你於此階段內使用過的上一張牌的目標中的目標角色，你可以將一張手牌當【順手牽羊】對其中一名角色使用（目標須合法）。',
  },

  {
    source: 'xingluan_description',
    target:
      '每階段限一次，當你於出牌階段內使用牌結算結束後，你可以從牌堆隨機獲得點數為6的一張牌。',
  },

  {
    source: 'lveming_description',
    target:
      '出牌階段限一次，你可以令裝備區裡牌數小於你的一名角色選擇一個點數，然後你判定，若結果點數與其所選點數：相等，你對其造成2點傷害；不等，你隨機獲得其區域裡的一張牌。',
  },
  {
    source: 'tunjun_description',
    target:
      '<b>限定技</b>，出牌階段，你可以令有空裝備欄的一名角色依次從牌堆隨機使用X張其裝備區內沒有的副類別的裝備牌（X為你本局遊戲發動過“掠命”的次數）。',
  },

  {
    source: 'lulve_description',
    target:
      '出牌階段開始時，你可以令有手牌且手牌數小於你的一名角色選擇一項：1.將所有手牌交給你，然後你翻面；2.翻面，然後視為對你使用一張【殺】。',
  },
  {
    source: 'zhuixi_description',
    target:
      '<b>鎖定技</b>，當你對一名角色造成傷害時，或一名角色對你造成傷害時，若其武將牌正面朝向與你不同，此傷害+1。',
  },

  {
    source: 'kuangfu_description',
    target:
      '出牌階段限一次，你可以棄置一名角色裝備區裡的一張牌，然後視為使用一張無距離限制的【殺】（不計入次數限制）。若你以此法棄置的牌為：你的牌，且此【殺】造成過傷害，你摸兩張牌；其他角色的牌，且此【殺】未造成過傷害，你棄置兩張手牌。',
  },

  {
    source: 'xuhe_description',
    target:
      '出牌階段開始時，你可以棄置距離1以內的所有角色各一張牌或令這些角色各摸一張牌；出牌階段結束時，若你的體力上限為全場最少，你加1點體力上限。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
    target:
      '{0}；你可以對體力值不大於你的一名其他角色造成0~2點隨機傷害',
  },

  {
    source: '{0}: do you want to lose a max hp to gain {1}?',
    target:
      '{0}；你可以減1點體力上限以獲得 {1}',
  },

  {
    source: '{0}: do you want to gain a card with card number 6 from draw stack?',
    target:
      '{0}；你可以從牌堆隨機獲得點數為6的一張牌',
  },

  {
    source: '{0}: please choose lveming options',
    target:
      '{0}；請選擇一個點數',
  },

  {
    source: '{0}: please choose tanbei options: {1}',
    target:
      '{0}；請選擇一項：1.令 {1} 隨機獲得你區域內的一張牌，然後其本回合不能對你使用牌；2.令 {1} 本回合對你用牌無限制',
  },
  { source: 'tanbei:prey', target: '令其獲得牌' },
  { source: 'tanbei:unlimited', target: '令其對你用牌無限制' },

  {
    source: '{0}: do you want to use a card as ShunShouQianYang to one of them?',
    target:
      '{0}；你可以將一張手牌當【順手牽羊】對其中一名角色使用（目標須合法）',
  },

  {
    source: '{0}: please choose lulve options: {1}',
    target:
      '{0}；請選擇一項：1.交給 {1} 所有手牌，其翻面；2.你翻面，視為對 {1} 使用一張【殺】',
  },
  { source: 'lulve:prey', target: '交給其手牌' },
  { source: 'lulve:turnOver', target: '你翻面' },

  {
    source: '{0}: please choose a target to use a virtual slash to him',
    target:
      '{0}；請為此【殺】選擇目標',
  },

  {
    source: '{0}: please choose xuhe options: {1}',
    target:
      '{0}；你可以棄置 {1} 各一張牌，或令這些角色各摸一張牌',
  },
  { source: 'xuhe:draw', target: '摸牌' },
  { source: 'xuhe:discard', target: '棄置牌' },
];
