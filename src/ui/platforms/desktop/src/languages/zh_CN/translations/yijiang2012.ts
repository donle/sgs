import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2012', target: '将2' },

  { source: 'wangyi', target: '王异' },
  { source: 'zhenlie', target: '贞烈' },
  { source: 'miji', target: '秘计' },

  { source: 'xunyou', target: '荀攸' },
  { source: 'qice', target: '奇策' },
  { source: 'zhiyu', target: '智愚' },

  { source: 'zhonghui', target: '钟会' },
  { source: 'quanji', target: '权计' },
  { source: 'zili', target: '自立' },
  { source: 'paiyi', target: '排异' },

  { source: 'guanxingzhangbao', target: '关兴张苞' },
  { source: 'fuhun', target: '父魂' },

  { source: 'liaohua', target: '廖化' },
  { source: 'dangxian', target: '当先' },
  { source: '#dangxian', target: '当先' },
  { source: 'fuli', target: '伏枥' },

  { source: 'madai', target: '马岱' },
  { source: 'qianxi', target: '潜袭' },
  { source: 'qianxi_red', target: '潜袭[红色]' },
  { source: 'qianxi_black', target: '潜袭[黑色]' },

  { source: 'bulianshi', target: '步练师' },
  { source: 'anxu', target: '安恤' },
  { source: 'zhuiyi', target: '追忆' },

  { source: 'chengpu', target: '程普' },
  { source: 'lihuo', target: '疠火' },
  { source: 'chunlao', target: '醇醪' },

  { source: 'handang', target: '韩当' },
  { source: 'gongji', target: '弓骑' },
  { source: 'jiefan', target: '解烦' },

  { source: 'liubiao', target: '刘表' },
  { source: 'zishou', target: '自守' },
  { source: 'zongshi', target: '宗室' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhenlie_description',
    target:
      '当你成为其他角色使用【杀】或普通锦囊牌的目标后，你可以失去1点体力，令此牌对你无效，然后你弃置使用者的一张牌。',
  },
  {
    source: 'miji_description',
    target: '结束阶段开始时，你可以摸X张牌，然后可将等量手牌交给一名其他角色（X为你已损失的体力值）。',
  },

  {
    source: 'qice_description',
    target: '出牌阶段限一次，你可以将所有手牌当任意普通锦囊牌使用。',
  },
  {
    source: 'zhiyu_description',
    target: '当你受到伤害后，你可以摸一张牌并展示所有手牌，若这些牌颜色均相同，伤害来源弃置一张手牌。',
  },

  {
    source: 'quanji_description',
    target:
      '出牌阶段结束时，若你的手牌数大于体力值，或当你受到1点伤害后，你可以摸一张牌，然后将一张手牌置于你的武将牌上，称为“权”；你的手牌上限+X（X为你的“权”数）。',
  },
  {
    source: 'zili_description',
    target: '觉醒技，准备阶段开始时，若你有不少于3张“权”，你减1点体力上限，回复1点体力或摸两张牌，然后获得技能“排异”。',
  },
  {
    source: 'paiyi_description',
    target: '出牌阶段限一次，你可以移去一张“权”，令一名其他角色摸两张牌，然后若其手牌数大于你，你对其造成1点伤害。',
  },

  {
    source: 'fuhun_description',
    target:
      '你可以将两张手牌当【杀】使用或打出；当你以此法使用的【杀】于你的出牌阶段内造成伤害后，你于本回合内拥有“武圣”和“咆哮”。',
  },

  {
    source: 'dangxian_description',
    target: '<b>锁定技</b>，回合开始时，你从弃牌堆中随机获得一张【杀】，执行一个额外的出牌阶段。',
  },
  {
    source: 'fuli_description',
    target:
      '<b>限定技</b>，当你处于濒死状态时，你可以将体力回复至X点（X为存活势力数），然后若你的体力值为全场最高，你翻面。',
  },

  {
    source: 'qianxi_description',
    target:
      '准备阶段开始时，你可以摸一张牌，弃置一张牌，然后你令你距离为1的一名角色于本回合内不能使用或打出与你以此法弃置牌颜色相同的手牌。',
  },
  {
    source: 'anxu_description',
    target:
      '出牌阶段限一次，你可以依次选择两名其他角色，令前者获得后者的一张牌，若前者以此法获得的牌不为装备区里的牌，你摸一张牌，然后你可以令二者中手牌较少的角色摸一张牌。',
  },
  {
    source: 'zhuiyi_description',
    target: '当你死亡时，你可以令除杀死你的角色外的一名其他角色摸三张牌并回复1点体力。',
  },

  {
    source: 'lihuo_description',
    target: '你可将普【杀】当火【杀】使用，然后若此【杀】造成伤害，你失去1点体力；你使用火【杀】可额外选择一个目标。',
  },
  {
    source: 'chunlao_description',
    target:
      '结束阶段开始时，若你没有“醇”，你可以将至少一张【杀】置于你的武将牌上，称为“醇”；当一名角色处于濒死状态时，你可以移去一张“醇”，视为该角色使用一张【酒】，然后若移去的“醇”为：雷【杀】，你摸两张牌；火【杀】，你回复1点体力。',
  },

  {
    source: 'gongji_description',
    target:
      '若你的坐骑区内有牌，你的攻击范围无限；出牌阶段限一次，你可以弃置一张基本牌并选择一名有牌的其他角色，你弃置其一张牌。',
  },
  {
    source: 'jiefan_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以选择一名角色，然后令攻击范围内包含其的角色依次选择一项：1.弃置一张武器牌；2.令你选择的角色摸一张牌。',
  },

  {
    source: 'zishou_description',
    target: '摸牌阶段，你可以多摸X张牌（X为存活势力数），然后本回合内防止你对其他角色造成的伤害；结束阶段开始时，若你本回合内未对其他角色使用过牌，你可以弃置至少一张花色各不相同的手牌，然后摸等量的牌。',
  },
  {
    source: 'zongshi_description',
    target: '<b>锁定技</b>，你的手牌上限+X（X为存活势力数）；你的回合外，若你的手牌数不小于手牌上限，无色牌对你无效且你不能成为延时类锦囊牌的目标。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw a card, then put a hand card on your general card?',
    target: '{0}：你可以摸一张牌，然后将一张手牌置为“权”',
  },
  {
    source: '{0}: please put a hand card on your general card',
    target: '{0}：请选择一张手牌置为“权”',
  },

  { source: 'zili:drawcards', target: '摸两张牌' },
  { source: 'zili:recover', target: '回复1点体力' },

  {
    source: '{0}: do you want to lose 1 hp to nullify {1}, then drop a card from {2}',
    target: '{0}：你可以失去1点体力令 {1} 对你无效，然后你弃置 {2} 的一张牌',
  },

  {
    source: '{0}: do you want to give another player {1} hand card(s)?',
    target: '{0}：你可以选择 {1} 张牌交给一名其他角色',
  },

  {
    source: '{0} triggered skill {1}, started an extra {2}',
    target: '{0} 的技能 【{1}】被触发，开始了一个额外的 {2}',
  },

  {
    source: '{0}: please drop a weapon, or {1} will draw a card',
    target: '{0}：请弃置一张武器牌，否则 {1} 将会摸一张牌',
  },

  {
    source: 'qianxi: please choose a target with 1 Distance(to you)',
    target: '<b>潜袭</b>：请选择你至其距离为1的一名角色',
  },

  {
    source: '{0}: please choose a target to be the additional target of {1}',
    target: '{0}：你可以为此{1}选择一个额外目标',
  },

  {
    source: '{0}: do you want to put at least one slash on your general card?',
    target: '{0}：你可以将至少一张【杀】置为“醇”',
  },

  {
    source: '{0}: do you want to remove a Chun to let {1} uses an alchol?',
    target: '{0}：你可以移去一张“醇”，视为 {1} 使用一张【酒】',
  },

  {
    source: '{0}: do you want to let {1} draw a card?',
    target: '{0}：你可以令 {1} 摸一张牌',
  },

  {
    source: '{0}: please choose a target to draw 3 cards and recover 1 hp',
    target: '{0}：你可以令一名其他角色摸三张牌并回复1点体力',
  },

  {
    source: '{0}: please choose a target except {1} to draw 3 cards and recover 1 hp',
    target: '{0}：你可以令一名除 {1} 外的其他角色摸三张牌并回复1点体力',
  },
  
  {
    source: '{0}: do you want to discard at least one card with different suits and draw cards?',
    target: '{0}：你可以弃置至少一张花色各不相同的手牌，然后摸等量的牌',
  },

  {
    source: '{0} triggered skill {1}, prevent the damage to {2}',
    target: '{0} 的技能 【{1}】被触发，防止了对 {2} 造成的伤害',
  },
];
