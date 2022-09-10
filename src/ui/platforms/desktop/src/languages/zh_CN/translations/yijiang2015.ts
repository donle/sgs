import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2015', target: '将5' },

  { source: 'caorui', target: '曹叡' },
  { source: 'huituo', target: '恢拓' },
  { source: 'mingjian', target: '明鉴' },
  { source: 'jian', target: '鉴' },
  { source: 'xingshuai', target: '兴衰' },

  { source: 'caoxiu', target: '曹休' },
  { source: 'qianju', target: '千驹' },
  { source: 'qingxi', target: '倾袭' },

  { source: 'zhongyao', target: '钟繇' },
  { source: 'huomo', target: '活墨' },
  { source: 'zuoding', target: '佐定' },

  { source: 'liuchen', target: '刘谌' },
  { source: 'zhanjue', target: '战绝' },
  { source: 'qinwang', target: '勤王' },

  { source: 'xiahoushi', target: '夏侯氏' },
  { source: 'qiaoshi', target: '樵拾' },
  { source: 'yanyu', target: '燕语' },

  { source: 'zhangni', target: '张嶷' },
  { source: 'wurong', target: '怃戎' },
  { source: 'shizhi', target: '矢志' },

  { source: 'quancong', target: '全琮' },
  { source: 'yaoming', target: '邀名' },

  { source: 'sunxiu', target: '孙休' },
  { source: 'yanzhu', target: '宴诛' },
  { source: 'yanzhu points: {0}', target: '宴诛[{0}]' },
  { source: 'yanzhu_ex', target: '宴诛' },
  { source: '#s_yanzhu_debuff', target: '宴诛（额外受伤）' },
  { source: 'xingxue', target: '兴学' },
  { source: 'xingxue_ex', target: '兴学' },
  { source: 'zhaofu', target: '诏缚' },

  { source: 'zhuzhi', target: '朱治' },
  { source: 'anguo', target: '安国' },

  { source: 'guotupangji', target: '郭图逢纪' },
  { source: 'jigong', target: '急攻' },
  { source: 'jigong damage: {0}', target: '急攻[{0}]' },
  { source: '##jigong', target: '急攻（回复体力）' },
  { source: 'shifei', target: '饰非' },

  { source: 'gongsunyuan', target: '公孙渊' },
  { source: 'huaiyi', target: '怀异' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'huituo_description',
    target: '当你受到伤害后，你可以令一名角色判定，若结果为：红色，其回复1点体力；黑色，其摸X张牌（X为伤害值）。',
  },
  {
    source: 'mingjian_description',
    target:
      '出牌阶段限一次，你可以将所有手牌交给一名其他角色。若如此做，其于其下个回合内使用【杀】的次数上限和手牌上限+1。',
  },
  {
    source: 'xingshuai_description',
    target:
      '<b>主公技</b>，<b>限定技</b>，当你进入濒死状态时，若你的体力值不大于0，你可以令其他魏势力角色依次选择是否令你回复1点体力。此濒死结算结束后，所有以此法令你回复体力的角色各受到1点伤害。',
  },

  {
    source: 'qianju_description',
    target: '<b>锁定技</b>，你计算与其他角色的距离-X（X为你已损失的体力值）。',
  },
  {
    source: 'qingxi_description',
    target:
      '当你使用【杀】或【决斗】指定目标后，你可以令其选择一项：1.弃置X张手牌（X为你攻击范围内的角色数且至多为2，若你的装备区里有武器牌，则改为至多为4），然后弃置你装备区里的武器牌；2.令此牌对其伤害基数+1且你判定，若结果为红色，其不能响应此牌。',
  },

  {
    source: 'huomo_description',
    target:
      '当你需要使用基本牌时（你本回合使用过的基本牌除外），你可以将一张黑色非基本牌置于牌堆顶，视为使用此基本牌。',
  },
  {
    source: 'zuoding_description',
    target:
      '当其他角色于其出牌阶段内使用黑桃牌指定第一个目标后，若没有角色于此阶段内受到过伤害，你可以令一名目标角色摸一张牌。',
  },

  {
    source: 'zhanjue_description',
    target:
      '出牌阶段，你可以将所有手牌当【决斗】使用，然后你摸一张牌，且受到过此牌伤害的角色各摸一张牌。若你以此法于一阶段内获得过至少两张牌，本技能于此阶段内失效。',
  },
  {
    source: 'yanyu_description',
    target:
      '出牌阶段限一次，你可以重铸一张【杀】；出牌阶段结束时，若你于此阶段内重铸过至少两张【杀】，你可令一名男性角色摸两张牌。',
  },

  {
    source: 'qiaoshi_description',
    target:
      '其他角色的结束阶段开始时，若其手牌数与你相等，你可以与其各摸一张牌，然后若以此法摸的两张牌花色相同，你可重复此流程。',
  },
  {
    source: 'yanyu_description',
    target:
      '出牌阶段，你可以重铸一张【杀】；出牌阶段结束时，若X大于0，你可令一名男性角色摸X张牌（X为你于此阶段内重铸过【杀】的数量，且至多为3）。',
  },

  {
    source: 'wurong_description',
    target:
      '出牌阶段限一次，你可以令你与一名其他角色同时展示一张手牌，若你展示的：为【杀】且其展示的不为【闪】，你对其造成1点伤害；不为【杀】且其展示的为【闪】，你获得其一张牌。',
  },
  {
    source: 'shizhi_description',
    target:
      '<b>锁定技</b>，若你的体力值为1，你的【闪】均视为【杀】；当你使用以此法视为的【杀】造成伤害后，你回复1点体力。',
  },

  {
    source: 'yaoming_description',
    target:
      '每回合每项限一次，当你造成或受到伤害后，你可以选择一项：1.令手牌数小于你的一名角色摸一张牌；2.弃置手牌数大于你的一名角色的一张手牌；3.选择手牌数与你相等的一名角色，其可弃置一至两张牌，然后摸等量的牌。',
  },

  {
    source: 'yanzhu_description',
    target:
      '出牌阶段限一次，你可以令一名有牌的其他角色选择一项：1.弃置一张牌，且其于其下个回合开始前受到的下一次伤害+1；2.令你获得其装备区里的所有牌，然后修改你的本技能和“兴学”。',
  },
  {
    source: 'yanzhu_ex_description',
    target: '出牌阶段限一次，你可以令一名其他角色于其下个回合开始前受到的下一次伤害+1。',
  },
  {
    source: 'xingxue_description',
    target:
      '结束阶段开始时，你可以令一至X名角色各摸一张牌，然后其中手牌数大于体力值的角色分别将一张牌置于牌堆顶（X为你的体力值）。',
  },
  {
    source: 'xingxue_ex_description',
    target:
      '结束阶段开始时，你可以令一至X名角色各摸一张牌，然后其中手牌数大于体力值的角色分别将一张牌置于牌堆顶（X为你的体力上限）。',
  },
  {
    source: 'zhaofu_description',
    target: '<b>主公技</b>，<b>锁定技</b>，你距离为1的角色视为在其他吴势力角色的攻击范围内。',
  },

  {
    source: 'anguo_description',
    target:
      '出牌阶段限一次，你可以选择一名其他角色，若其为手牌数最少的角色，其摸一张牌。若其为体力值最少的角色，其回复1点体力。若其为装备区里牌数最少的角色，其从牌堆里随机使用一张装备牌。最后若其有未执行的效果且你满足条件，你依次执行对应效果。',
  },

  {
    source: 'huaiyi_description',
    target:
      '出牌阶段限一次，你可以展示所有手牌，若其中：所有牌颜色相同，你摸一张牌，且本技能于此阶段内改为“出牌阶段限两次”；有颜色不同的牌，你选择一种颜色，弃置你手牌中该颜色的所有牌，然后你获得一至多X名其他角色各一张牌，若你以此法获得的牌数不少于两张，你失去1点体力。',
  },

  {
    source: 'jigong_description',
    target:
      '出牌阶段开始时，你可以摸一至三张牌，令你本回合内手牌上限为X（X为你此阶段内造成过的伤害值）。若如此做，本回合你的下个弃牌阶段开始时，若X不小于你此次摸的牌数，你回复1点体力。',
  },
  {
    source: 'shifei_description',
    target:
      '当你需要使用或打出【闪】时，你可以令当前回合角色摸一张牌，然后若其不为手牌数唯一最多的角色，你可以弃置手牌数最多的一名角色的一张牌，视为使用或打出【闪】。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$huituo:1',
    target: '大展宏图，就在今日！',
  },
  {
    source: '$huituo:2',
    target: '富我大魏，扬我国威！',
  },
  {
    source: '$mingjian:1',
    target: '你我推心置腹，岂能相负！',
  },
  {
    source: '$mingjian:2',
    target: '孰忠孰奸，朕尚能明辨！',
  },
  {
    source: '$xingshuai:1',
    target: '百年兴衰，皆由人，不由天！',
  },
  {
    source: '$xingshuai:2',
    target: '聚群臣而加勋，隆天子之气运！',
  },

  {
    source: '$qingxi:1',
    target: '虎豹骑倾巢而动，安有不胜之理！',
  },
  {
    source: '$qingxi:2',
    target: '任尔等固若金汤，虎豹骑可破之！',
  },

  {
    source: '$huomo:1',
    target: '笔墨写春秋，挥毫退万敌！',
  },
  {
    source: '$huomo:2',
    target: '妙笔在手，研墨在心。',
  },
  {
    source: '$zuoding:1',
    target: '只有忠心，没有谋略，是不够的。',
  },
  {
    source: '$zuoding:2',
    target: '承君恩宠，报效国家！',
  },

  {
    source: '$zhanjue:1',
    target: '成败再此一举，杀！',
  },
  {
    source: '$zhanjue:2',
    target: '此刻唯有死战，安能言降！',
  },
  {
    source: '$qinwang:1',
    target: '大厦倾危，谁堪栋梁？',
  },
  {
    source: '$qinwang:2',
    target: '国有危难，哪位将军请战？',
  },

  {
    source: '$qiaoshi:1',
    target: '暖风细雨，心有灵犀。',
  },
  {
    source: '$qiaoshi:2',
    target: '樵采城郭外，忽见郎君来。',
  },
  {
    source: '$yanyu:1',
    target: '边功未成，还请郎君努力。',
  },
  {
    source: '$yanyu:2',
    target: '郎君有意倾心诉，妾身心中相思埋。',
  },

  {
    source: '$wurong:1',
    target: '策略以入算，果烈以立威！',
  },
  {
    source: '$wurong:2',
    target: '诈与和亲，不攻可得！',
  },

  {
    source: '$yaoming:1',
    target: '养威持重，不营小利。',
  },
  {
    source: '$yaoming:2',
    target: '则天而行，作功邀名。',
  },

  {
    source: '$yanzhu:1',
    target: '觥筹交错，杀人于无形！',
  },
  {
    source: '$yanzhu:2',
    target: '子烈设宴，意在汝项上人头！',
  },
  {
    source: '$xingxue:1',
    target: '案古置学官，以敦王化，以隆风俗。',
  },
  {
    source: '$xingxue:2',
    target: '志善好学，未来可期。',
  },

  {
    source: '$anguo:1',
    target: '安邦定国，臣子分内之事。',
  },
  {
    source: '$anguo:2',
    target: '止干戈，休战事。',
  },

  {
    source: '$huaiyi:1',
    target: '曹刘可王，孤亦可王！',
  },
  {
    source: '$huaiyi:2',
    target: '汉失其鹿，天下豪杰当共逐之！',
  },

  {
    source: '$jigong:1',
    target: '此时不战，更待何时？',
  },
  {
    source: '$jigong:2',
    target: '箭在弦上，不得不发！',
  },
  {
    source: '$shifei:1',
    target: '若依吾计而行，许昌旦夕可破。',
  },
  {
    source: '$shifei:2',
    target: '先锋怯战，非谋策之过。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source:
      '{0}: do you want to choose a target to judge? if the result is red, he recover, otherwise he draw {1} cards',
    target: '{0}：你可以令一名角色判定，若结果为：红色，其回复1点体力；黑色，其摸 {1} 张牌',
  },

  {
    source: '{0}: do you want to let other Wei generals to choose whether let you recover 1 hp?',
    target: '{0}：你可以令所有其他魏势力角色依次选择是否令你回复1点体力',
  },
  {
    source: '{0}: do you want to let {1} recover 1 hp, then you will take 1 damage?',
    target: '{0}：你是否令 {1} 回复1点体力，且会在其此次濒死状态结束后受到1点无来源伤害',
  },

  {
    source: '{0}: do you want to use this skill to {1} ?',
    target: '{0}：你可以对 {1} 发动本技能',
  },
  {
    source: '{0}: please drop {1} card(s), or {2} will deal 1 more damage to you',
    target: '{0}：请弃置 {1} 张手牌，否则 {2} 对你的伤害基数将会+1，且有一定概率不能响应',
  },

  {
    source: '{0}: do you want to draw a card with {1} ?',
    target: '{0}：你可以与 {1} 各摸一张牌',
  },

  {
    source: '{0}: do you want to choose a male character to draw card(s)?',
    target: '{0}：你可以令一名男性角色摸牌',
  },

  {
    source: '{0}: please choose jigong options',
    target: '{0}：你可以摸一至三张牌',
  },
  { source: 'jigong:draw1', target: '摸一张牌' },
  { source: 'jigong:draw2', target: '摸两张牌' },
  { source: 'jigong:draw3', target: '摸三张牌' },
  { source: '{0} placed card {1} on the top of draw stack', target: '{0} 将 {1} 置于了牌堆顶 ' },

  {
    source: 'zuoding: do you want to choose a target to draw a card?',
    target: '佐定：你可以令其中一名角色摸一张牌',
  },

  {
    source: '{0}: please choose a hand card to display',
    target: '{0}：请选择一张手牌展示',
  },

  {
    source: 'do you want choose a target to use YaoMing?',
    target: '你可以选择一名角色发动“邀名”',
  },
  {
    source: '{0}: you can discard at most 2 cards, and then draw the same amount of cards',
    target: '{0}：你可以弃置一至两张牌，然后摸等量的牌',
  },

  {
    source: '{0}: please choose a color and discard all hand cards with that color',
    target: '{0}：请选择一种颜色，并弃置手牌中所有此颜色的牌',
  },
  { source: 'huaiyi:black', target: '黑色' },
  { source: 'huaiyi:red', target: '红色' },
  {
    source: '{0}: do you want to choose {1} targets to prey a card from each of them?',
    target: '{0}：请选择至多 {1} 名其他角色，获得这些角色各一张牌',
  },

  {
    source: '{0}: do you want to let {1} draw a card?',
    target: '{0}：你可以令 {1} 摸一张牌',
  },
  {
    source: 'shifei: do you want to choose a target to drop 1 card by you? and you will use/response a virtual Jink',
    target: '饰非：你可以弃置其中一名角色一张牌，视为你使用或打出一张【闪】',
  },

  {
    source: '{0}: please discard a card, or you must give {1} all the cards in your eqiup area',
    target: '{0}；请弃置一张牌，否则你将装备区里的所有牌交给 {1}',
  },

  {
    source: '{0}: do you want to choose at most {1} target(s) to draw a card?',
    target: '{0}；你可以令至多 {1} 名角色各摸一张牌',
  },
  {
    source: '{0}: please put a card onto the top of draw stack',
    target: '{0}；请选择一张牌置于牌堆顶',
  },
];
