import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'biographies', target: '武将列传' },

  { source: 'caosong', target: '曹嵩' },
  { source: 'lilu', target: '礼赂' },
  { source: 'lilu count: {0}', target: '礼赂[{0}]' },
  { source: 'yizheng', target: '翊正' },

  { source: 'caoanmin', target: '曹安民' },
  { source: 'xianwei', target: '险卫' },

  { source: 'yanrou', target: '阎柔' },
  { source: 'choutao', target: '仇讨' },
  { source: 'xiangshu', target: '襄戍' },

  { source: 'xushao', target: '许劭' },
  { source: 'pingjian', target: '评荐' },
  { source: '#pingjian', target: '评荐' },

  { source: 'wangrong', target: '王荣' },
  { source: 'minsi', target: '敏思' },
  { source: 'jijing', target: '吉境' },
  { source: 'zhuide', target: '追德' },

  { source: 'dingyuan', target: '丁原' },
  { source: 'cixiao', target: '慈孝' },
  { source: 'cixiao:yizi', target: '义子' },
  { source: 'xianshuai', target: '先率' },
  { source: 'panshi', target: '叛弑' },

  { source: 'dongcheng', target: '董承' },
  { source: 'xuezhao', target: '血诏' },

  { source: 'qiuliju', target: '丘力居' },
  { source: 'koulve', target: '寇略' },
  { source: 'suiren', target: '随认' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'lilu_description',
    target:
      '摸牌阶段，你可以改为将手牌摸至体力上限（最多摸至五张，且无法摸牌也可发动），然后你将至少一张手牌交给一名其他角色。若你此次交出的牌数大于你上次以此法交出的牌数，你加1点体力上限并回复1点体力。',
  },
  {
    source: 'yizheng_description',
    target:
      '结束阶段开始时，你可以选择一名其他角色。若如此做，直到你的下个回合开始，当其造成伤害或回复体力时，若其体力上限小于你，你减1点体力上限，令此伤害值或回复值+1。',
  },

  {
    source: 'xianwei_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，你废除一个装备栏并摸等同于你未废除的装备栏数的牌，然后你令一名其他角色使用牌堆里的第一张与你废除装备栏对应副类别相同的装备牌（若牌堆中没有则改为其摸一张牌）。然后若你的所有装备栏均已废除，你加2点体力上限，且于本局游戏剩余时间内，你视为处于所有其他角色的攻击范围内，所有其他角色均视为处于你的攻击范围内。',
  },

  {
    source: 'xianwei_description: {0}',
    target: '<b>锁定技</b>，你的当前体力值为：{0}。',
  },

  {
    source: 'choutao_description',
    target:
      '当你使用【杀】指定第一个目标后，或当你成为其他角色使用【杀】的目标后，你可以弃置使用者的一张牌，令此【杀】不可被抵消。然后若使用者为你，则此【杀】不计入次数。',
  },
  {
    source: 'xiangshu_description',
    target:
      '<b>限定技</b>，结束阶段开始时，若X大于0，你可以令一名已受伤的角色回复X点体力并摸X张牌（X为你于本回合内造成过的伤害值，且至多为5）。',
  },

  {
    source: 'pingjian_description',
    target:
      '出牌阶段限一次，结束阶段开始时或当你受到伤害后，你可以观看三个可于当前时机发动的技能，你选择其中一个技能并可发动该技能（每个技能限发动一次）。',
  },

  {
    source: 'minsi_description',
    target:
      '出牌阶段限一次，你可以弃置至少一张点数和为13的牌，然后摸两倍数量的牌。你以此法摸的：红色牌于本回合不计入手牌上限；黑色牌于本回合无距离限制。',
  },
  {
    source: 'jijing_description',
    target: '当你受到伤害后，你可以判定，然后若你弃置至少一张点数和为判定结果点数的牌，你回复1点体力。',
  },
  {
    source: 'zhuide_description',
    target: '当你死亡时，你可以令一名其他角色获得牌堆里牌名各不相同的四张基本牌。',
  },

  {
    source: 'cixiao_description',
    target:
      '准备阶段开始时，你可以选择一名没有“义子”的其他角色（若场上有“义子”标记，你须先弃置一张牌），移去场上所有的“义子”标记，其获得1枚“义子”标记。有“义子”标记的角色视为拥有“叛弑”。',
  },
  {
    source: 'xianshuai_description',
    target:
      '<b>锁定技，</b>当一名角色造成伤害后，若此伤害时本轮内造成过的第一次伤害，你摸一张牌，然后若伤害来源为你，你对受伤角色造成1点伤害。',
  },
  {
    source: 'panshi_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，你将一张手牌交给一名拥有技能“慈孝”的其他角色；当你于出牌阶段内使用【杀】对拥有技能“慈孝”的角色造成伤害时，此伤害+1且你结束此阶段。',
  },

  {
    source: 'xuezhao_description',
    target:
      '出牌阶段限一次，你可以弃置一张手牌，并令一至X名其他角色（X为你的体力上限）依次选择是否交给你一张牌，若其：交给你牌，其摸一张牌且你本回合使用【杀】的次数上限+1；未交给你牌，其本回合不能响应你使用的牌。',
  },

  {
    source: 'koulve_description',
    target:
      '当你于出牌阶段内对其他角色造成伤害后，你可以展示其X张手牌（X为其已损失的体力值）。若其中有【杀】或伤害类锦囊牌，你获得这些牌。若其中有红色牌，你减1点体力上限（若你未受伤则改为失去1点体力），然后摸两张牌。',
  },
  {
    source: 'suiren_description',
    target: '当你死亡时，你可以将你手牌中所有的【杀】和伤害类锦囊牌交给一名其他角色。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$lilu:1',
    target: '微薄之礼，聊表敬意。',
  },
  {
    source: '$lilu:2',
    target: '乱狱滋丰，以礼赂之。',
  },
  {
    source: '$yizheng:1',
    target: '玉树盈阶，望子成龙。',
  },
  {
    source: '$yizheng:2',
    target: '择善者，翊赞季兴。',
  },

  {
    source: '$pingjian:1',
    target: '识人读心，评鉴推达。',
  },
  {
    source: '$pingjian:2',
    target: '月旦雅评，试论天下。',
  },

  {
    source: '$minsi:1',
    target: '能书会计，心思灵巧。',
  },
  {
    source: '$minsi:2',
    target: '才情兼备，选入掖庭。',
  },
  {
    source: '$jijing:1',
    target: '吉梦赐福，顺应天命。',
  },
  {
    source: '$jijing:2',
    target: '梦之指引，必为吉运。',
  },
  {
    source: '$zhuide:1',
    target: '思美人，两情悦。',
  },
  {
    source: '$zhuide:2',
    target: '花香蝶恋，君德妾慕。',
  },

  {
    source: '$cixiao:1',
    target: '吾儿奉先，天下无敌！',
  },
  {
    source: '$cixiao:2',
    target: '父慈子孝，义理为先！',
  },
  {
    source: '$xianshuai:1',
    target: '九州齐喑，首义嘱吾！',
  },
  {
    source: '$xianshuai:2',
    target: '雄兵一击，则天下大白！',
  },

  {
    source: '$xuezhao:1',
    target: '奉旨行事，莫敢不从！',
  },
  {
    source: '$xuezhao:2',
    target: '衣带密诏，当诛曹公！',
  },

  {
    source: '$daoji:1',
    target: '典韦勇猛，盗戟可除。',
  },
  {
    source: '$daoji:2',
    target: '你的就是我的。',
  },
  {
    source: '$fuzhong:1',
    target: '身负重任，绝无懈怠！',
  },
  {
    source: '$fuzhong:2',
    target: '勇冠其军，负重前行！',
  },

  {
    source: '$koulve:1',
    target: '兵强马壮，时出寇略！',
  },
  {
    source: '$koulve:2',
    target: '饥则寇略，饱则弃馀。',
  },
  {
    source: '$suiren:1',
    target: '就交给你了。',
  },
  {
    source: '$suiren:2',
    target: '我的财富，收好。',
  },

  {
    source: '$xianwei:1',
    target: '曹家儿郎，何惧一死！',
  },
  {
    source: '$xianwei:2',
    target: '此役当战，有死无生！',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw {1} card(s) instead of drawing cards by rule?',
    target: '{0}：你可以放弃摸牌，改为摸 {1} 张牌',
  },
  {
    source: '{0}: do you want to give up to draw cards by rule?',
    target: '{0}：你可以放弃摸牌',
  },
  {
    source: 'lilu: please give a handcard to another player',
    target: '礼赂：请将至少一张手牌交给一名其他角色',
  },

  {
    source: '{0}: do you want to choose a target?',
    target: '{0}：你可以选择一名其他角色',
  },

  {
    source: '{0}: please choose pingjian options',
    target: '{0}：请选择一项技能，然后你可发动所选技能',
  },

  {
    source: '{0}: do you want to drop cards with sum of {1} Card Number to recover 1 hp?',
    target: '{0}：你可以弃置至少一张点数和为 {1} 的牌来回复1点体力',
  },

  {
    source: '{0}: do you want to let another player draw 4 defferent basic cards?',
    target: '{0}：你可以令一名其他角色获得牌堆里四张牌名各不相同的基本牌',
  },

  {
    source: '{0}: do you want to discard a card and choose another player to be your new son?',
    target: '{0}：你可以弃一张牌，将“义子”标记转移给另一名其他角色',
  },
  {
    source: '{0}: do you want to choose another player to be your son?',
    target: '{0}：你可以令一名其他角色获得“义子”标记',
  },

  {
    source: 'panshi: please choose one hand card and one target',
    target: '叛弑：请选择一张手牌，交给其中一名角色',
  },
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：请将一张手牌交给 {1}',
  },

  {
    source: '{0}: do you want to display {1} card from {2}’s hand?',
    target: '{0}：你可以展示 {2} 的 {1} 张手牌',
  },

  {
    source: '{0}: do you want to choose a another player to give him all the damage cards in your hand?',
    target: '{0}：你可以将手牌中所有的【杀】和伤害类锦囊牌交给一名其他角色',
  },

  {
    source: 'xianwei: please choose a target to use equip from draw pile',
    target: '险卫：请选择一名其他角色随机使用牌堆中一张与你废除装备栏对应的装备牌',
  },

  {
    source: '{0}: do you want to discard a card from {1} to set {2} Unoffsetable?',
    target: '{0}：你可以弃置 {1} 的一张牌，令 {2} 不可被抵消',
  },
  {
    source:
      '{0}: do you want to discard a card from {1} to set {2} Unoffsetable and restore your limit of using slash?',
    target: '{0}：你可以弃置 {1} 的一张牌，令 {2} 不可被抵消，且不计入次数',
  },

  {
    source: '{0}: do you want to choose a wounded target to recover {1} hp and draw {1} cards?',
    target: '{0}：你可以令一名已受伤的角色回复 {1} 点体力并摸 {1} 张牌',
  },
];
