import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'god_guanyu', target: '神关羽' },
  { source: 'wushen', target: '武神' },
  { source: 'wuhun', target: '武魂' },
  { source: '#wuhun', target: '武魂' },

  { source: 'god_lvmeng', target: '神吕蒙' },
  { source: 'gongxin', target: '攻心' },
  { source: 'shelie', target: '涉猎' },

  { source: 'god_zhouyu', target: '神周瑜' },
  { source: 'qinyin', target: '琴音' },
  { source: 'yeyan', target: '业炎' },

  { source: 'god_zhugeliang', target: '神诸葛亮' },
  { source: 'qixing', target: '七星' },
  { source: '#qixing', target: '七星' },
  { source: 'kuangfeng', target: '狂风' },
  { source: 'dawu', target: '大雾' },

  { source: 'god_caocao', target: '神曹操' },
  { source: 'guixin', target: '归心' },
  { source: 'feiying', target: '飞影' },

  { source: 'god_lvbu', target: '神吕布' },
  { source: 'kuangbao', target: '狂暴' },
  { source: 'wumou', target: '无谋' },
  { source: 'wuqian', target: '无前' },
  { source: 'shenfen', target: '神愤' },

  { source: 'god_simayi', target: '神司马懿' },
  { source: 'renjie', target: '忍戒' },
  { source: 'baiyin', target: '拜印' },
  { source: 'jilve', target: '极略' },
  { source: '#jilve', target: '极略' },
  { source: '##jilve', target: '极略·鬼才' },
  { source: '###jilve', target: '极略·集智' },
  { source: '####jilve', target: '极略·放逐' },
  { source: 'jilve-zhiheng', target: '极略·制衡' },
  { source: 'lianpo', target: '连破' },

  { source: 'god_zhaoyun', target: '神赵云' },
  { source: 'juejing', target: '绝境' },
  { source: 'longhun', target: '龙魂' },
  { source: '#longhun', target: '龙魂' },
  { source: '##longhun', target: '龙魂' },

  { source: 'god_luxun', target: '神陆逊' },
  { source: 'junlve', target: '军略' },
  { source: 'cuike', target: '摧克' },
  { source: 'zhanhuo', target: '绽火' },

  { source: 'god_ganning', target: '神甘宁' },
  { source: 'poxi', target: '魄袭' },
  { source: 'jieying', target: '结营' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'wushen_description',
    target: '<b>锁定技</b>，你的红桃手牌均视为【杀】；你使用红桃【杀】无距离和次数限制，无法被响应。',
  },
  {
    source: 'wuhun_description',
    target:
      '<b>锁定技</b>，当你受到1点伤害后，伤害来源获得1枚“梦魇”标记；当你死亡时，你令“梦魇”标记数最多的一名其他角色判定，若不为【桃】或【桃园结义】，该角色死亡。',
  },
  {
    source: 'shelie_description',
    target: '摸牌阶段，你可以改为亮出牌堆顶五张牌，然后获得其中每种花色的牌各一张。',
  },
  {
    source: 'gongxin_description',
    target:
      '出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以展示其中一张红桃牌，选择一项：1.弃置此牌；2.将此牌置于牌堆顶。',
  },
  {
    source: 'qinyin_description',
    target:
      '<b>锁定技</b>，弃牌阶段结束时，若你于此阶段内弃置过不少于两张手牌，则你令所有角色失去1点体力或回复1点体力。',
  },
  {
    source: 'yeyan_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以选择一至三名角色，对这些角色造成共计至多3点火焰伤害（若你将对其中一名角色分配不少于2点火焰伤害，你须先弃置四张花色各不相同的手牌并失去3点体力）。',
  },
  {
    source: 'qixing_description',
    target:
      '游戏开始时，你将牌堆顶七张牌扣置于你的武将牌上，称为“星”；摸牌阶段结束时，你可以用至少一张手牌交换等量的“星”。',
  },
  {
    source: 'kuangfeng_description',
    target:
      '结束阶段开始时，你可以移去一张“星”并选择一名角色，然后直到你的下个回合开始前，当该角色受到火焰伤害时，此伤害+1。',
  },
  {
    source: 'dawu_description',
    target:
      '结束阶段开始时，你可以移去至少一张“星”并选择等量角色，然后直到你的下个回合开始前，当这些角色受到非雷电伤害时，防止此伤害。',
  },
  {
    source: 'guixin_description',
    target: '当你受到1点伤害后，你可以随机获得每名其他角色区域里的一张牌，然后你翻面。',
  },
  {
    source: 'feiying_description',
    target: '<b>锁定技</b>，其他角色计算与你的距离+1。',
  },
  {
    source: 'kuangbao_description',
    target: '<b>锁定技</b>，游戏开始时，你获得2枚“暴怒”标记；当你造成或受到1点伤害后，你获得1枚“暴怒”标记。',
  },
  {
    source: 'wumou_description',
    target: '<b>锁定技</b>，当你使用普通锦囊牌时，你失去1点体力或移去一枚“暴怒”标记。',
  },
  {
    source: 'wuqian_description',
    target:
      '出牌阶段，你可以移去2枚“暴怒”标记并选择本回合内你未以此法选择过的一名其他角色，然后直到回合结束，你拥有“无双”且该角色的防具失效。',
  },
  {
    source: 'shenfen_description',
    target:
      '出牌阶段限一次，你可以移去6枚“暴怒”标记并对所有其他角色造成1点伤害，然后这些角色弃置装备区里的所有牌，再弃置四张手牌，最后你翻面。',
  },
  {
    source: 'renjie_description',
    target: '<b>锁定技</b>，当你受到伤害后，或于弃牌阶段内弃置手牌后，你获得X枚“忍”标记（X为伤害值或弃置的手牌数）。',
  },
  {
    source: 'baiyin_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你拥有不少于4枚“忍”标记，你减1点体力上限并获得技能“极略”。',
  },
  {
    source: 'jilve_description',
    target: '你可以移去1枚“忍”标记，发动下列一项技能：“鬼才”、“放逐”、“集智”、“制衡”或“完杀”。',
  },
  {
    source: 'lianpo_description',
    target: '一名角色的回合结束时，若你于此回合内杀死过角色，你可以获得一个额外的回合。',
  },
  {
    source: 'juejing_description',
    target: '<b>锁定技</b>，当你进入或脱离濒死状态时，你摸一张牌；你的手牌上限+2。',
  },
  {
    source: 'longhun_description',
    target:
      '你可以将一至两张同花色的牌按如下规则使用或打出：红桃当【桃】；方块当火【杀】；梅花当【闪】；黑桃当【无懈可击】。若你以此法使用或打出的两张牌为：红色，此牌的伤害值或回复值+1；黑色，你弃置当前回合角色的一张牌。',
  },
  {
    source: 'junlve_description',
    target: '<b>锁定技</b>，当你受到或造成1点伤害后，你获得一个“军略”标记。',
  },
  {
    source: 'cuike_description',
    target:
      '出牌阶段开始时，若“军略”数量为奇数，你可以对一名角色造成1点伤害；若“军略”数量为偶数，你可以横置一名角色并弃置其区域里的一张牌。若“军略”数量超过7个，你可以移去全部“军略”标记并对所有其他角色造成1点伤害。',
  },
  {
    source: 'zhanhuo_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以移去全部“军略”标记，令至多等量的已横置角色弃置所有装备区里的牌，然后对其中一名角色造成1点火焰伤害。',
  },
  {
    source: 'poxi_description',
    target:
      '出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以弃置你与其共计四张花色各不相同的手牌。若你以此法弃置你的牌数为：0，你减1点体力上限；1，你结束此阶段且本回合手牌上限-1；3，你回复1点体力；4，你摸四张牌。',
  },
  {
    source: 'jieying_description',
    target:
      '回合开始时，若场上没有“营”，你获得一枚“营”标记；结束阶段开始时，你可以将“营”移至其他角色；你令有“营”的角色于其摸牌阶段多摸一张牌、使用【杀】的次数上限+1、手牌上限+1；有“营”的其他角色的结束阶段开始时，你移去其“营”，然后获得其所有手牌。',
  },
];

export const conversations: Word[] = [
  { source: 'qixing: please select cards to save', target: '七星：请选择需要保留为手牌的牌' },
];
