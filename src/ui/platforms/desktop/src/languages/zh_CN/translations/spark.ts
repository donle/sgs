import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'spark', target: '星火燎原' },

  { source: 'lvqian', target: '吕虔' },
  { source: 'weilu', target: '威虏' },
  { source: 'zengdao', target: '赠刀' },
  { source: 's_zengdao_buff', target: '赠刀（增加伤害）' },

  { source: 'spark_pangtong', target: '吴庞统' },
  { source: 'guolun', target: '过论' },
  { source: 'songsang', target: '送丧' },
  { source: 'zhanji', target: '展骥' },

  { source: 'panjun', target: '潘濬' },
  { source: 'guanwei', target: '观微' },
  { source: 'gongqing', target: '公清' },

  { source: 'yanjun', target: '严畯' },
  { source: 'guanchao', target: '观潮' },
  { source: '#guanchao', target: '观潮' },
  { source: 'guanchao increase', target: '观潮 增' },
  { source: 'guanchao decrease', target: '观潮 减' },
  { source: 'guanchao increase: {0}', target: '观潮 增[{0}]' },
  { source: 'guanchao decrease: {0}', target: '观潮 减[{0}]' },
  { source: 'xunxian', target: '逊贤' },

  { source: 'zhoufang', target: '周鲂' },
  { source: 'duanfa', target: '断发' },
  { source: 'youdi', target: '诱敌' },

  { source: 'lvdai', target: '吕岱' },
  { source: 'qinguo', target: '勤国' },

  { source: 'liuyan', target: '刘焉' },
  { source: 'tushe', target: '图射' },
  { source: 'limu', target: '立牧' },

  { source: 'liuyao', target: '刘繇' },
  { source: 'kannan', target: '戡难' },
  { source: 'kannan damage: {0}', target: '戡难[{0}]' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'weilu_description',
    target:
      '<b>锁定技</b>，当你受到其他角色造成的伤害后，其于你下回合的出牌阶段开始时失去体力至1点，且此阶段结束时回复以此法失去的体力。',
  },
  {
    source: 'zengdao_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以将至少一张装备区里的牌置于一名其他角色的武将牌旁，称为“刀”。若如此做，当其造成伤害时，其移去一张“刀”，令此伤害+1。',
  },

  {
    source: 'guolun_description',
    target:
      '出牌阶段限一次，你可以展示一名其他角色的一张手牌，然后你可展示一张牌并与其交换双方展示的牌，以此法交出点数较小的牌的角色摸一张牌。',
  },
  {
    source: 'songsang_description',
    target:
      '<b>限定技</b>，当其他角色死亡后，若你：已受伤，你可以回复1点体力；未受伤，你可以加1点体力。若如此做，你获得技能“展骥”。',
  },
  {
    source: 'zhanji_description',
    target: '<b>锁定技</b>，当你于出牌阶段不因此技能而摸牌后，你摸一张牌。',
  },

  {
    source: 'guanwei_description',
    target:
      '每回合限一次，一名角色的出牌阶段结束时，若其于本回合内使用过的牌数大于1且花色均相同，你可以弃置一张牌，令其摸两张牌，且其于此阶段结束后执行一个额外的出牌阶段。',
  },
  {
    source: 'gongqing_description',
    target:
      '<b>锁定技</b>，当你受到伤害时，若伤害来源的攻击范围：小于3且伤害值大于1，你将伤害改为1点；大于3，此伤害+1。',
  },

  {
    source: 'guanchao_description',
    target:
      '出牌阶段开始时，你可以选择一项效果持续到本阶段结束：1.当你使用牌时，若你此阶段内使用过的所有牌点数均严格递增，你摸一张牌；2.当你使用牌时，若你此阶段内使用过的所有牌点数均严格递减，你摸一张牌。',
  },
  {
    source: 'xunxian_description',
    target: '每回合限一次，当你于回合外使用或打出的牌进入弃牌堆后，你可以将这些牌交给手牌数大于你的一名角色。',
  },

  {
    source: 'duanfa_description',
    target:
      '出牌阶段，若X大于0，你可以弃置一至X张黑色牌，然后摸等量的牌（X为你的体力上限减去你此阶段内以此法弃置过的牌数之差）。',
  },
  {
    source: 'youdi_description',
    target:
      '结束阶段开始时，你可以令一名其他角色弃置你一张手牌，若以此法弃置的牌不为【杀】，你获得其一张牌。且若以此法弃置的牌不为黑色牌，你摸一张牌。',
  },

  {
    source: 'qinguo_description',
    target:
      '当你于回合内使用装备牌结算结束后，你可以视为使用一张【杀】；当你失去装备区里的牌后，或有牌进入你的装备区后，若你装备区里的牌数与你的体力值相等，且与此次移动前不相等，你回复1点体力。',
  },

  {
    source: 'tushe_description',
    target: '当你使用非装备牌指定第一个目标后，若你的手牌中没有基本牌，你可以摸X张牌（X为目标数）。',
  },
  {
    source: 'limu_description',
    target:
      '出牌阶段，你可以将一张方块牌当【乐不思蜀】对自己使用，然后回复1点体力；若你的判定区有牌，你对攻击范围内的角色使用牌无距离和次数限制。',
  },

  {
    source: 'kannan_description',
    target:
      '出牌阶段限X次，你可以与你于此阶段内未以此法拼点过的一名角色拼点，赢的角色使用的下一张【杀】伤害基数+1，若该角色为你，则你此阶段不能再发动此技能。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please remove a ‘Dao’',
    target: '{0}：请选择一张“刀”移去',
  },

  {
    source: '{0}: you can show a hand card and exchange this card for {1}',
    target: '{0}：你可以展示一张牌并交换 {1}',
  },

  {
    source: '{0}: do you want to drop a card to let {1} draw 2 cards and gain an extra play phase?',
    target: '{0}：你可以弃置一张牌，令 {1} 摸两张牌并执行一个额外的出牌阶段',
  },

  {
    source: 'guanchao: please choose one option',
    target: '观潮：请选择你此阶段内须满足的点数形式。',
  },
  { source: 'guanchao:increase', target: '递增' },
  { source: 'guanchao:decrease', target: '递减' },

  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以将 {1} 交给手牌数大于你的一名角色',
  },
  {
    source: '{0}: do you want to give {1} cards to another player?',
    target: '{0}：你可以将 {1} 等牌交给手牌数大于你的一名角色',
  },

  {
    source: '{0}: do you want to choose another player to let him drop a hand card from you?',
    target: '{0}：你可以令一名其他角色弃置你一张手牌',
  },
];
