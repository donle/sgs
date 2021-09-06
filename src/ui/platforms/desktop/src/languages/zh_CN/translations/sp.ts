import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'yangxiu', target: '杨修' },
  { source: 'danlao', target: '啖酪' },
  { source: 'jilei', target: '鸡肋' },

  { source: 'sp_caiwenji', target: '魏蔡文姬' },
  { source: 'chenqing', target: '陈情' },
  { source: 'mozhi', target: '默识' },

  { source: 'sp_jiangwei', target: '魏姜维' },
  { source: 'kunfen', target: '困奋' },
  { source: 'kunfen_EX', target: '困奋' },
  { source: 'fengliang', target: '逢亮' },

  { source: 'sp_sunshangxiang', target: '蜀孙尚香' },
  { source: 'liangzhu', target: '良助' },
  { source: 'fanxiang', target: '返乡' },

  { source: 'mayunlu', target: '马云騄' },
  { source: 'fengpo', target: '凤魄' },

  { source: 'maliang', target: '马良' },
  { source: 'zishu', target: '自书' },
  { source: 'yingyuan', target: '应援' },

  { source: 'mazhong', target: '马忠' },
  { source: 'fuman', target: '抚蛮' },
  { source: '#fuman', target: '抚蛮（摸牌）' },

  { source: 'zhouqun', target: '周群' },
  { source: 'tiansuan', target: '天算' },
  { source: 'tiansuan:upup', target: '上上签' },
  { source: 'tiansuan:up', target: '上签' },
  { source: 'tiansuan:mid', target: '中签' },
  { source: 'tiansuan:down', target: '下签' },
  { source: 'tiansuan:downdown', target: '下下签' },

  { source: 'dongyun', target: '董允' },
  { source: 'bingzheng', target: '秉正' },
  { source: 'sheyan', target: '舍宴' },

  { source: 'shamoke', target: '沙摩柯' },
  { source: 'jili', target: '蒺藜' },

  { source: 'sunhao', target: '孙皓' },
  { source: 'canshi', target: '残蚀' },
  { source: '#canshi', target: '残蚀（弃牌）' },
  { source: 'chouhai', target: '仇海' },
  { source: 'guiming', target: '归命' },

  { source: 'sp_zhaoyun', target: '群赵云' },
  { source: 'std_longdan', target: '龙胆' },
  { source: 'chongzhen', target: '冲阵' },

  { source: 'fuwan', target: '伏完' },
  { source: 'moukui', target: '谋溃' },

  { source: 'shixie', target: '士燮' },
  { source: 'biluan', target: '避乱' },
  { source: 'distance buff: {0}', target: '距离+{0}' },
  { source: 'distance debuff: {0}', target: '距离{0}' },
  { source: 'lixia', target: '礼下' },

  { source: 'quyi', target: '麴义' },
  { source: 'fuji', target: '伏骑' },
  { source: 'jiaozi', target: '骄恣' },

  { source: 'liuqi', target: '刘琦' },
  { source: 'wenji', target: '问计' },
  { source: 'tunjiang', target: '屯江' },

  { source: 'zhangling', target: '张陵' },
  { source: 'huji', target: '虎骑' },
  { source: 'shoufu', target: '授符' },

  { source: 'wutugu', target: '兀突骨' },
  { source: 'ranshang', target: '燃殇' },
  { source: 'hanyong', target: '悍勇' },

  { source: 'sp_diaochan', target: 'SP貂蝉' },
  { source: 'lihun', target: '离魂' },

  { source: 'huangzu', target: '黄祖' },
  { source: 'wangong', target: '挽弓' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'danlao_description',
    target: '当你成为【杀】或锦囊牌的目标后，若目标数大于1，你可以摸一张牌并令此牌对你无效。',
  },
  {
    source: 'jilei_description',
    target:
      '当你受到伤害后，若有伤害来源，你可以声明一种牌的类别，令其不能使用、打出或弃置此类别的手牌直到其下个回合开始。',
  },

  {
    source: 'kunfen_description',
    target: '<b>锁定技</b>，结束阶段开始时，你失去1点体力，然后摸两张牌。',
  },
  {
    source: 'kunfen_EX_description',
    target: '结束阶段开始时，你可以失去1点体力，然后摸两张牌。',
  },
  {
    source: 'fengliang_description',
    target:
      '<b>觉醒技</b>，当你进入濒死状态时，若你的体力小于1，你减1点体力上限，回复体力至2点，然后获得技能“挑衅”，修改你的“困奋”为“结束阶段开始时，你可以失去1点体力，然后摸两张牌”。',
  },

  {
    source: 'chenqing_description',
    target:
      '每轮限一次，当一名角色进入濒死状态时，你可以令另一名其他角色摸四张牌，然后弃置四张牌，若其以此法弃置了四张牌且这些牌的花色各不相同，其视为对该濒死角色使用一张【桃】。',
  },
  {
    source: 'mozhi_description',
    target:
      '结束阶段开始时，你可以将一张手牌当你于本回合出牌阶段内使用过的第一张基本或普通锦囊牌使用，然后你可以将一张手牌当第二张基本或普通锦囊牌使用。',
  },

  {
    source: 'liangzhu_description',
    target: '当一名角色于其出牌阶段内回复体力后，你可以选择一项：1.你摸一张牌；2.令其摸两张牌。',
  },
  {
    source: 'fanxiang_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若场上有已受伤且你发动过良助选项2令其摸牌的角色，你增加1点体力上限并回复1点体力，失去技能“良助”，获得技能“枭姬”。',
  },

  {
    source: 'fengpo_description',
    target:
      '当你于出牌阶段首次使用【杀】或【决斗】指定唯一目标后，你可以选择一项：1.摸X张牌；2.令此牌伤害+X（X为其手牌中的方片牌数）。',
  },

  {
    source: 'zishu_description',
    target:
      '<b>锁定技</b>，当你获得牌后，若此时是你的：回合内且这些牌不因此技能而获得，你摸一张牌；回合外，本回合结束时，你将这些牌中仍在你手牌中的牌置入弃牌堆。',
  },
  {
    source: 'yingyuan_description',
    target: '当你于回合内使用基本牌或普通锦囊牌结算结束后，你可以将此牌交给一名其他角色（每种牌名每回合限一次）。',
  },

  {
    source: 'fuman_description',
    target:
      '出牌阶段，你可以将一张【杀】交给本回合内未成为过你发动此技能的目标的一名其他角色。当其于其下个回合结束前使用此牌时，你摸一张牌。',
  },

  {
    source: 'tiansuan_description',
    target:
      '每轮限一次，出牌阶段，你可以随机抽取一个“命运签”（抽签开始前，你可以多放入一根想要的“命运签”），然后选择一名角色获得此签对应的效果直到你的下个回合开始。若为：上上签，你观看其手牌并获得其区域内的一张牌；上签，你获得其区域内的一张牌。<br>上上签：当你受到伤害时，防止之。<br>上签：当你受到伤害时，伤害值减至1点；当你受到伤害后，你摸X张牌（X为伤害值）。<br>中签：当你受到伤害时，将此伤害改为火焰伤害，将伤害值减至1点。<br>下签：当你受到伤害时，此伤害+1。<br>下下签：当你受到伤害时，此伤害+1；你不能使用【桃】和【酒】。',
  },

  {
    source: 'bingzheng_description',
    target:
      '出牌阶段结束时，你可以令体力值与手牌数不相等的一名角色摸一张牌或弃置一张手牌，然后若其手牌数与体力值相等，你摸一张牌，且你可将一张牌交给该角色。',
  },
  {
    source: 'sheyan_description',
    target: '当你成为锦囊牌的目标时，你可以为此牌增加或减少一个目标（目标数至少为1）。',
  },

  {
    source: 'jili_description',
    target: '当你于一回合内使用或打出第X张牌时，你可以摸X张牌（X为你的攻击范围）。',
  },

  {
    source: 'canshi_description',
    target:
      '摸牌阶段，你可以多摸X张牌（X为已受伤的角色数）。若如此做，当你于本回合内使用【杀】或普通锦囊牌时，你弃置一张牌。',
  },
  {
    source: 'chouhai_description',
    target: '<b>锁定技</b>，当你受到【杀】造成的伤害时，若你没有手牌，此伤害+1。',
  },
  {
    source: 'guiming_description',
    target: '<b>主公技</b>，<b>锁定技</b>，你的“残蚀”中X的值增加未受伤的其他吴势力角色数。',
  },

  {
    source: 'std_longdan_description',
    target: '你可以将【杀】当【闪】，【闪】当【杀】使用或打出。',
  },
  {
    source: 'chongzhen_description',
    target: '当你发动“龙胆”后，你可以获得对方的一张手牌。',
  },

  {
    source: 'moukui_description',
    target: '当你使用【杀】指定目标后，你可以摸一张牌或弃置其一张牌。若如此做，当此【杀】被其抵消后，其弃置你一张牌。',
  },

  {
    source: 'biluan_description',
    target:
      '结束阶段开始时，若有至你距离为1的角色，你可以弃置一张牌，令其他角色计算与你的距离+X（X为存活角色数且至多为4）。',
  },
  {
    source: 'lixia_description',
    target:
      '<b>锁定技</b>，其他角色的结束阶段开始时，若你不在其攻击范围内，你选择一项：1.你摸一张牌；2.令其摸两张牌。选择完成后，其他角色计算与你的距离-1。',
  },

  {
    source: 'fuji_description',
    target: '<b>锁定技</b>，距离至你为1的角色不能响应你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '<b>锁定技</b>，当你造成或受到伤害时，若你的手牌数为全场唯一最多，此伤害+1。',
  },

  {
    source: 'wenji_description',
    target:
      '出牌阶段开始时，你可以令一名其他角色交给你一张牌。若如此做，你于本回合内使用与该牌同名的牌不能被其他角色响应。',
  },
  {
    source: 'tunjiang_description',
    target:
      '结束阶段开始时，若你于此回合内未使用牌指定过其他角色为目标，且未跳过本回合的出牌阶段，你可以摸X张牌（X为存活势力数）。',
  },

  {
    source: 'huji_description',
    target:
      '<b>锁定技</b>，你计算与其他角色的距离-1；当你于回合外受到伤害后，你判定，若为红色，则视为你对伤害来源使用一张无距离限制的【杀】。',
  },
  {
    source: 'shoufu_description',
    target:
      '出牌阶段限一次，你可以摸一张牌，然后将一张手牌置于一名没有“箓”的其他角色的武将牌旁：其不能使用或打出与其“箓”类别相同的牌；当其受到伤害后，或于弃牌阶段内弃置至少两张与其“箓”类别相同的牌后，移去其“箓”。',
  },

  {
    source: 'ranshang_description',
    target:
      '<b>锁定技</b>，当你受到火焰伤害后，你获得等同于伤害值数量的“燃”标记；结束阶段开始时，你失去X点体力（X为你的“燃”标记数），然后若你的“燃”标记数大于2，你减2点体力上限并摸两张牌。',
  },
  {
    source: 'hanyong_description',
    target:
      '当你使用黑桃普通【杀】、【南蛮入侵】或【万箭齐发】时，若你已受伤，你可令此牌的伤害基数+1，然后若你的体力值大于当前轮数，你获得1枚“燃”标记。',
  },

  {
    source: 'lihun_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌并选择一名男性角色，然后你翻面并获得其所有手牌。若如此做，此阶段结束时，你将X张牌交给该角色（X为其体力值）。',
  },

  {
    source: 'wangong_description',
    target:
      '<b>锁定技</b>，当你使用牌结算结束后，若此牌为：基本牌，你拥有“挽弓”状态；非基本牌，你失去“挽弓”状态。若你处于“挽弓”状态，你使用【杀】无距离和次数限制、不计入次数限制，且伤害基数+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw a card and let {1} nullify to you?',
    target: '{0}：你可以摸一张牌，然后令 {1} 对你无效',
  },

  {
    source: '{0}: do you want to make {1} jilei until the start of his next turn?',
    target: '{0}：你可以令 {1} 不能使用、打出或弃置你声明的一种类别的手牌，直到其下个回合开始',
  },
  {
    source: '{0}: please choose jilei options: {1}',
    target: '{0}：请选择以下一种类别，令 {1} 直到你的下个回合开始前不能使用、打出或弃置此类别的手牌',
  },

  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以将 {1} 交给一名其他角色',
  },

  {
    source: '{0}: do you want to prey {1} a hand card?',
    target: '{0}：你可以获得 {1} 的一张手牌',
  },

  {
    source: '{0}: do you want to drop a card to let others calculate the distance to you increase {1}',
    target: '{0}：你可以弃置一张牌，令其他角色计算与你的距离+{1}',
  },

  {
    source: '{0}: please choose lixia options: {1}',
    target: '{0}：请选择令你或 {1} 摸牌',
  },
  { source: 'lixia:you', target: '你摸一张牌' },
  { source: 'lixia:opponent', target: '其摸一张牌' },

  {
    source: '{0}: you can let anothor player give you a card',
    target: '{0}：你可以令一名有牌的其他角色交给你一张牌',
  },
  {
    source: '{0}: you need to give a card to {1}',
    target: '{0}：请选择一张牌交给 {1}',
  },

  {
    source: '{0}: do you want to add a stick?',
    target: '{0}：你可以额外加入以下一根“命运签”',
  },
  {
    source: '{0}: the result is {1}, please choose a target',
    target: '{0}：抽签结果是 {1}，请选择一名角色获得此签的效果',
  },

  {
    source: '{0}: do you want to choose a target to let him draw a card or drop a hand card?',
    target: '{0}：你可以选择手牌数不等于体力值的一名角色，令其摸一张牌或弃置一张牌',
  },
  {
    source: '{0}: please choose bingzheng options: {1}',
    target: '{0}：你可以令 {1} 摸一张牌或弃置一张手牌',
  },
  { source: 'bingzheng:draw', target: '令其摸牌' },
  { source: 'bingzheng:drop', target: '令其弃牌' },
  {
    source: '{0}: please drop a hand card',
    target: '{0}：请弃置一张手牌',
  },
  {
    source: '{0}: you can to give a card to {1}',
    target: '{0}：你可以交给 {1} 一张牌',
  },

  {
    source: '{0}: please choose sheyan options: {1}',
    target: '{0}：你可以为 {1} 增加或减少一个目标',
  },
  { source: 'sheyan:add', target: '增加目标' },
  { source: 'sheyan:reduce', target: '减少目标' },
  {
    source: 'sheyan: please select a player to append to card targets',
    target: '舍宴：请选择一名角色成为此牌的额外目标',
  },
  {
    source: 'sheyan: please select a target to remove',
    target: '舍宴：请选择一名目标角色，取消其目标',
  },

  {
    source: '{0}: please choose a hand card and choose a target who has no ‘Lu’?',
    target: '{0}：请选择一张手牌和一名没有“箓”的其他角色，将此牌置为其“箓”',
  },

  {
    source: 'lihun target: {0}',
    target: '离魂 {0}',
  },
  {
    source: 'lihun: please give the targets some cards',
    target: '离魂：请交给目标等同于其体力值张牌',
  },

  {
    source: '{0}: do you want to lose 1 hp to draw 2 cards?',
    target: '{0}：你可以失去1点体力，然后摸两张牌',
  },

  {
    source: 'do you want to choose a target to use chenqing?',
    target: '你可以选择其中一名角色发动“陈情”',
  },
  {
    source:
      '{0}: please discard 4 cards, if these cards have different suit between each other, you use a virtual peach to {1}?',
    target: '{0}：请弃置四张牌，若这些牌的花色均不同，你视为对 {1} 使用一张【桃】',
  },

  {
    source: '{0}: do you want to a hand card as {1} ?',
    target: '{0}：你可以将一张手牌视为 {1} 使用',
  },

  {
    source: '{0}: please choose liangzhu options: {1}',
    target: '{0}：你可以选择一项：1.你摸一张牌；2.令 {1} 摸两张牌',
  },
  { source: 'liangzhu:you', target: '你摸一张牌' },
  { source: 'liangzhu:opponent', target: '其摸两张牌' },

  {
    source: '{0}: please choose fengpo options: {1} {2}',
    target: '{0}：你可以选择一项：1.摸X张牌：2.令 {1} 对 {2} 造成的伤害+X（X为 {1} 手牌中的方片牌数）',
  },
  { source: 'fengpo:draw', target: '摸牌' },
  { source: 'fengpo:damage', target: '增加伤害' },

  {
    source: '{0}: please choose moukui options: {1}',
    target: '{0}：你可以选择一项：1.摸一张牌：2.弃置 {1} 一张牌',
  },
  { source: 'moukui:draw', target: '摸一张牌' },
  { source: 'moukui:discard', target: '弃置其一张牌' },

  {
    source: '{0}: do you want to use a virtual slash?',
    target: '{0}：你可以视为使用一张【杀】（不计入次数限制）',
  },
];
