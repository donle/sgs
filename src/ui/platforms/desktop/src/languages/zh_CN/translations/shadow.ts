import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'shadow', target: '阴' },

  { source: 'wangji', target: '王基' },
  { source: 'qizhi', target: '奇制' },
  { source: 'qizhi times: {0}', target: '奇制[{0}]' },
  { source: 'jinqu', target: '进趋' },

  { source: 'luji', target: '陆绩' },
  { source: 'huaiju', target: '怀橘' },
  { source: 'orange', target: '橘' },
  { source: 'weili', target: '遗礼' },
  { source: 'zhenglun', target: '整论' },

  { source: 'xuyou', target: '许攸' },
  { source: 'chenglve', target: '成略' },
  { source: 'chenglve suits: {0}', target: '成略[{0}]' },
  { source: 'shicai', target: '恃才' },
  { source: 'cunmu', target: '寸目' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qizhi_description',
    target: '当你使用基本牌或锦囊牌指定第一个目标后，你可以弃置一名不为此牌目标的角色一张牌，然后其摸一张牌。',
  },
  {
    source: 'jinqu_description',
    target: '结束阶段开始时，你可以摸两张牌，然后将手牌保留至X张（X为你本回合发动过“奇制”的次数）。',
  },

  {
    source: 'huaiju_description',
    target:
      '<b>锁定技，</b>游戏开始时，你获得3枚“橘”标记；有“橘”的角色于其摸牌阶段多摸一张牌；当有“橘”的角色受到伤害时，防止此伤害。',
  },
  {
    source: 'weili_description',
    target: '出牌阶段开始时，你可以选择一名其他角色，并移去一枚“橘”或失去1点体力，令其获得一枚“橘”。',
  },
  {
    source: 'zhenglun_description',
    target: '摸牌阶段，你可以改为获得一枚“橘”。',
  },

  {
    source: 'chenglve_description',
    target:
      '<b>转换技，</b>出牌阶段限一次，阳：你可以摸一张牌，然后弃置两张手牌；阴：你可以摸两张牌，然后弃置一张手牌。若如此做，你于本回合内使用与你以此法弃置牌花色相同的牌无距离和次数限制。',
  },
  {
    source: 'shicai_description',
    target: '当你于一回合首次使用一种类别的非延时类牌结算结束后，你可以将此牌置于牌堆顶，然后摸一张牌。',
  },
  {
    source: 'cunmu_description',
    target: '<b>锁定技，</b>当你摸牌时，改为从牌堆底摸牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to drop 1 hand card of another player, and this player will draw a card?',
    target: '{0}：你可以弃置非目标角色的一张牌，然后其摸一张牌',
  },

  {
    source: '{0}: do you want to draw 2 cards, then keep {1} hand cards?',
    target: '{0}：你可以摸两张牌，然后将手牌保留至 {1} 张',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：请弃置 {1} 张牌',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 orange?',
    target: '{0}：你可以选择一名其他角色',
  },
  {
    source: 'weili:loseHp',
    target: '失去1点体力',
  },
  {
    source: 'weili:loseOrange',
    target: '移去一枚“橘”',
  },
  {
    source: '{0}: please choose weili options: {1}',
    target: '{0}：请选择以下一项，令 {1} 获得一枚“橘”',
  },

  {
    source: '{0}: do you want to skip draw card phase to gain 1 orange?',
    target: '{0}：你可以跳过摸牌阶段来获得一枚“橘”',
  },

  {
    source: '{0}: do you want to put {1} on the top of draw stack, then draw a card?',
    target: '{0}：你可以将 {1} 置于牌堆顶，然后摸一张牌',
  },
];
