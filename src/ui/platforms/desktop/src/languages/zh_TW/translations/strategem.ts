import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'strategem', target: '謀攻篇' },

  { source: 'mou_yujin', target: '謀于禁' },
  { source: 'xiayuan', target: '狹援' },
  { source: 'mou_jieyue', target: '節鉞' },

  { source: 'mou_huangzhong', target: '謀黃忠' },
  { source: 'mou_liegong', target: '烈弓' },
  { source: '#mou_liegong', target: '烈弓（記錄花色）' },

  { source: 'mou_sunquan', target: '謀孫權' },
  { source: 'mou_zhiheng', target: '制衡' },
  { source: 'tongye', target: '統業' },
  { source: 'tongye: {0} {1}', target: '統業[{0}({1})]' },
  { source: '#tongye', target: '統業（判定變化）' },
  { source: 'mou_jiuyuan', target: '救援' },

  { source: 'mou_lvmeng', target: '謀呂蒙' },
  { source: 'mou_keji', target: '克己' },
  { source: 'dujiang', target: '渡江' },
  { source: 'duojing', target: '奪荊' },

  { source: 'mou_huaxiong', target: '謀華雄' },
  { source: 'mou_yaowu', target: '耀武' },
  { source: 'yangwei', target: '揚威' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'xiayuan_description',
    target:
      '每輪限一次，當其他角色受到傷害後，若其因此傷害而扣減了所有護甲值，你可以棄置兩張手牌，令其獲得本次扣減的護甲。',
  },
  {
    source: 'mou_jieyue_description',
    target: '結束階段開始時，你可以令一名其他角色獲得1點護甲，然後其可交給你一張牌。',
  },

  {
    source: 'mou_liegong_description',
    target:
      '若你未裝備武器，則你的不為普通【殺】的【殺】均視為普通【殺】；當你使用牌時，或當你成為其他角色使用牌的目標後，本技能記錄此花色；當你使用【殺】指定目標後，你可以亮出牌堆頂X張牌（X為本技能記錄的花色數-1），以此法亮出的牌中每有一張與本技能記錄的花色相同的牌，此【殺】對其傷害基數便+1。若如此做，當此【殺】結算結束後，清空本技能記錄的花色。',
  },

  {
    source: 'mou_zhiheng_description',
    target:
      '出牌階段限一次，你可以棄置至少一張牌，然後摸等量的牌，若你以此法棄置了所有手牌，你額外摸X+1張牌（X為你的“業”標記數）。',
  },
  {
    source: 'tongye_description',
    target:
      '<b>鎖定技</b>，結束階段開始時，你選擇一項，並於你的下個回合的首個準備階段開始時進行判斷：1.場上裝備區裡的牌數與此時有變；2.場上裝備區裡的牌數與此時不變。若結果：符合，且你的“業”標記數小於2，你獲得1枚“業”標記；不符，移去你的1枚“業”標記。',
  },
  {
    source: 'mou_jiuyuan_description',
    target:
      '<b>主公技</b>，<b>鎖定技</b>，當其他吳勢力角色使用【桃】時，你摸一張牌；當你成為其他吳勢力角色使用【桃】的目標後，此【桃】對你的回覆值+1。',
  },

  {
    source: 'mou_keji_description',
    target:
      '出牌階段限一次，你可以選擇一項：1.棄置一張牌，然後獲得1點護甲；2.失去1點體力，然後獲得2點護甲。選擇執行完畢後，若存活角色數不少於5，你可執行另外一項；你的手牌上限+X（X為你的護甲值）；若你不處於瀕死狀態，你不能使用【桃】。',
  },
  {
    source: 'dujiang_description',
    target: '<b>覺醒技</b>，準備階段開始時，若你的護甲值不少於3點，你獲得技能“奪荊”。',
  },
  {
    source: 'duojing_description',
    target:
      '當你使用【殺】指定目標後，你可以減1點護甲，令此【殺】無視防具，然後你獲得其一張牌，且當此【殺】於此階段內結算結束後，你使用【殺】的次數上限於此階段內+1。',
  },

  {
    source: 'mou_yaowu_description',
    target:
      '<b>鎖定技</b>，當你受【殺】造成的傷害時，若此【殺】：為紅色，傷害來源回覆1點體力或摸一張牌；不為紅色，你摸一張牌。',
  },
  {
    source: 'yangwei_description',
    target:
      '出牌階段，你可以摸兩張牌，令你於此階段內使用【殺】的次數上限+1、使用【殺】無距離限制且無視防具，然後本技能失效直到本回合後你的下個結束階段開始時。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$mou_liegong:1',
    target: '勇貫堅石，勁貫三軍！',
  },
  {
    source: '$mou_liegong:2',
    target: '吾雖年邁，箭矢猶鋒！',
  },
];

export const promptDescriptions: Word[] = [
  { source: 'tongye:change', target: '有變' },
  { source: 'tongye:unchange', target: '不變' },
];
