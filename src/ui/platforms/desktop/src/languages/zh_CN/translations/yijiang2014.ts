import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2014', target: '将4' },

  { source: 'caozhen', target: '曹真' },
  { source: 'hanhaoshihuan', target: '韩浩史涣' },

  { source: 'chenqun', target: '陈群' },
  { source: 'pindi', target: '品第' },
  { source: 'faen', target: '法恩' },

  { source: 'wuyu', target: '吴懿' },
  { source: 'benxi', target: '奔袭' },

  { source: 'zhouchang', target: '周仓' },
  { source: 'zhongyong', target: '忠勇' },

  { source: 'zhangshong', target: '张松' },
  { source: 'qiangzhi', target: '强识' },
  { source: 'xiantu', target: '献图' },

  { source: 'sunluban', target: '孙鲁班' },
  { source: 'zhenhui', target: '谮毁' },
  { source: 'jiaojin', target: '骄矜' },

  { source: 'zhuhuan', target: '朱桓' },
  { source: 'fenli', target: '奋励' },
  { source: 'pingkou', target: '平寇' },

  { source: 'guyong', target: '顾庸' },
  { source: 'shenxing', target: '慎行' },
  { source: 'binyi', target: '秉壹' },

  { source: 'jushou', target: '沮授' },
  { source: 'shibei', target: '矢北' },
  { source: 'jianying', target: '渐营' },

  { source: 'caifuren', target: '蔡夫人' },
  { source: 'qieting', target: '窃听' },
  { source: 'xianzhou', target: '献州' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sidi_desc',
    target:
      '其它角色出牌阶段开始时，你可以弃置一张非基本牌（须与你装备区里的牌颜色相同），然后该角色不能使用和打出与此牌颜色相同的牌。此阶段结束时，若其没有使用【杀】，视为你对其使用一张【杀】。',
  },

  { source: 'shenduan_desc', target: '当你的一张黑色基本牌弃置后，你可以将此牌当【兵粮寸断】使用。' },
  {
    source: 'yonglue_desc',
    target:
      '其它角色的判断阶段开始时，若其在你攻击范围内，你可以弃置其判定区里的一张牌，然后视为你对其使用一张【杀】，若此【杀】没有造成过伤害，则你摸一张牌。',
  },

  {
    source: 'pindi_desc',
    target:
      '出牌阶段，你可以弃置一张牌并选择一名其他角色（不能弃置相同类型牌且不能指定相同的角色），然后令其执行一项：摸X张牌；弃置X张牌(X为本回合此技能发动次数)。若其已受伤，你须横置自身。',
  },
  { source: 'faen_desc', target: '当一名角色翻至正面或横置后，你可以令其摸一张牌。' },

  {
    source: 'benxi_desc',
    target:
      '锁定技，当你于回合内使用牌时，本回合你计算与其他角色的距离-1；你的回合内，若你与所有其他角色的距离为1，则你使用仅指定一个目标的【杀】或普通锦囊牌时依次选择至多两项：1.此牌目标＋1；2.此牌无视防具；3.此牌不能被抵消；4.此牌造成伤害时，摸一张牌',
  },

  {
    source: 'zhongyong_desc',
    target:
      '当你使用【杀】后，你可以将此【杀】或目标角色使用的【闪】交给一名其它角色，若其获得的牌为红色，则其可以对你攻击范围内的角色使用一张【杀】。',
  },
  {
    source: 'qiangzhi_desc',
    target:
      '出牌阶段开始时，你可以展示一名其它角色的一张手牌，然后此阶段当你使用与展示的牌类别相同的牌时，你可以摸一张牌。',
  },
  {
    source: 'xiantu_desc',
    target:
      '其它角色的出牌阶段开始时，你可以摸两张牌，然后将两张牌交给该角色。此阶段结束时，若其没有杀死过角色，则你失去1点体力。',
  },

  {
    source: 'zhenhui_desc',
    target:
      '出牌阶段，当你使用【杀】或黑色普通锦囊牌指定唯一目标时，你可令一名角色选择一项：1.交给你一张牌，然后代替你成为此牌的使用者；2.也成为此牌的目标（然后此技能本回合失效）。',
  },
  {
    source: 'jiaojin_desc',
    target: '当你成为男性角色使用【杀】或普通锦囊的目标后，你可以弃置一张装备牌，然后此牌对你无效并获得此牌。',
  },
  {
    source: 'fenli_desc',
    target:
      '若你的手牌数为全场最多，你可以跳过摸牌阶段；若你的体力值为全场最多，你可以跳过出牌阶段；若你的装备区里有牌且数量为全场最多，你可以跳过弃牌阶段。',
  },
  { source: 'pingkou_desc', target: '回合结束时，你可以对至多X名其它角色各造成1点伤害（X为你本回合跳过的阶段数）。' },

  { source: 'shenxing_desc', target: '出牌阶段，你可以弃置两张牌，然后摸一张牌。' },
  {
    source: 'binyi_desc',
    target: '结束阶段，你可以展示所有手牌，若颜色均相同，你令至多X名角色（X为你的手牌数）各摸一张牌。',
  },
  {
    source: 'shibei_description',
    target: '锁定技，你每回合第一次受到伤害后，回复1点体力。然后你本回合每次受到伤害后均失去1点体力。',
  },
  {
    source: 'jianying_description',
    target: '当你于出牌阶段内使用牌时，若此牌与你使用的上一张牌点数或花色相同，则你可以摸一张牌。',
  },
  {
    source: 'qieting_desc',
    target:
      '其它角色的回合结束时，若其没有对其它角色使用过牌，则你可以选择一项：1.将其装备区里的一张牌置入你的装备区；2.摸一张牌',
  },
  {
    source: 'xianzhou_desc',
    target:
      '限定技，出牌阶段，你可以将装备区里的所有牌交给一名其它角色，然后该角色选择一项：1.令你回复X点体力；2.对其攻击范围内的至多X名角色各造成1点伤害（X为你交给该角色牌的数量）',
  },
];
