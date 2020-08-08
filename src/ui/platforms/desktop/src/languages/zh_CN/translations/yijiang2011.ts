import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2011', target: '将1' },

  { source: 'caozhi', target: '曹植' },
  { source: 'luoying', target: '落英' },
  { source: 'jiushi', target: '酒诗' },
  
  { source: 'yujin', target: '于禁' },
  { source: 'jieyue', target: '节鉞' },

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

  { source: 'chengong', target: '陈宫' },
  { source: 'mingce', target: '明策' },
  { source: 'zhichi', target: '智迟' },

  { source: 'gaoshun', target: '高顺' },
  { source: 'xianzhen', target: '陷阵' },
  { source: 'jinjiu', target: '禁酒' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'luoying_description',
    target:
      '当其他角色的判定牌进入弃牌堆后，或其他角色的牌因弃置而进入弃牌堆后，你可以获得其中至少一张梅花牌。',
  },
  {
    source: 'jiushi_description',
    target:
      '当你需要使用【酒】时，若你的武将牌正面朝上，你可以翻面并视为使用之；当你受到伤害后，若你的武将牌背面朝上且你的武将牌于你受到此伤害时背面朝上，你可以翻面。',
  },

  {
    source: 'jieyue_description',
    target:
      '结束阶段开始时，你可以交给一名其他角色一张牌，然后其选择一项：1.保留一张手牌和一张装备区里的牌，弃置其余的牌；2.令你摸三张牌。',
  },

  {
    source: 'jueqing_description',
    target:
      '<b>锁定技</b>，你即将造成的伤害均视为体力流失。',
  },
  {
    source: 'shangshi_description',
    target:
      '当你的手牌数小于X时，你可以将手牌摸至X张（X为你已损失的体力值）。',
  },

  {
    source: 'sanyao_description',
    target:
      '出牌阶段限一次，你可以弃置至少一张牌，并选择等量名除你外体力最高的角色，你对这些角色各造成1点伤害。',
  },
  {
    source: 'zhiman_description',
    target:
      '你对其他角色造成伤害时，你可以防止此伤害，然后获得其区域内的一张牌。',
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
    target:
      '<b>锁定技</b>，当你使用锦囊牌造成伤害时，或你受到锦囊牌造成的伤害时，防止此伤害。',
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
      '若你于弃牌阶段内弃置过至少两张手牌，或当你失去装备区里的牌后，你可以选择一项：1.依次弃置其他角色的共计一至两张牌；2.将一名其他角色装备区里的牌置入另一名其他角色的装备区。',
  },

  {
    source: 'mingce_description',
    target:
      '出牌阶段限一次，你可以将一张【杀】或装备牌交给一名其他角色，然后其选择一项：1.视为对其攻击范围内由你指定的另一名角色使用一张【杀】；2.摸一张牌。',
  },
  {
    source: 'zhichi_description',
    target:
      '<b>锁定技</b>，当你于回合外受到伤害后，本回合内【杀】和普通锦囊牌对你无效。',
  },

  {
    source: 'xianzhen_description',
    target:
      '出牌阶段限一次，你可以与一名角色拼点，若你：赢，此阶段内你无视其防具，对其使用牌无距离和次数限制，且当你使用【杀】或普通锦囊牌仅指定唯一目标时，可令其成为目标；没赢，你本回合内不能使用【杀】且你的【杀】不计入手牌上限。',
  },
  {
    source: 'jinjiu_description',
    target:
      '<b>锁定技</b>，你的【杀】均视为【酒】。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to prevent the damage to {1} to pick one card in areas?',
    target:
      '{0}：你可以防止对 {1} 造成的伤害，然后获得其区域里的一张牌',
  },
];
