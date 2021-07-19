import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'shadow', target: '陰' },

  { source: 'wangji', target: '王基' },
  { source: 'qizhi', target: '奇制' },
  { source: 'qizhi times: {0}', target: '奇制[{0}]' },
  { source: 'jinqu', target: '進趨' },

  { source: 'luji', target: '陸績' },
  { source: 'huaiju', target: '懷橘' },
  { source: 'orange', target: '橘' },
  { source: 'weili', target: '遺禮' },
  { source: 'zhenglun', target: '整論' },

  { source: 'xuyou', target: '許攸' },
  { source: 'chenglve', target: '成略' },
  { source: 'chenglve suits: {0}', target: '成略[{0}]' },
  { source: 'shicai', target: '恃才' },
  { source: 'cunmu', target: '寸目' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qizhi_description',
    target: '當你使用基本牌或錦囊牌指定第一個目標後，你可以棄置一名不為此牌目標的角色一張牌，然後其摸一張牌。',
  },
  {
    source: 'jinqu_description',
    target: '結束階段開始時，你可以摸兩張牌，然後將手牌保留至X張（X為你本回合發動過“奇制”的次數）。',
  },

  {
    source: 'huaiju_description',
    target:
      '<b>鎖定技，</b>遊戲開始時，你獲得3枚“橘”標記；有“橘”的角色於其摸牌階段多摸一張牌；當有“橘”的角色受到傷害時，防止此傷害。',
  },
  {
    source: 'weili_description',
    target: '出牌階段開始時，你可以選擇一名其他角色，並移去一枚“橘”或失去1點體力，令其獲得一枚“橘”。',
  },
  {
    source: 'zhenglun_description',
    target: '摸牌階段，你可以改為獲得一枚“橘”。',
  },

  {
    source: 'chenglve_description',
    target:
      '<b>轉換技，</b>出牌階段限一次，陽：你可以摸一張牌，然後棄置兩張手牌；陰：你可以摸兩張牌，然後棄置一張手牌。若如此做，你於此階段內使用與你以此法棄置牌花色相同的牌無距離和次數限制。',
  },
  {
    source: 'shicai_description',
    target: '當你於一回合首次使用一種類別的非延時類牌結算結束後，你可以將此牌置於牌堆頂，然後摸一張牌。',
  },
  {
    source: 'cunmu_description',
    target: '<b>鎖定技，</b>當你摸牌時，改為從牌堆底摸牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to drop 1 hand card of another player, and this player will draw a card?',
    target: '{0}：你可以棄置非目標角色的一張牌，然後其摸一張牌',
  },

  {
    source: '{0}: do you want to draw 2 cards, then keep {1} hand cards?',
    target: '{0}：你可以摸兩張牌，然後將手牌保留至 {1} 張',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：請棄置 {1} 張牌',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 orange?',
    target: '{0}：你可以選擇一名其他角色',
  },
  {
    source: 'weili:loseHp',
    target: '失去1點體力',
  },
  {
    source: 'weili:loseOrange',
    target: '移去一枚“橘”',
  },
  {
    source: '{0}: please choose weili options: {1}',
    target: '{0}：請選擇以下一項，令 {1} 獲得一枚“橘”',
  },

  {
    source: '{0}: do you want to skip draw card phase to gain 1 orange?',
    target: '{0}：你可以跳過摸牌階段來獲得一枚“橘”',
  },

  {
    source: '{0}: do you want to put {1} on the top of draw stack, then draw a card?',
    target: '{0}：你可以將 {1} 置於牌堆頂，然後摸一張牌',
  },
];
