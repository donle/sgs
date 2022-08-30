import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'benevolence', target: '仁包' },

  { source: 'caizhenji', target: '蔡貞姬' },
  { source: 'sheyi', target: '舍裔' },
  { source: 'tianyin', target: '天音' },

  { source: 'ren_xujing', target: '仁許靖' },
  { source: 'boming', target: '博名' },
  { source: '#boming', target: '博名（摸牌）' },
  { source: 'ejian', target: '惡薦' },

  { source: 'xiangchong', target: '向寵' },
  { source: 'guying', target: '固營' },
  { source: 'guying: {0}', target: '固營[{0}]' },
  { source: 'muzhen', target: '睦陣' },

  { source: 'liuzhang', target: '劉璋' },
  { source: 'jutu', target: '據土' },
  { source: 'yaohu', target: '邀虎' },
  { source: 'yaohu: {0}', target: '邀虎[{0}]' },
  { source: '#yaohu', target: '邀虎' },
  { source: '#s_yaohu_debuff', target: '邀虎（負面）' },
  { source: 'huaibi', target: '懷璧' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sheyi_description',
    target:
      '每輪限一次，當其他角色受到傷害時，若其體力值小於你，你可以交給其至少X張牌（X為你的體力值），然後防止此傷害。',
  },
  {
    source: 'tianyin_description',
    target: '<b>鎖定技</b>，結束階段開始時，你從牌堆中隨機獲得你於本回合內未使用過的類別的牌各一張。',
  },

  {
    source: 'guying_description',
    target:
      '<b>鎖定技</b>，此項每回合限一次，當你於回合外因使用、打出或棄置而失去僅一張牌後，你獲得一枚“固營”標記，然後當前回合角色須選擇一項：1.隨機交給你一張牌；2.令你獲得此牌（若為裝備牌，則改為你使用之）。準備階段開始時，若X大於0，你棄置X張牌（X為你的“固營”標記數），然後移去你的所有“固營”標記。',
  },
  {
    source: 'muzhen_description',
    target:
      '出牌階段每項限一次，你可以：1.將兩張牌交給一名裝備區裡有牌的其他角色，然後你獲得其裝備區裡的一張牌；2.將一張裝備牌置入一名其他角色的裝備區，然後獲得其一張手牌。',
  },

  {
    source: 'boming_description',
    target:
      '出牌階段限兩次，你可以將一張牌交給一名其他角色，若此為你於此階段內以此法給出的第二張牌，你於本回合的下個結束階段開始時摸一張牌。',
  },
  {
    source: 'ejian_description',
    target:
      '<b>鎖定技</b>，當其他角色因“博名”而獲得牌後，若其有與此牌類別相同的其他牌，其選擇一項：1.受到1點傷害；2.展示所有手牌，然後棄置其中所有與此牌類別相同的牌。',
  },

  {
    source: 'jutu_description',
    target:
      '<b>鎖定技</b>，準備階段開始時，你獲得你的所有“生”，摸X+1張牌，然後將X張牌置於你的武將牌上，稱為“生”（X為你的“邀虎”勢力的存活角色數）。',
  },
  {
    source: 'yaohu_description',
    target:
      '回合開始時，你選擇場上一個有存活角色的勢力作為新的“邀虎”勢力（此項每輪限一次）；其他“邀虎”勢力角色的出牌階段開始時，其獲得你的一張“生”，然後其選擇一項：1.對其攻擊範圍內由你指定的一名其他角色使用一張【殺】；2.當其於此階段內使用傷害類牌指定你為目標時，其須交給你兩張牌，否則取消之。',
  },
  {
    source: 'huaibi_description',
    target: '<b>主公技</b>，<b>鎖定技</b>，你的手牌上限+X（X為你的“邀虎”勢力的存活角色數）。',
  },
];

export const skillAudios: Word[] = [];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose ejian options: {1}',
    target: '{0}；請選擇以下一項，其中須棄置的牌類別為：{1}',
  },
  { source: 'ejian:damage', target: '受到1點傷害' },
  { source: 'ejian:discard', target: '展示所有手牌並棄置所有此類別的牌' },

  {
    source: '{0}: please choose guying options: {1}',
    target: '{0}；請選擇令 {1} 重新獲得其失去的牌，或隨機交給其一張牌',
  },
  { source: 'guying:giveRandomly', target: '隨機交給其一張牌' },
  { source: 'guying:gainCard', target: '令其獲得失去的牌' },

  {
    source: '{0}: please choose {1} card(s) to put on your general card as ‘Sheng’',
    target: '{0}；請選擇 {1} 張牌置於你的武將牌上，稱為“生”',
  },

  {
    source: '{0}: please choose a nationality as ‘Yao Hu’',
    target: '{0}；請選擇一個勢力作為“邀虎”勢力',
  },
  {
    source: 'yaohu: please choose a target to be the target of the slash',
    target: '邀虎：請選擇其攻擊範圍內的一名其他角色作為其需要使用【殺】的目標',
  },
  {
    source: '{0}: please use a slash to {1}',
    target: '{0}：請對 {1} 使用一張【殺】',
  },
  {
    source: '{0}: you need to give 2 cards to {1}, or he/she will be removed from the targets of {2}',
    target: '{0}：請交給 {1} 兩張牌，否則其將會從 {2} 的目標中被取消',
  },
];
