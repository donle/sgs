import { Word } from 'languages';

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
  { source: '#fuhun', target: '父魂' },

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
  { source: '#lihuo', target: '疠火（增加目标）' },
  { source: '##lihuo', target: '疠火（置为醇）' },
  { source: '###lihuo', target: '疠火（失去体力）' },
  { source: 'chunlao', target: '醇醪' },

  { source: 'handang', target: '韩当' },
  { source: 'gongqi', target: '弓骑' },
  { source: 'gongqi suits: {0}', target: '弓骑[{0}]' },
  { source: 'jiefan', target: '解烦' },

  { source: 'liubiao', target: '刘表' },
  { source: 'zishou', target: '自守' },
  { source: 'zongshi', target: '宗室' },

  { source: 'decade_dangxian', target: '当先' },
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
    target:
      '你可将普【杀】当火【杀】使用，然后若此【杀】造成伤害，你失去1点体力；你使用火【杀】可额外选择一个目标；当你于一回合使用的第一张牌结算结束后，若此牌为【杀】，你可以将之置为“醇”。',
  },
  {
    source: 'chunlao_description',
    target:
      '结束阶段开始时，若你没有“醇”，你可以将至少一张【杀】置于你的武将牌上，称为“醇”；当一名角色处于濒死状态时，你可以移去一张“醇”，视为该角色使用一张【酒】，然后若移去的“醇”为：雷【杀】，你摸两张牌；火【杀】，你回复1点体力。',
  },

  {
    source: 'gongqi_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌，令你于本回合攻击范围无限，且使用与以此法弃置牌花色相同的【杀】无次数限制。若你以此法弃置的是装备牌，你可以弃置一名其他角色一张牌。',
  },
  {
    source: 'jiefan_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以选择一名角色，然后令攻击范围内包含其的角色依次选择一项：1.弃置一张武器牌；2.令你选择的角色摸一张牌。若此时是游戏的第一轮，本技能于此回合结束时视为未发动过。',
  },

  {
    source: 'zishou_description',
    target:
      '摸牌阶段，你可以多摸X张牌（X为存活势力数），然后本回合内防止你对其他角色造成的伤害；结束阶段开始时，若你本回合内未对其他角色使用过牌，你可以弃置至少一张花色各不相同的手牌，然后摸等量的牌。',
  },
  {
    source: 'zongshi_description',
    target:
      '<b>锁定技</b>，你的手牌上限+X（X为存活势力数）；你的回合外，若你的手牌数不小于手牌上限，无色牌对你无效且你不能成为延时类锦囊牌的目标。',
  },

  {
    source: 'decade_dangxian_description',
    target:
      '<b>锁定技</b>，回合开始时，你可以失去1点体力并随机获得弃牌堆里的一张【杀】，无论你是否失去体力，你执行一个额外的出牌阶段。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhenlie:1',
    target: '忠贞与国，节烈与身！',
  },
  {
    source: '$zhenliu:2',
    target: '我辈虽女流，烈胆胜须眉！',
  },
  {
    source: '$miji:1',
    target: '孤城临险，需出奇计。',
  },
  {
    source: '$miji:2',
    target: '秘计九出，佐君平贼！',
  },

  {
    source: '$qice:1',
    target: '倾力为国，算无遗策。',
  },
  {
    source: '$qice:2',
    target: '奇策在此，谁与争锋？',
  },
  {
    source: '$zhiyu:1',
    target: '大勇若怯，大智如愚。',
  },
  {
    source: '$zhiyu:2',
    target: '愚者既出，智者何存？',
  },

  {
    source: '$quanji:1',
    target: '备兵驯马，以待战机。',
  },
  {
    source: '$quanji:2',
    target: '避其锋芒，权且忍让。',
  },
  {
    source: '$zili:1',
    target: '金鳞，岂是池中之物！',
  },
  {
    source: '$zili:2',
    target: '千载一时，鼎足而立！',
  },
  {
    source: '$paiyi:1',
    target: '艾命不遵，死有余辜。',
  },
  {
    source: '$paiyi:2',
    target: '非我族类，其心必异。',
  },

  {
    source: '$fuhun:1',
    target: '不雪父仇，誓不罢休！',
  },
  {
    source: '$fuhun:2',
    target: '承父遗志，横扫叛贼！',
  },

  {
    source: '$dangxian:1',
    target: '谁言蜀汉已无大将！',
  },
  {
    source: '$dangxian:2',
    target: '老将虽白发，宝刀刃犹',
  },
  {
    source: '$fuli:1',
    target: '未破敌军，岂可轻易伏诛？',
  },
  {
    source: '$fuli:2',
    target: '看老夫再奋身一战！',
  },

  {
    source: '$qianxi:1',
    target: '吾能斩魏延，亦能斩杀你！',
  },
  {
    source: '$qianxi:2',
    target: '擒贼先擒王，打蛇打七寸！',
  },

  {
    source: '$anxu:1',
    target: '和鸾雍雍，万福攸同。',
  },
  {
    source: '$anxu:2',
    target: '君子乐胥，万邦之屏。',
  },
  {
    source: '$zhuiyi:1',
    target: '终其永怀，恋心殷殷。',
  },
  {
    source: '$zhuiyi:2',
    target: '妾心所系，如月之恒。',
  },

  {
    source: '$lihuo:1',
    target: '引凶戾之火，以溃敌军！',
  },
  {
    source: '$lihuo:2',
    target: '熊熊天火，焚尽逆贼！',
  },
  {
    source: '$chunlao:1',
    target: '醇酒佳酿杯中饮，醉酒提壶力千钧！',
  },
  {
    source: '$chunlao:2',
    target: '身披疮痍，唯酒能医。',
  },

  {
    source: '$gongqi:1',
    target: '马踏飞箭，弓骑无双！',
  },
  {
    source: '$gongqi:2',
    target: '提弓上马，箭砺八方！',
  },
  {
    source: '$jiefan:1',
    target: '烦忧千万，且看我一刀解之。',
  },
  {
    source: '$jiefan:2',
    target: '莫道雄兵属北地，解烦威名天下扬。',
  },

  {
    source: '$zishou:1',
    target: '愿行仁义之道，何愁人心不归。',
  },
  {
    source: '$zishou:2',
    target: '稳据江汉，坐观时变。',
  },
  {
    source: '$zongshi:1',
    target: '',
  },
  {
    source: '$zongshi:2',
    target: '',
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
    source: 'gongqi: do you want to drop one card of another player?',
    target: '弓骑：你可以弃置一名其他角色一张牌',
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
    source: '{0}: do you want to put {1} on your general card as Chun?',
    target: '{0}：你可以将 {1} 置为“醇”',
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

  {
    source: '{0}: do you want to lose 1 hp to gain a slash from drop stack?',
    target: '{0}：你可以失去1点体力，并随机获得弃牌堆里的一张【杀】',
  },
];
