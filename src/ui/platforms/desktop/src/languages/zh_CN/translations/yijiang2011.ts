import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2011', target: '将1' },

  { source: 'caozhi', target: '曹植' },
  { source: 'luoying', target: '落英' },
  { source: 'jiushi', target: '酒诗' },
  { source: '#jiushi', target: '酒诗' },
  { source: 'chengzhang', target: '成章' },

  { source: 'yujin', target: '于禁' },
  { source: 'jieyue', target: '节钺' },

  { source: 'zhangchunhua', target: '张春华' },
  { source: 'jueqing', target: '绝情' },
  { source: 'shangshi', target: '伤逝' },

  { source: 'masu', target: '马谡' },
  { source: 'sanyao', target: '散谣' },
  { source: 'zhiman', target: '制蛮' },

  { source: 'fazheng', target: '法正' },
  { source: 'enyuan', target: '恩怨' },
  { source: 'xuanhuo', target: '眩惑' },

  { source: 'xushu', target: '徐庶' },
  { source: 'wuyan', target: '无言' },
  { source: 'jujian', target: '举荐' },

  { source: 'wuguotai', target: '吴国太' },
  { source: 'ganlu', target: '甘露' },
  { source: 'buyi', target: '补益' },

  { source: 'xusheng', target: '徐盛' },
  { source: 'pojun', target: '破军' },

  { source: 'lingtong', target: '凌统' },
  { source: 'xuanfeng', target: '旋风' },
  { source: 'yongjin', target: '勇进' },

  { source: 'chengong', target: '陈宫' },
  { source: 'mingce', target: '明策' },
  { source: 'zhichi', target: '智迟' },

  { source: 'gaoshun', target: '高顺' },
  { source: 'xianzhen', target: '陷阵' },
  { source: '#####xianzhen', target: '陷阵'},
  { source: 'jinjiu', target: '禁酒' },
  { source: 'xianzhen target: {0}', target: '陷阵:{0}' },
  { source: 'xianzhen_lose', target: '陷阵[没赢]' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'luoying_description',
    target: '当其他角色的判定牌进入弃牌堆后，或其他角色的牌因弃置而进入弃牌堆后，你可以获得其中至少一张梅花牌。',
  },
  {
    source: 'jiushi_description',
    target:
      '1级：当你需要使用[酒]时，若你的武将牌正面向上，你可以翻面，视为使用一张[酒]。当你受到伤害后，若你的武将牌背面向上，你可以翻面并获得牌堆中的一张随机锦囊。<br />2级：当你需要使用[酒]时，若你的武将牌正面向上，你可以翻面，视为使用一张[酒]。当你受到伤害后若你的武将牌背面向上，你可以翻面。当你翻面时，你获得牌堆中的一张随机锦囊。',
  },
  {
    source: 'chengzhang_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你造成伤害与受到伤害值之和累计7点或以上，则你回复1点体力并摸1张牌，然后升级“酒诗”。',
  },
  {
    source: 'jieyue_description',
    target:
      '结束阶段开始时，你可以交给一名其他角色一张牌，然后其选择一项：1.保留一张手牌和一张装备区里的牌，弃置其余的牌；2.令你摸三张牌。',
  },

  {
    source: 'jueqing_description',
    target: '<b>锁定技</b>，你即将造成的伤害均视为体力流失。',
  },
  {
    source: 'shangshi_description',
    target: '当你的手牌数小于X时，你可以将手牌摸至X张（X为你已损失的体力值）。',
  },

  {
    source: 'sanyao_description',
    target: '出牌阶段每项限一次，你可以弃置一张牌，并选择一项：1.指定体力值最高的一名角色；2.指定手牌数最多的一名角色。对你所选的角色造成1点伤害。',
  },
  {
    source: 'zhiman_description',
    target: '你对其他角色造成伤害时，你可以防止此伤害，然后获得其区域内的一张牌。',
  },

  {
    source: 'enyuan_description',
    target:
      '当你受到伤害后，你可以令伤害来源选择一项：1.交给你一张手牌；2.失去1点体力。当你获得其他角色的牌后，若不少于两张，你可以令其摸一张牌。',
  },
  {
    source: 'xuanhuo_description',
    target:
      '摸牌阶段，你可以放弃摸牌，令一名其他角色摸两张牌，然后其选择一项：1.对其攻击范围内由你指定的另一名角色使用一张【杀】；2.你获得其两张牌。',
  },

  {
    source: 'wuyan_description',
    target: '<b>锁定技</b>，当你使用锦囊牌造成伤害时，或你受到锦囊牌造成的伤害时，防止此伤害。',
  },
  {
    source: 'jujian_description',
    target:
      '结束阶段开始时，你可以弃置一张非基本牌并选择一名其他角色，其选择一项：1.回复1点体力；2.摸两张牌；3.复原武将牌。',
  },

  {
    source: 'pojun_description',
    target:
      '当你使用【杀】指定目标后，你可以将其一至X张牌扣置于其武将牌上，此回合结束时，其获得这些牌（X为其体力值）；当你使用【杀】对手牌区与装备区牌数均不大于你的角色造成伤害时，此伤害+1。',
  },

  {
    source: 'ganlu_description',
    target:
      '出牌阶段限一次，你可以选择一项：1.选择两名装备区内牌数相差不大于你已损失体力值的角色，令他们交换装备区里的牌；2.交换你与一名其他角色装备区里的牌。',
  },
  {
    source: 'buyi_description',
    target:
      '当一名角色进入濒死状态时，若其体力值不大于0，你可以展示其一张手牌，若此牌不为基本牌，则其弃置之且该角色回复1点体力。',
  },

  {
    source: 'xuanfeng_description',
    target:
      '若你于弃牌阶段内弃置过至少两张手牌，或当你失去装备区里的牌后，你可以依次弃置其他角色的共计一至两张牌，然后你可以对其中一名角色造成1点伤害。',
  },
  {
    source: 'yongjin_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以依次移动场上一至三张不同的装备牌。',
  },

  {
    source: 'mingce_description',
    target:
      '出牌阶段限一次，你可以将一张【杀】或装备牌交给一名其他角色，然后其选择一项：1.视为对其攻击范围内由你指定的另一名角色使用一张【杀】；2.摸一张牌。',
  },
  {
    source: 'zhichi_description',
    target: '<b>锁定技</b>，当你于回合外受到伤害后，本回合内【杀】和普通锦囊牌对你无效。',
  },

  {
    source: 'xianzhen_description',
    target:
      '出牌阶段限一次，你可以与一名角色拼点，若你：赢，此阶段内你无视其防具，对其使用牌无距离和次数限制，且当你使用【杀】或普通锦囊牌仅指定唯一目标时，可令其成为目标；没赢，你本回合内不能使用【杀】且你的【杀】不计入手牌上限。',
  },
  {
    source: 'jinjiu_description',
    target: '<b>锁定技</b>，你的【酒】均视为【杀】。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'xuanhuo: please choose a target who {0} can slash',
    target: '眩惑：请选择一名 {0} 攻击范围内的角色',
  },
  {
    source: 'xuanhuo: please use slash to {0}, else {1} obtain 2 cards from you',
    target: '眩惑：你可以对 {0} 使用【杀】，或者 {1} 将获得你的两张牌',
  },
  {
    source: '{0}: please choose {1} cards to obtain',
    target: '{0}：请选择获得其中的 {1} 张牌',
  },
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：你需交给 {1} 一张手牌',
  },

  {
    source: 'please choose sanyao options',
    target: '<b>散谣</b>：请选择消耗项',
  },
  { source: 'sanyao:hp', target: '体力值' },
  { source: 'sanyao:handNum', target: '手牌数' },

  {
    source: '{0}: do you want to prevent the damage to {1} to pick one card in areas?',
    target: '{0}：你可以防止对 {1} 造成的伤害，然后获得其区域里的一张牌',
  },

  {
    source: '{0} triggered skill {1}, prevent the damage of {2}',
    target: '{0} 触发了技能 {1} ，防止了 {2} 造成的伤害',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以弃置一张非基本牌并选择一名其他角色，其选择摸牌、回血或复原',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以弃置一张非基本牌并选择一名其他角色，其选择摸牌、回血或复原',
  },
  { source: 'jujian:draw', target: '摸两张牌' },
  { source: 'jujian:recover', target: '回复1点体力' },
  { source: 'jujian:restore', target: '复原武将牌' },

  {
    source: '{0}: please choose a target who {1} can use slash to',
    target: '{0}：请选择 {1} 攻击范围内的一名角色作为【杀】的目标',
  },

  {
    source: 'please choose mingce options:{0}',
    target: '明策：1.视为对 {0} 使用一张【杀】；2.摸一张牌',
  },
  { source: 'mingce:slash', target: '视为使用【杀】' },
  { source: 'mingce:draw', target: '摸一张牌' },

  {
    source: 'jieyue: please choose jieyue options',
    target: '{0}：1.选择一张手牌和装备牌，弃置其余的牌；2.令 {1} 摸3张牌',
  },
  
  {
    source: '{0}: do you want to reveal a hand card from {1} ?',
    target: '{0}：你可以展示 {1} 的一张手牌，若此牌不为基本牌，其弃置之并回复1点体力',
  },
  {
    source: 'xianzhen: do you want to add {0} as targets of {1}?',
    target: '陷阵：你可以令 {0} 也成为 {1} 的目标',
  },

  {
    source: '{0}: do you want to choose a target to drop a card?',
    target: '{0}：你可以弃置一名角色的一张牌',
  },
  {
    source: '{0}: do you want to choose a XuanFeng target to deal 1 damage?',
    target: '{0}：你可以选择其中一名角色，对其造成1点伤害',
  },

  {
    source: '{0}: please choose two target to move their equipment',
    target: '{0}：你可以依次选择两名角色，先选角色装备区里的牌将被移至后选角色',
  },

  {
    source: '{0}: do you want to draw {1} cards?',
    target: '{0}: 是否摸 {1} 张牌?',
  }
];
