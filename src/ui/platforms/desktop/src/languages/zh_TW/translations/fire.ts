import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'dianwei', target: '典韋' },
  { source: 'qiangxi', target: '強襲' },

  { source: 'xunyu', target: '荀彧' },
  { source: 'quhu', target: '驅虎' },
  { source: 'jieming', target: '節命' },

  { source: 'pangtong', target: '龐統' },
  { source: 'lianhuan', target: '連環' },
  { source: 'niepan', target: '涅槃' },

  { source: 'wolong', target: '臥龍諸葛亮' },
  { source: 'bazhen', target: '八陣' },
  { source: 'huoji', target: '火計' },
  { source: 'kanpo', target: '看破' },
  { source: 'cangzhuo', target: '藏拙' },

  { source: 'taishici', target: '太史慈' },
  { source: 'tianyi', target: '天義' },
  { source: 'tianyi_win', target: '天義[贏]' },
  { source: 'tianyi_lose', target: '天義[冇贏]' },
  { source: 'hanzhan', target: '酣戰' },

  { source: 'pangde', target: '龐德' },
  { source: 'jianchu', target: '鞬出' },

  { source: 'yanliangwenchou', target: '顔良文醜' },
  { source: 'shuangxiong', target: '雙雄' },
  { source: '#shuangxiong', target: '雙雄' },
  { source: 'shuangxiong_red', target: '雙雄[非紅]' },
  { source: 'shuangxiong_black', target: '雙雄[非黑]' },

  { source: 'yuanshao', target: '袁紹' },
  { source: 'luanji', target: '亂擊' },
  { source: '#luanji', target: '亂擊' },
  { source: 'xueyi', target: '血裔' },
  { source: '#xueyi', target: '血裔' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qiangxi_description',
    target:
      '出牌階段限兩次，你可以失去1點體力或棄置一張武器牌，並對本回合內你未以此法指定過的一名其他角色造成1點傷害。',
  },
  {
    source: 'quhu_description',
    target:
      '出牌階段限一次，你可以與體力值大於你的一名角色拚點，若你：贏，你令該角色對其攻擊範圍內由你選擇的一名角色造成1點傷害；冇贏，其對你造成1點傷害。',
  },
  {
    source: 'jieming_description',
    target: '當你受到1點傷害後，你可以令一名角色摸兩張牌，然後若其手牌數不大於其體力上限，你摸一張牌。',
  },
  {
    source: 'lianhuan_description',
    target: '你可以將一張梅花手牌當【鐵索連環】使用或重鑄；你使用【鐵索連環】的目標上限+1。',
  },
  {
    source: 'niepan_description',
    target:
      '<b>限定技</b>，當你處於瀕死狀態時，你可以棄置你區域裏的所有牌，然後複原你的武將牌，摸三張牌並將體力回複至3點。然後你從“八陣”、“火計”、“看破”中選擇一個獲得。',
  },
  { source: 'bazhen_description', target: '<b>鎖定技</b>，若你的裝備區裏冇有防具牌，則視為你裝備【八卦陣】。' },
  { source: 'huoji_description', target: '你可以將一張紅色牌當【火攻】使用。' },
  { source: 'kanpo_description', target: '你可以將一張黑色牌當【無懈可擊】使用。' },
  {
    source: 'cangzhuo_description',
    target: '<b>鎖定技</b>，棄牌階段開始時，若你本回合未使用過錦囊牌，則你的錦囊牌於本回合內不計入手牌上限。',
  },
  {
    source: 'tianyi_description',
    target:
      '出牌階段限一次，你可以與一名角色拚點，若你：贏，直到回合結束，你使用【殺】無距離限製且次數上限和目標上限+1；冇贏，本回合你不能使用【殺】。',
  },
  {
    source: 'hanzhan_description',
    target:
      '你與角色拚點，或其他角色對你發起拚點時，你可令其使用隨機手牌拚點。當你拚點後，你可獲得拚點牌中點數最大的【殺】。',
  },
  {
    source: 'jianchu_description',
    target:
      '當你使用【殺】指定一名角色為目標後，你可以棄置其一張牌，若你以此法棄置的牌：不為基本牌，此【殺】不可被【閃】響應，且你本回合內使用【殺】的次數上限+1；為基本牌，該角色獲得此【殺】。',
  },
  {
    source: 'shuangxiong_description',
    target:
      '摸牌階段，你可以改為亮出牌堆頂兩張牌，並獲得其中一張牌，然後本回合內你可以將與此牌顔色不同的一張手牌當【決鬥】使用；當你因“雙雄”而受到傷害後，你可以獲得本次【決鬥】中其他角色打出的【殺】。',
  },
  {
    source: 'luanji_description',
    target: '你可以將兩張花色相同的手牌當【萬箭齊發】使用；你使用【萬箭齊發】可以少選一個目標。',
  },
  {
    source: 'xueyi_description',
    target:
      '<b>主公技</b>，遊戲開始時，你獲得X枚“裔”標記（X為群勢力角色數）；回合開始時，你可以移除一枚"裔"並摸一張牌；你每有一枚"裔"，手牌上限便+2。',
  },
];

export const conversations: Word[] = [
  {
    source: 'shuangxiong: do you wanna to obtain slashes from "shuangxiong" ?',
    target: '雙雄：是否獲得本次【決鬥】中其他角色打出的【殺】？',
  },
];
