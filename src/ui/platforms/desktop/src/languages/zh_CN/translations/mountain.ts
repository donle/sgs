import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'zhanghe', target: '张郃' },
  { source: 'qiaobian', target: '巧变' },

  { source: 'dengai', target: '邓艾' },
  { source: 'tuntian', target: '屯田' },
  { source: 'zaoxian', target: '凿险' },
  { source: 'jixi', target: '急袭' },

  { source: 'jiangwei', target: '姜维' },
  { source: 'tiaoxin', target: '挑衅' },
  { source: 'zhiji', target: '志继' },

  { source: 'liushan', target: '刘禅' },
  { source: 'xiangle', target: '享乐' },
  { source: 'fangquan', target: '放权' },
  { source: 'ruoyu', target: '若愚' },
  { source: 'sishu', target: '思蜀' },

  { source: 'sunce', target: '孙策' },
  { source: 'jiang', target: '激昂' },
  { source: 'hunzi', target: '魂姿' },
  { source: 'zhiba', target: '制霸' },
  { source: '~zhiba', target: '制霸' },

  { source: 'zhangzhaozhanghong', target: '张昭张纮' },
  { source: 'zhijian', target: '直谏' },
  { source: 'guzheng', target: '固政' },

  { source: 'zuoci', target: '左慈' },
  { source: 'huashen', target: '化身' },
  { source: 'xinsheng', target: '新生' },

  { source: 'caiwenji', target: '蔡文姬' },
  { source: 'beige', target: '悲歌' },
  { source: 'duanchang', target: '断肠' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'tuntian_description',
    target:
      '当你于回合外失去牌后，你可以进行判定，若结果为红桃，你获得此判定牌，否则你将此判定牌置于你的武将牌上，称为“田”；你与其他角色计算距离-X（X为“田”的数量）。',
  },
  {
    source: 'zaoxian_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你有不少于三张“田”，你减一点体力上限并获得“急袭”。',
  },
  { source: 'jixi_description', target: '你可以将一张“田”当【顺手牵羊】使用。' },
  {
    source: 'qiaobian_description',
    target:
      '你可以弃置一张手牌并跳过一个阶段（准备阶段和结束阶段除外），若你以此法跳过：摸牌阶段，你可以获得一至两名其他角色的各一张手牌；出牌阶段，你可以移动场上一张牌。',
  },
  {
    source: 'tiaoxin_description',
    target: '出牌阶段限一次，你可以令攻击范围内含有你的一名角色选择是否对你使用一张【杀】。若其未使用【杀】或其使用的此【杀】未对你造成伤害，你弃置其一张牌，然后本技能于此阶段内改为“出牌阶段限两次”。',
  },
  {
    source: 'zhiji_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你没有手牌，你选择一项：1.摸两张牌；2.回复1点体力，然后你减一点体力上限并获得“观星”。',
  },
  {
    source: 'xiangle_description',
    target: '<b>锁定技</b>，当你成为【杀】的目标后，你令使用者选择一项：1.弃置一张基本牌；2.此【杀】对你无效。',
  },
  {
    source: 'fangquan_description',
    target:
      '你可以跳过出牌阶段，然后于此回合的弃牌阶段开始时，弃置一张手牌并选择一名其他角色，令其于此回合结束时执行一个额外的回合。',
  },
  {
    source: 'ruoyu_description',
    target:
      '<b>主公技</b>，<b>觉醒技</b>，准备阶段开始时，若你为体力值最小的角色，你增加1点体力上限并回复1点体力，然后获得“激将”和“思蜀”。',
  },
  {
    source: 'sishu_description',
    target: '出牌阶段开始时，你可以令一名角色于本局游戏中的【乐不思蜀】判定效果反转。',
  },
  {
    source: 'jiang_description',
    target: '当你使用【决斗】或红色【杀】指定目标后，或成为【决斗】或红色【杀】的目标后，你可以摸一张牌。',
  },
  {
    source: 'hunzi_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你的体力值不大于2，你减1点体力上限并获得“英魂”和“英姿”。',
  },
  {
    source: 'zhiba_description',
    target:
      '<b>主公技</b>，其他吴势力角色的出牌阶段限一次，其可以与你拼点（若你已发动过“魂姿”，你可以拒绝此拼点），若其没赢，你可以获得双方的拼点牌。',
  },
  {
    source: 'zhijian_description',
    target:
      '出牌阶段，你可以将一张装备牌置入一名其他角色的装备区内，然后摸一张牌；当你于出牌阶段使用装备牌时，你可以摸一张牌。',
  },
  {
    source: 'guzheng_description',
    target:
      '其他角色的弃牌阶段结束时，你可以将此阶段中该角色因弃置而置入弃牌堆的一张手牌交给其，然后你可以获得其余于此阶段内因弃置而置入弃牌堆的牌。',
  },
  {
    source: 'beige_description',
    target:
      '当一名角色受到【杀】造成的伤害后，你可以弃置一张牌，然后令其判定，若结果为：红桃，其回复X点体力（X为伤害值）；方块，其摸三张牌；梅花，伤害来源弃置两张牌；黑桃，伤害来源翻面。',
  },
  { source: 'duanchang_description', target: '<b>锁定技</b>，当你死亡时，杀死你的角色失去所有技能。' },
  {
    source: 'huashen_description',
    target:
      '游戏开始时，你随机将武将牌堆里的三张牌扣置于你的武将牌上，称为“化身”，并亮出其中一张且拥有其上由你选择的一个技能（限定技、觉醒技和主公技除外），然后你的性别及势力视为与此“化身”相同；回合开始或回合结束时，你可以选择一项：1.变更亮出的“化身”；2.移去一至两张未亮出的“化身”并获得等量新“化身”。',
  },
  { source: 'xinsheng_description', target: '当你受到1点伤害后，你可以获得一张“化身”。' },
];

