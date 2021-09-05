import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2014', target: '将4' },

  { source: 'caozhen', target: '曹真' },
  { source: 'sidi', target: '司敌' },

  { source: 'hanhaoshihuan', target: '韩浩史涣' },
  { source: 'shenduan', target: '慎断' },
  { source: 'yonglve', target: '勇略' },

  { source: 'chenqun', target: '陈群' },
  { source: 'pindi', target: '品第' },
  { source: 'faen', target: '法恩' },

  { source: 'caoxiu', target: '曹休' },
  { source: 'qianju', target: '千驹' },
  { source: 'qingxi', target: '倾袭' },

  { source: 'wuyi', target: '吴懿' },
  { source: 'benxi', target: '奔袭' },
  { source: 'benxi times: {0}', target: '奔袭[{0}]' },

  { source: 'zhoucang', target: '周仓' },
  { source: 'zhongyong', target: '忠勇' },

  { source: 'zhangsong', target: '张松' },
  { source: 'qiangzhi', target: '强识' },
  { source: 'qiangzhi type: {0}', target: '强识[{0}]' },
  { source: 'xiantu', target: '献图' },

  { source: 'sunluban', target: '孙鲁班' },
  { source: 'zenhui', target: '谮毁' },
  { source: 'jiaojin', target: '骄矜' },

  { source: 'zhuhuan', target: '朱桓' },
  { source: 'fenli', target: '奋励' },
  { source: 'pingkou', target: '平寇' },

  { source: 'guyong', target: '顾庸' },
  { source: 'shenxing', target: '慎行' },
  { source: 'bingyi', target: '秉壹' },

  { source: 'yjcm_jushou', target: '沮授' },
  { source: 'jianying', target: '渐营' },
  { source: 'shibei', target: '矢北' },

  { source: 'caifuren', target: '蔡夫人' },
  { source: 'qieting', target: '窃听' },
  { source: 'xianzhou', target: '献州' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sidi_description',
    target:
      '结束阶段开始时，你可以将一张非基本牌置于你的武将牌上，称为“司”；其他角色的出牌阶段开始时，你可以移去一张“司”，令其此阶段内不能使用或打出与此“司”颜色相同的牌。若如此做，此阶段结束时，若其于此阶段内未使用过【杀】，你视为对其使用一张【杀】，且若其于此阶段内未使用过锦囊牌，你摸两张牌。',
  },

  {
    source: 'shenduan_description',
    target: '当你因弃置而失去一张黑色非锦囊牌后，你可以将此牌当【兵粮寸断】使用（无距离限制）。',
  },
  {
    source: 'yonglve_description',
    target:
      '其他角色的判定阶段开始时，你可以弃置其判定区里的一张牌，然后若该角色：在你的攻击范围内，你摸一张牌；不在你的攻击范围内，你视为对其使用一张【杀】。',
  },

  {
    source: 'pindi_description',
    target:
      '出牌阶段，你可以弃置一张本回合内你未以此法弃置过的类别的牌，并选择本回合内你未以此法选择过的一名其他角色，你选择一项：1.令其弃置X张牌；2.令其摸X张牌（X为你本回合发动过此技能的次数）。然后若其已受伤，你横置。',
  },
  { source: 'faen_description', target: '当一名角色的武将牌翻至正面或横置后，你可以令其摸一张牌。' },

  {
    source: 'benxi_description',
    target:
      '<b>锁定技</b>，当你于回合内使用牌时，本回合你计算与其他角色的距离-1；你的回合内，若你与所有其他角色的距离均为1，则当你使用【杀】或普通锦囊牌指定唯一目标时，选择一至两项：1.此牌目标+1；2.此牌无视防具；3.此牌不能被抵消；4.此牌造成伤害时，你摸一张牌。',
  },

  {
    source: 'zhongyong_description',
    target:
      '当你使用的【杀】结算结束后，你可以将此【杀】和此次结算中响应过此【杀】的【闪】交给除此【杀】目标外的一名其他角色，若其以此法获得了黑色牌，其摸一张牌，且若其以此法获得了红色牌，其可对你攻击范围内的一名角色使用一张【杀】（无距离限制）。',
  },
  {
    source: 'qiangzhi_description',
    target:
      '出牌阶段开始时，你可以展示一名其他角色的一张手牌，然后当你于此阶段使用一张与展示牌类别相同的牌时，你可以摸一张牌。',
  },
  {
    source: 'xiantu_description',
    target:
      '其他角色的出牌阶段开始时，你可以摸两张牌，然后交给其两张牌。若如此做，此阶段结束时，若其于此阶段内未杀死过角色，你失去1点体力。',
  },

  {
    source: 'zenhui_description',
    target:
      '当你于出牌阶段内使用【杀】或黑色普通锦囊牌指定唯一目标时，你可以令不为此牌目标且可成为此牌目标的一名其他角色选择一项：1.交给你一张牌，成为此牌的使用者；2.成为此牌的目标，此技能于本回合内失效。',
  },
  {
    source: 'jiaojin_description',
    target: '当你成为男性角色使用【杀】或普通锦囊牌的目标后，你可以弃置一张装备牌，然后该牌对你无效且你获得此牌。',
  },
  {
    source: 'fenli_description',
    target:
      '若你的手牌数为全场最多，你可以跳过摸牌阶段；若你的体力值为全场最多，你可以跳过出牌阶段；若你的装备区里有牌且牌数为全场最多，你可以跳过弃牌阶段。',
  },
  {
    source: 'pingkou_description',
    target: '回合结束时，你可以对一至X名其他角色各造成1点伤害（X为你本回合内跳过的阶段数）。',
  },

  { source: 'shenxing_description', target: '出牌阶段，你可以弃置两张牌，然后摸一张牌。' },
  {
    source: 'bingyi_description',
    target: '结束阶段开始时，你可以展示所有手牌，若颜色均相同，你令一至X名角色各摸一张牌（X为你的手牌数）。',
  },
  {
    source: 'jianying_description',
    target: '当你于出牌阶段内使用牌时，若此牌与你此阶段内使用过的上一张牌的花色或点数相同，你可以摸一张牌。',
  },
  {
    source: 'shibei_description',
    target: '<b>锁定技</b>，当你受到伤害后，若此伤害为你于此回合内第一次受到的伤害，你回复1点体力，否则你失去1点体力。',
  },

  {
    source: 'qieting_description',
    target:
      '其他角色的回合结束时，若其此回合内未使用牌指定过除其外的角色为目标，你可以选择一项：1.将其装备区里的一张牌置入你的装备区；2.摸一张牌。',
  },
  {
    source: 'xianzhou_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以将装备区里的所有牌交给一名其他角色，然后其选择一项：1.令你回复X点体力；2.选择其攻击范围内一至X名角色，其对这些角色各造成1点伤害（X为你以此法给出的牌数）。',
  },

  {
    source: 'zhi_shanxi_description',
    target:
      '出牌阶段开始时，你可以选择一名没有“檄”的其他角色，移去场上所有“檄”，然后该角色获得一枚“檄”标记；当有“檄”的角色回复体力后，若其未处于濒死状态，其选择一项：1.将两张牌交给你；2.失去1点体力。',
  },

  {
    source: 'fuji_description',
    target: '锁定技，距离至你为1的角色不能响应你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '锁定技，当你造成或受到伤害时，若你的手牌数为全场唯一最多，此伤害+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose pindi options: {1} {2}',
    target: '{0}：请选择令 {1} 摸 {2} 张牌或弃置 {2} 张牌',
  },
  { source: 'pindi:draw', target: '令其摸牌' },
  { source: 'pindi:discard', target: '令其弃牌' },

  {
    source: '{0}: do you want to let {1} draw 1 card?',
    target: '{0}：你可以令 {1} 摸一张牌',
  },

  {
    source: '{0}: please choose benxi options: {1}',
    target: '{0}：你可为 {1} 选择至多两项增益效果',
  },
  { source: 'benxi:addTarget', target: '增加一个目标' },
  { source: 'benxi:unoffsetable', target: '不可抵消' },
  { source: 'benxi:ignoreArmor', target: '无视防具' },
  { source: 'benxi:draw', target: '造成伤害时摸一张牌' },
  {
    source: 'benxi: please select a player to append to card targets',
    target: '奔袭：请为此牌选择一个额外的目标。',
  },

  {
    source: 'please choose less than {0} player to draw 1 crad.',
    target: '请选择至多{0}名角色各摸一张牌。',
  },

  {
    source: '{0}: do you want to skip {1} ?',
    target: '{0}；你可以跳过 {1}',
  },

  {
    source: '{0}: do you want to choose at least {1} target(s) to deal 1 damage each?',
    target: '{0}：你可以对至多 {1} 名其他角色各造成1点伤害',
  },
];
