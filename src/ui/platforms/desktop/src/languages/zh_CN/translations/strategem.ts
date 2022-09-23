import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'strategem', target: '谋攻篇' },

  { source: 'mou_yujin', target: '谋于禁' },
  { source: 'xiayuan', target: '狭援' },
  { source: 'mou_jieyue', target: '节钺' },

  { source: 'mou_huangzhong', target: '谋黄忠' },
  { source: 'mou_liegong', target: '烈弓' },
  { source: '#mou_liegong', target: '烈弓（记录花色）' },

  { source: 'mou_sunquan', target: '谋孙权' },
  { source: 'mou_zhiheng', target: '制衡' },
  { source: 'tongye', target: '统业' },
  { source: 'tongye: {0} {1}', target: '统业[{0}({1})]' },
  { source: '#tongye', target: '统业（判定变化）' },
  { source: 'mou_jiuyuan', target: '救援' },

  { source: 'mou_lvmeng', target: '谋吕蒙' },
  { source: 'mou_keji', target: '克己' },
  { source: 'dujiang', target: '渡江' },
  { source: 'duojing', target: '夺荆' },

  { source: 'mou_huaxiong', target: '谋华雄' },
  { source: 'mou_yaowu', target: '耀武' },
  { source: 'yangwei', target: '扬威' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'xiayuan_description',
    target:
      '每轮限一次，当其他角色受到伤害后，若其因此伤害而扣减了所有护甲值，你可以弃置两张手牌，令其获得本次扣减的护甲。',
  },
  {
    source: 'mou_jieyue_description',
    target: '结束阶段开始时，你可以令一名其他角色获得1点护甲，然后其可交给你一张牌。',
  },

  {
    source: 'mou_liegong_description',
    target:
      '若你未装备武器，则你的不为普通【杀】的【杀】均视为普通【杀】；当你使用牌时，或当你成为其他角色使用牌的目标后，本技能记录此花色；当你使用【杀】指定目标后，你可以亮出牌堆顶X张牌（X为本技能记录的花色数-1），以此法亮出的牌中每有一张与本技能记录的花色相同的牌，此【杀】对其伤害基数便+1。若如此做，当此【杀】结算结束后，清空本技能记录的花色。',
  },

  {
    source: 'mou_zhiheng_description',
    target:
      '出牌阶段限一次，你可以弃置至少一张牌，然后摸等量的牌，若你以此法弃置了所有手牌，你额外摸X+1张牌（X为你的“业”标记数）。',
  },
  {
    source: 'tongye_description',
    target:
      '<b>锁定技</b>，结束阶段开始时，你选择一项，并于你的下个回合的首个准备阶段开始时进行判断：1.场上装备区里的牌数与此时有变；2.场上装备区里的牌数与此时不变。若结果：符合，且你的“业”标记数小于2，你获得1枚“业”标记；不符，移去你的1枚“业”标记。',
  },
  {
    source: 'mou_jiuyuan_description',
    target:
      '<b>主公技</b>，<b>锁定技</b>，当其他吴势力角色使用【桃】时，你摸一张牌；当你成为其他吴势力角色使用【桃】的目标后，此【桃】对你的回复值+1。',
  },

  {
    source: 'mou_keji_description',
    target:
      '出牌阶段每项各限一次（若你发动过“渡江”，则改为出牌阶段限一次），你可以：1.弃置一张手牌，获得1点护甲；2.失去1点体力，获得2点护甲。你的手牌上限+X（X为你的护甲值）；若你不处于濒死状态，则你不能使用【桃】。',
  },
  {
    source: 'dujiang_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你的护甲值不少于3点，你获得技能“夺荆”。',
  },
  {
    source: 'duojing_description',
    target:
      '当你使用【杀】指定目标后，你可以减1点护甲，令此【杀】无视防具，然后你获得其一张牌，且当此【杀】于此阶段内结算结束后，你使用【杀】的次数上限于此阶段内+1。',
  },

  {
    source: 'mou_yaowu_description',
    target:
      '<b>锁定技</b>，当你受【杀】造成的伤害时，若此【杀】：为红色，伤害来源回复1点体力或摸一张牌；不为红色，你摸一张牌。',
  },
  {
    source: 'yangwei_description',
    target:
      '出牌阶段，你可以摸两张牌，令你于此阶段内使用【杀】的次数上限+1、使用【杀】无距离限制且无视防具，然后本技能失效直到本回合后你的下个结束阶段开始时。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$mou_liegong:1',
    target: '勇贯坚石，劲贯三军！',
  },
  {
    source: '$mou_liegong:2',
    target: '吾虽年迈，箭矢犹锋！',
  },
];

export const promptDescriptions: Word[] = [
  { source: 'tongye:change', target: '有变' },
  { source: 'tongye:unchange', target: '不变' },

  {
    source: '{0}: do you want to discard 2 hand cards to let {1} gain {2} armor?',
    target: '{0}：你可以弃置两张手牌，令 {1} 获得 {2} 点护甲',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 armor?',
    target: '{0}：你可以令一名其他角色获得1点护甲',
  },
  {
    source: '{0}: do you want to give 1 card to {1}',
    target: '{0}: 将一张牌交给 {1}',
  },
  {
    source: '{0}: please choose mou_yaowu options',
    target: '{0}: 请选择',
  },
  {
    source: '{0}: please choose tongye options',
    target: '{0}: 请选择',
  },
];
