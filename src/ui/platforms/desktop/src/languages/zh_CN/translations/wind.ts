import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'xiahouyuan', target: '夏侯渊' },
  { source: 'shensu', target: '神速' },
  { source: 'shebian', target: '设变' },

  { source: 'caoren', target: '曹仁' },
  { source: 'jushou', target: '据守' },
  { source: 'jiewei', target: '解围' },
  { source: '#jiewei', target: '解围' },

  { source: 'huangzhong', target: '黄忠' },
  { source: 'liegong', target: '烈弓' },
  { source: '#liegong', target: '烈弓' },

  { source: 'weiyan', target: '魏延' },
  { source: 'kuanggu', target: '狂骨' },
  { source: 'qimou', target: '奇谋' },

  { source: 'xiaoqiao', target: '小乔' },
  { source: 'tianxiang', target: '天香' },
  { source: 'hongyan', target: '红颜' },
  { source: '#hongyan', target: '红颜' },
  { source: 'piaoling', target: '飘零' },

  { source: 'zhoutai', target: '周泰' },
  { source: 'buqu', target: '不屈' },
  { source: 'fenji', target: '奋激' },

  { source: 'zhangjiao', target: '张角' },
  { source: 'leiji', target: '雷击' },
  { source: '#leiji', target: '雷击' },
  { source: 'guidao', target: '鬼道' },
  { source: 'huangtian', target: '黄天' },
  { source: '~huangtian', target: '黄天' },

  { source: 'yuji', target: '于吉' },
  { source: 'guhuo', target: '蛊惑' },
  { source: 'chanyuan', target: '缠怨' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shensu_description',
    target:
      '你可以做出如下选择：1.跳过判定阶段和摸牌阶段；2.跳过出牌阶段并弃置一张装备牌；3.跳过弃牌阶段并翻面。你每选择一项，便视为你使用一张无距离限制的【杀】。',
  },
  { source: 'shebian_description', target: '当你翻面后，你可以移动场上一张装备牌。' },
  {
    source: 'jushou_description',
    target: '结束阶段开始时，你可以翻面并摸四张牌，然后选择一项：1.弃置一张非装备牌；2.使用一张装备牌。',
  },
  {
    source: 'jiewei_description',
    target:
      '你可以将装备区里的牌当【无懈可击】使用；当你的武将牌从背面翻至正面时，你可以弃置一张牌，然后移动场上的一张牌。',
  },
  {
    source: 'liegong_description',
    target:
      '你使用【杀】可以选择距离不大于此【杀】点数的角色为目标；当你使用【杀】指定目标后，你可以根据下列条件执行相应的效果：1.其手牌数不大于你的手牌数，此【杀】不可被【闪】响应；2.其体力值不小于你的体力值，此【杀】伤害+1。',
  },
  {
    source: 'kuanggu_description',
    target:
      '当你对一名角色造成1点伤害后，若你与其的距离于其因受到此伤害而扣减体力前不大于1，你可以回复1点体力或摸一张牌。',
  },
  {
    source: 'qimou_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以失去至少1点体力并摸X张牌，然后直到回合结束，你计算与其他角色的距离-X，且你使用【杀】的次数上限+X（X为你以此法失去的体力值）。',
  },
  {
    source: 'tianxiang_description',
    target:
      '当你受到伤害时，你可以弃置一张红桃牌，防止此伤害并选择一名其他角色，然后你选择一项：1.令其受到1点伤害，然后摸X张牌（X为其已损失体力值且至多为5）；2.令其失去1点体力，然后其获得你弃置的牌。',
  },
  {
    source: 'hongyan_description',
    target:
      '<b>锁定技</b>，你的黑桃牌或你的黑桃判定牌的花色视为红桃；若你的装备区里有红桃牌，你的手牌上限等于X（X为你的体力上限）。',
  },
  {
    source: 'piaoling_description',
    target:
      '结束阶段开始时，你可以判定，若结果为红桃，你选择一项：1.将判定牌交给一名角色，若其为你，你弃置一张牌；2.将判定牌置于牌堆顶。',
  },
  {
    source: 'buqu_description',
    target:
      '<b>锁定技</b>，当你处于濒死状态时，你将牌堆顶一张牌置于你的武将牌上，称为"创"，若此牌的点数与你武将牌上已有的"创"点数均不同，则你将体力回复至1点。若出现相同点数则将此牌置入弃牌堆。若你的武将牌上有"创"，则你的手牌上限与"创"的数量相等。',
  },
  {
    source: 'fenji_description',
    target: '当一名角色因另一名角色的弃置或获得而失去手牌后，你可以失去1点体力。若如此做，失去手牌的角色摸两张牌。',
  },
  {
    source: 'leiji_description',
    target:
      '当你使用或打出【闪】或【闪电】时，你可以进行判定；当你的判定牌生效后，若判定结果为：黑桃，你可以选择一名其他角色，对其造成2点雷电伤害；梅花，你回复1点体力，然后你可以选择一名其他角色，对其造成1点雷电伤害。',
  },
  {
    source: 'guidao_description',
    target: '当一名角色的判定牌生效前，你可以打出一张黑色牌替换之。若你打出的牌为黑桃2-9，则你摸一张牌。',
  },
  {
    source: 'huangtian_description',
    target: '<b>主公技</b>，其他群势力角色的出牌阶段限一次，其可以将一张【闪】或【闪电】交给你。',
  },
  {
    source: 'guhuo_description',
    target:
      '每回合限一次，你可以扣置一张手牌当任意一张基本牌或普通锦囊牌使用或打出。其他角色可同时进行质疑并翻开此牌：若为假则此牌作废，且质疑者各摸一张牌；若为真，则质疑者依次弃置一张牌或失去1点体力，并获得"缠怨"。',
  },
  {
    source: 'chanyuan_description',
    target: '<b>锁定技</b>，你不能质疑“蛊惑”；若你的体力值小于等于1，则你的其他技能失效。',
  },
];
