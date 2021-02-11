import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2013', target: '将3' },

  { source: 'caochong', target: '曹冲' },
  { source: 'fuhuanghou', target: '伏皇后' },
  { source: 'guanping', target: '关平' },
  { source: 'guohuai', target: '郭淮' },
  { source: 'jianyong', target: '简雍' },
  { source: 'liru', target: '李儒' },
  { source: 'liufeng', target: '刘封' },
  { source: 'manchong', target: '满宠' },
  { source: 'panzhangmazhong', target: '潘璋马忠' },
  { source: 'yufan', target: '虞翻' },
  { source: 'zhuran', target: '朱然' },

  { source: 'chengxiang', target: '称象' },
  { source: 'renxin', target: '仁心' },
  { source: 'zhuikong', target: '惴恐' },
  { source: 'qiuyuan', target: '求援' },
  { source: 'longyin', target: '龙吟' },
  { source: 'jingce', target: '精策' },
  { source: 'qiaoshuo', target: '巧说' },
  { source: 'j3_zongshi', target: '纵适' },
  { source: 'juece', target: '绝策' },
  { source: 'mieji', target: '灭计' },
  { source: 'fencheng', target: '焚城' },
  { source: 'xiansi', target: '陷嗣' },
  { source: '~xiansi', target: '陷嗣' },
  { source: 'junxing', target: '峻刑' },
  { source: 'yuce', target: '御策' },
  { source: 'duodao', target: '夺刀' },
  { source: 'anjian', target: '暗箭' },
  { source: 'zongxuan', target: '纵玄' },
  { source: '#zongxuan', target: '纵玄' },
  { source: 'zhiyan', target: '直言' },
  { source: 'danshou', target: '胆守' },
  { source: '#danshou', target: '胆守' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'chengxiang_description',
    target: '当你受到伤害后，你可以亮出牌堆顶四张牌，然后你获得其中至少一张点数和不大于13的牌。',
  },
  {
    source: 'renxin_description',
    target: '当一名其他角色受到伤害时，若其体力值为1，你可以弃置一张装备牌并翻面，然后防止此伤害。',
  },
  {
    source: 'zhuikong_description',
    target:
      '其他角色的准备阶段开始时时，若你已受伤，你可以与其拼点，若你：赢，其本回合内使用牌不能指定其他角色为目标；没赢，其至你的距离于本回合内视为1。',
  },
  {
    source: 'qiuyuan_description',
    target:
      '当你成为【杀】的目标时，你可以选择不为使用者和此【杀】目标的一名其他角色，其选择一项：1.交给你一张【闪】；2.成为此【杀】的目标。',
  },
  {
    source: 'longyin_description',
    target:
      '当一名角色于其出牌阶段内使用【杀】时，你可以弃置一张牌，令此【杀】不计入次数限制，然后若此【杀】为红色，你摸一张牌。',
  },
  {
    source: 'jingce_description',
    target:
      '出牌阶段，你每使用一种花色的手牌，你本回合手牌上限+1；出牌阶段结束时，你可摸X张牌（X是你本回合使用过牌的类型）。',
  },
  {
    source: 'qiaoshuo_description',
    target:
      '出牌阶段，你可以与一名角色拼点。若你：赢，你此阶段内使用的下一张基本或普通锦囊牌可多或少选一个目标；没赢，结束此阶段且你的锦囊牌于本回合内不计入手牌上限。',
  },
  { source: 'j3_zongshi_description', target: '当你的拼点结果确定后，若你赢/没赢，你可以获得其/你的拼点牌。' },
  { source: 'juece_description', target: '结束阶段开始时，你可以对没有手牌的一名其他角色造成1点伤害。' },
  {
    source: 'mieji_description',
    target:
      '出牌阶段限一次，你可以将一张黑色锦囊牌置于牌堆顶，并令有手牌的一名其他角色选择一项：1.交给你一张锦囊牌；2.依次弃置两张非锦囊牌。',
  },
  {
    source: 'fencheng_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以令所有其他角色依次选择一项：1.弃置至少X张牌（若有上一名角色且其选择弃置牌，X为其弃置牌数+1，否则X为1）；2.受到你造成的2点火焰伤害。',
  },
  {
    source: 'xiansi_description',
    target:
      '准备阶段开始时，你可以选择一至两名有牌的其他角色，你依次将这些角色的一张牌置于你的武将牌上，称为“逆”；当其他角色需要对你使用【杀】时，其可以移去你的两张“逆”，视为对你使用一张【杀】。',
  },
  {
    source: 'junxing_description',
    target:
      '出牌阶段限一次，你可以弃置至少一张手牌并选择一名其他角色，令其选择一项：1.弃置等量的牌并失去1点体力；2.翻面并摸等量的牌。',
  },
  {
    source: 'yuce_description',
    target:
      '当你受到伤害后，你可以展示一张手牌，然后伤害来源选择一项：1.弃置与此牌类别不同的一张手牌；2.令你回复1点体力。',
  },
  {
    source: 'duodao_description',
    target: '当你成为其他角色使用【杀】的目标后，你可以弃置一张牌，然后获得其装备区里的武器牌。',
  },
  {
    source: 'anjian_description',
    target:
      '<b>锁定技</b>，当你使用【杀】指定目标后，若你不在其攻击范围内，此【杀】无视其防具且对其伤害+1，若该角色因此【杀】进入濒死状态，其不能使用【桃】直到此濒死结算结束。',
  },
  { source: 'zongxuan_description', target: '当你的牌因弃置而进入弃牌堆后，你可以将其中至少一张牌置于牌堆顶。' },
  {
    source: 'zhiyan_description',
    target: '结束阶段开始时，你可以令一名其他角色摸一张牌并展示之，若此牌为装备牌，其使用之，然后回复1点体力。',
  },
  {
    source: 'danshou_description',
    target:
      '每回合限一次，当你成为基本牌或锦囊牌的目标后，你可以摸X张牌（X为你本回合内成为基本牌或锦囊牌目标的次数）；一名角色的结束阶段开始时，若你于此回合未以此法摸牌，你可以弃置与其手牌数相等数量的牌（若其没有手牌，则跳过此步骤），对其造成1点伤害。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'mieji:trick',
    target: '交给其一张锦囊牌',
  },
  {
    source: 'mieji:drop',
    target: '弃置两张非锦囊牌',
  },
  {
    source: '{0}: drop {1} cards or turn over',
    target: '{0}：弃置{1}张牌并失去一点体力，或翻面并摸{1}张牌',
  },

  {
    source: '{0}: please choose a card to put it on the top of the draw pile',
    target: '{0}：请选择一张牌，将其置于牌堆顶',
  },

  {
    source: '{0}: do you want to put at least one of these cards on the top of the draw pile?',
    target: '{0}：你可以将弃牌中至少一张牌以任意顺序置于牌堆顶',
  },

  {
    source: '{0}: do you want to choose a target to draw a card?',
    target: '{0}：你可以令一名角色摸一张牌并展示之',
  },
  {
    source: 'please choose: fencheng-options',
    target:
      '请选择：1.弃置至少X张牌（X为上一名角色且其选择弃置牌，X为其弃置牌数+1，否则为1）；2.受到其造成的2点火焰伤害',
  },
  {
    source: 'qiaoshuo_win',
    target: '巧说[赢]',
  },
  {
    source: 'qiaoshuo_lose',
    target: '巧说[没赢]',
  },
  {
    source: 'qiaoshuo: add',
    target: '添加目标',
  },
  {
    source: 'qiaoshuo: reduce',
    target: '减少目标',
  },
  {
    source: 'qiaoshuo: please select',
    target: '巧说：请选择一项操作',
  },
  {
    source: 'qiaoshuo: please select a player to reduce from card targets',
    target: '请选择一名角色从卡牌目标中移除',
  },
  {
    source: 'qiaoshuo: please select a player to append to card targets',
    target: '请选择一名角色将其添加至卡牌目标中',
  },
  {
    source: "{1} is removed from target list of {2} by {0}'s skill {3}",
    target: '{0}使用了技能{3}，将{1}从{2}的目标中移除',
  },
  {
    source: "{1} is appended to target list of {2} by {0}'s skill {3}",
    target: '{0}使用了技能{3}，将{1}添加至{2}的目标中',
  },
  {
    source: '{0}: do you want to drop {1} card(s) to deal 1 damage to {2} ?',
    target: '{0}：你可以弃置 {1} 张牌对 {2} 造成1点伤害',
  },
  {
    source: '{0}: do you want to deal 1 damage to {1} ?',
    target: '{0}：你可以对 {1} 造成1点伤害',
  },
  {
    source: '{0}: you need to give a jink to {1}',
    target: '{0}：请交给{1}一张【闪】，否则成为你将【杀】的目标之一',
  },
];
