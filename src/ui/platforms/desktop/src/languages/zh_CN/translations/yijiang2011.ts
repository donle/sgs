import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2011', target: '将1' },

  { source: 'caozhi', target: '曹植' },
  { source: 'luoying', target: '落英' },
  { source: 'jiushi', target: '酒诗' },
  { source: '#jiushi', target: '酒诗' },
  { source: 'chengzhang', target: '成章' },

  { source: 'yujin', target: '于禁' },
  { source: 'jieyue', target: '节钺' },

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
  { source: 'yongjin', target: '勇进' },

  { source: 'chengong', target: '陈宫' },
  { source: 'mingce', target: '明策' },
  { source: 'zhichi', target: '智迟' },

  { source: 'gaoshun', target: '高顺' },
  { source: 'xianzhen', target: '陷阵' },
  { source: '#####xianzhen', target: '陷阵' },
  { source: 'jinjiu', target: '禁酒' },
  { source: 'xianzhen target: {0}', target: '陷阵:{0}' },
  { source: 'xianzhen_lose', target: '陷阵[没赢]' },

  { source: 'std_xuanfeng', target: '旋风' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'luoying_description',
    target: '当其他角色的判定牌进入弃牌堆后，或其他角色的牌因弃置而进入弃牌堆后，你可以获得其中至少一张梅花牌。',
  },
  {
    source: 'jiushi_description',
    target:
      '1级：当你需要使用[酒]时，若你的武将牌正面向上，你可以翻面，视为使用一张[酒]。当你受到伤害后，若你的武将牌背面向上，你可以翻面并获得牌堆中的一张随机锦囊。<br />2级：当你需要使用[酒]时，若你的武将牌正面向上，你可以翻面，视为使用一张[酒]。当你受到伤害后若你的武将牌背面向上，你可以翻面。当你翻面时，你获得牌堆中的一张随机锦囊。',
  },
  {
    source: 'chengzhang_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你造成伤害与受到伤害值之和累计7点或以上，则你回复1点体力并摸1张牌，然后升级“酒诗”。',
  },
  {
    source: 'jieyue_description',
    target:
      '结束阶段开始时，你可以交给一名其他角色一张牌，然后其选择一项：1.保留一张手牌和一张装备区里的牌，弃置其余的牌；2.令你摸三张牌。',
  },

  {
    source: 'jueqing_description',
    target: '<b>锁定技</b>，你即将造成的伤害均视为体力流失。',
  },
  {
    source: 'shangshi_description',
    target: '当你的手牌数小于X时，你可以将手牌摸至X张（X为你已损失的体力值）。',
  },

  {
    source: 'sanyao_description',
    target:
      '出牌阶段每项限一次，你可以弃置一张牌，并选择一项：1.指定体力值最高的一名角色；2.指定手牌数最多的一名角色。对你所选的角色造成1点伤害。',
  },
  {
    source: 'zhiman_description',
    target: '你对其他角色造成伤害时，你可以防止此伤害，然后获得其区域内的一张牌。',
  },

  {
    source: 'enyuan_description',
    target:
      '当你受到1点伤害后，你可以令伤害来源选择一项：1.交给你一张手牌，若此牌不为红桃，你摸一张牌；2.失去1点体力。当你获得其他角色的牌后，若不少于两张，你可以令其摸一张牌。',
  },
  {
    source: 'xuanhuo_description',
    target:
      '摸牌阶段结束时，你可以交给一名其他角色两张手牌，并选择另一名其他角色，前者选择一项：1.视为对后者使用一张任意【杀】或【决斗】；2.交给你所有手牌。',
  },

  {
    source: 'wuyan_description',
    target: '<b>锁定技</b>，当你使用锦囊牌造成伤害时，或你受到锦囊牌造成的伤害时，防止此伤害。',
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
      '若你于弃牌阶段内弃置过至少两张手牌，或当你失去装备区里的牌后，你可以依次弃置其他角色的共计一至两张牌，然后若此时是你的回合内，你可以对其中一名角色造成1点伤害。',
  },
  {
    source: 'yongjin_description',
    target: '<b>限定技</b>，出牌阶段，你可以依次移动场上一至三张不同的装备牌。',
  },

  {
    source: 'mingce_description',
    target:
      '出牌阶段限一次，你可以将一张【杀】或装备牌交给一名其他角色，然后其选择一项：1.视为对其攻击范围内由你指定的另一名角色使用一张【杀】；2.摸一张牌。',
  },
  {
    source: 'zhichi_description',
    target: '<b>锁定技</b>，当你于回合外受到伤害后，本回合内【杀】和普通锦囊牌对你无效。',
  },

  {
    source: 'xianzhen_description',
    target:
      '出牌阶段限一次，你可以与一名角色拼点，若你：赢，此阶段内你无视其防具，对其使用牌无距离和次数限制，且当你使用【杀】或普通锦囊牌仅指定唯一目标时，可令其成为目标；没赢，你本回合内不能使用【杀】且你的【杀】不计入手牌上限。',
  },
  {
    source: 'jinjiu_description',
    target: '<b>锁定技</b>，你的【酒】均视为【杀】。',
  },

  {
    source: 'std_xuanfeng_description',
    target:
      '若你于弃牌阶段内弃置过至少两张手牌，或当你失去装备区里的牌后，你可以依次弃置其他角色的共计一至两张牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：你需交给 {1} 一张手牌（若不为红桃则 {1} 摸一张牌），否则失去1点体力',
  },

  { source: 'xuanhuo:attack', target: '选项一' },
  { source: 'xuanhuo:give', target: '选项二' },
  {
    source: '{0}: please choose xuanhuo options: {1} {2}',
    target: '{0}：选项一：视为对 {1} 使用一张任意【杀】或【决斗】；选项二：交给 {2} 所有手牌',
  },
  {
    source: '{0}: please choose xuanhuo attack options: {1}',
    target: '{0}：请选择视为对 {1} 使用的牌',
  },

  {
    source: 'please choose sanyao options',
    target: '散谣：请选择消耗项',
  },
  { source: 'sanyao:hp', target: '体力值' },
  { source: 'sanyao:handNum', target: '手牌数' },

  {
    source: '{0}: do you want to prevent the damage to {1} to pick one card in areas?',
    target: '{0}：你可以防止对 {1} 造成的伤害，然后获得其区域里的一张牌',
  },

  {
    source: '{0} triggered skill {1}, prevent the damage of {2}',
    target: '{0} 触发了技能 {1} ，防止了 {2} 造成的伤害',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以弃置一张非基本牌并选择一名其他角色，其选择摸牌、回血或复原',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以弃置一张非基本牌并选择一名其他角色，其选择摸牌、回血或复原',
  },
  { source: 'jujian:draw', target: '摸两张牌' },
  { source: 'jujian:recover', target: '回复1点体力' },
  { source: 'jujian:restore', target: '复原武将牌' },

  {
    source: '{0}: please choose a target who {1} can use slash to',
    target: '{0}：请选择 {1} 攻击范围内的一名角色作为【杀】的目标',
  },

  {
    source: 'please choose mingce options:{0}',
    target: '明策：1.视为对 {0} 使用一张【杀】；2.摸一张牌',
  },
  { source: 'mingce:slash', target: '视为使用【杀】' },
  { source: 'mingce:draw', target: '摸一张牌' },

  {
    source: 'jieyue: please choose jieyue options',
    target: '{0}：1.选择一张手牌和装备牌，弃置其余的牌；2.令 {1} 摸3张牌',
  },

  {
    source: '{0}: do you want to reveal a hand card from {1} ?',
    target: '{0}：你可以展示 {1} 的一张手牌，若此牌不为基本牌，其弃置之并回复1点体力',
  },
  {
    source: 'xianzhen: do you want to add {0} as targets of {1}?',
    target: '陷阵：你可以令 {0} 也成为 {1} 的目标',
  },

  {
    source: '{0}: do you want to choose a target to drop a card?',
    target: '{0}：你可以弃置一名角色的一张牌',
  },
  {
    source: '{0}: do you want to choose a XuanFeng target to deal 1 damage?',
    target: '{0}：你可以选择其中一名角色，对其造成1点伤害',
  },

  {
    source: '{0}: please choose two target to move their equipment',
    target: '{0}：你可以依次选择两名角色，先选角色装备区里的牌将被移至后选角色',
  },

  {
    source: '{0}: do you want to draw {1} cards?',
    target: '{0}: 是否摸 {1} 张牌?',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$luoying:1',
    target: '五月繁花落，怀愁不同秋。',
  },
  {
    source: '$luoying:2',
    target: '惊风飘白日，光景驰西流。',
  },

  {
    source: '$jiushi:1',
    target: '德祖箪杯酒，吾亦醉抚琴。',
  },
  {
    source: '$jiushi:2',
    target: '利剑不在掌，结友何须多。',
  },

  {
    source: '$chengzhang:1',
    target: '妙笔趁酒兴，文章尽自成。',
  },

  {
    source: '$jieyue:1',
    target: '敌人虚张声势，我且将计就计！',
  },
  {
    source: '$jieyue:2',
    target: '舍，然后才有得。',
  },

  {
    source: '$jueqing:1',
    target: '博弈此生，终至无情。',
  },
  {
    source: '$jueqing:2',
    target: '此情已逝，故来决绝！',
  },
  {
    source: '$shangshi:1',
    target: '情随伤而逝，恨随痛而至！',
  },
  {
    source: '$shangshi:2',
    target: '春华已老红颜去，此恨绵绵无绝期。',
  },

  {
    source: '$sanyao:1',
    target: '可曾听说，人言可畏？',
  },
  {
    source: '$sanyao:2',
    target: '丞相谋略，吾已习得八九。',
  },
  {
    source: '$zhiman:1',
    target: '巧力胜于蛮力。',
  },
  {
    source: '$zhiman:2',
    target: '取你一件东西使使。',
  },

  {
    source: '$enyuan:1',
    target: '善因得善果，恶因得恶报。',
  },
  {
    source: '$enyuan:2',
    target: '私我者赠之琼瑶，厌我者报之斧钺。',
  },
  {
    source: '$xuanhuo:1',
    target: '光以眩目，言以惑人。',
  },
  {
    source: '$xuanhuo:2',
    target: '我法孝直如何会害你？',
  },

  {
    source: '$wuyan:1',
    target: '不忠不孝之人，不敢开口。',
  },
  {
    source: '$wuyan:2',
    target: '别跟我说话！我想静静。',
  },
  {
    source: '$jujian:1',
    target: '大贤不可屈就，将军须当亲往。',
  },
  {
    source: '$jujian:2',
    target: '大汉中兴，皆系此人！',
  },

  {
    source: '$ganlu:1',
    target: '玄德实乃佳婿啊。',
  },
  {
    source: '$ganlu:2',
    target: '好一个郎才女貌，真是天作之合啊。',
  },
  {
    source: '$buyi:1',
    target: '有我在，定保贤婿无虞！',
  },
  {
    source: '$buyi:2',
    target: '东吴，岂容汝等儿戏！',
  },

  {
    source: '$pojun:1',
    target: '犯大吴疆土者，盛必击而破之！',
  },
  {
    source: '$pojun:2',
    target: '若敢来犯，必叫你大败而归！',
  },

  {
    source: '$xuanfeng:1',
    target: '风袭千里，片甲不留！',
  },
  {
    source: '$xuanfeng:2',
    target: '凌风逐敌，横扫千军！',
  },
  {
    source: '$yongjin:1',
    target: '勇力载舟，长浪奋进！',
  },
  {
    source: '$yongjin:2',
    target: '以勇拒曹刘，气吞万里如虎！',
  },

  {
    source: '$mingce:1',
    target: '如此，霸业可图也。',
  },
  {
    source: '$mingce:2',
    target: '如此，一击可擒也。',
  },
  {
    source: '$zhichi:1',
    target: '若吾早知如此。',
  },
  {
    source: '$zhichi:2',
    target: '如今之计，唯有退守，再做决断。',
  },

  {
    source: '$xianzhen:1',
    target: '攻无不克，战无不胜！',
  },
  {
    source: '$xianzhen:2',
    target: '破阵斩将，易如反掌！',
  },
  {
    source: '$jinjiu:1',
    target: '避嫌远疑，所以无误。',
  },
  {
    source: '$jinjiu:2',
    target: '贬酒阙色，所以无污。',
  },
];
