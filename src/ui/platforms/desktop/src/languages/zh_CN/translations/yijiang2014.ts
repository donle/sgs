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

  { source: 'wuyi', target: '吴懿' },
  { source: 'benxi', target: '奔袭' },

  { source: 'zhoucang', target: '周仓' },
  { source: 'zhongyong', target: '忠勇' },

  { source: 'zhangsong', target: '张松' },
  { source: 'qiangzhi', target: '强识' },
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

  { source: 'jushou', target: '沮授' },
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
      '其他角色的出牌阶段开始时，你可以弃置与你的装备区里的其中一张牌颜色相同的一张非基本牌，然后该角色于此回合内不能使用或打出与此牌颜色相同的牌。此阶段结束时，若其于此阶段内没有使用过【杀】，视为你对其使用一张【杀】。',
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
      '当你使用的【杀】结算结束后，你可以将此【杀】或此次结算中响应过此【杀】的【闪】交给除此【杀】目标外的一名其他角色，若其以此法获得了红色牌，其可对你攻击范围内的一名角色使用一张【杀】（无距离限制）。',
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
];
export const characterDictionary: Word[] = [{ source: 'yijiang2014', target: '将4' }];