export const skillAudios: Word[] = [
  {
    source: '$qiaobian:1',
    target: '兵无常势，水无常形。',
  },
  {
    source: '$qiaobian:2',
    target: '用兵之道，变化万千。',
  },

  {
    source: '$tuntian:1',
    target: '休养生息，是为以备不虞！',
  },
  {
    source: '$tuntian:2',
    target: '战损难免，应以军务减之。',
  },
  {
    source: '$zaoxian:1',
    target: '用兵以险，则战之以胜！',
  },
  {
    source: '$zaoxian:2',
    target: '已至马阁山，宜速进军破蜀！',
  },
  {
    source: '$jixi:1',
    target: '攻敌之不备，斩将夺辎！',
  },
  {
    source: '$jixi:2',
    target: '奇兵正攻，敌何能为？',
  },

  {
    source: '$tiaoxin:1',
    target: '黄口竖子，何必上阵送命？',
  },
  {
    source: '$tiaoxin:2',
    target: '汝如欲大败而归，则可进军一战！',
  },
  {
    source: '$zhiji:1',
    target: '维定当奋身以复汉室！',
  },
  {
    source: '$zhiji:2',
    target: '丞相之志，维必竭力而为。',
  },

  {
    source: '$xiangle:1',
    target: '诶嘿嘿嘿，还是玩耍快乐~',
  },
  {
    source: '$xiangle:2',
    target: '美好的日子，应该好好享受。',
  },
  {
    source: '$fangquan:1',
    target: '蜀汉有相父在，我可安心。',
  },
  {
    source: '$fangquan:2',
    target: '这些事情，你们安排就好。',
  },
  {
    source: '$ruoyu:1',
    target: '若愚故泰，巧骗众人。',
  },
  {
    source: '$ruoyu:2',
    target: '愚昧者，非真傻也。',
  },
  {
    source: '$sishu:1',
    target: '蜀乐乡土，怎不思念？',
  },
  {
    source: '$sishu:2',
    target: '思乡心切，徘徊惶惶。',
  },

  {
    source: '$jiang:1',
    target: '我会把胜利，带回江东！',
  },
  {
    source: '$jiang:2',
    target: '天下英雄，谁能与我一战！',
  },
  {
    source: '$hunzi:1',
    target: '小霸王之名，响彻天下，何人不知！',
  },
  {
    source: '$hunzi:2',
    target: '江东已平，中原动荡，直取许昌！',
  },
  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },

  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },
  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },

  {
    source: '$zhijian:1',
    target: '为臣之道，在于直言不讳。',
  },
  {
    source: '$zhijian:2',
    target: '建言或逆耳，于国无一害。',
  },
  {
    source: '$guzheng:1',
    target: '为君者，不可私行土木，奢废物料。',
  },
  {
    source: '$guzheng:2',
    target: '安民固国，方可思栋。',
  },

  {
    source: '$huashen:1',
    target: '世间万物，贫道皆可化为其形。',
  },
  {
    source: '$huashen:2',
    target: '尘身土塑，唯魂魄难得。',
  },
  {
    source: '$xinsheng:1',
    target: '大成若缺，损亦无妨。',
  },
  {
    source: '$xinsheng:2',
    target: '大盈若冲，新神自现。',
  },

  {
    source: '$beige:1',
    target: '人多暴猛兮如虺蛇，控弦被甲兮为骄奢。',
  },
  {
    source: '$beige:2',
    target: '两拍张弦兮弦欲绝，志摧心折兮自悲嗟。',
  },
  {
    source: '$duanchang:1',
    target: '雁飞高兮邈难寻，空断肠兮思愔愔。',
  },
  {
    source: '$duanchang:2',
    target: '为天有眼兮，何不见我独漂流？',
  },
];

export const promptDictionary: Word[] = [
  {
    source: '{0}: do you want to drop a hand card to skip {1} ?',
    target: '{0}：你可以弃置一张手牌，跳过 {1}',
  },
  {
    source: '{0}: please choose one or two targets to obtain a hand card from each of them',
    target: '{0}：你可以选择一至两名其他角色，获得他们各一张手牌',
  },
  {
    source: '{0}: do you want to move a card in the battlefield?',
    target: '{0}：你可以移动场上一张牌',
  },
];
