import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'thunder', target: '雷' },

  { source: 'guanqiujian', target: '毌丘俭' },
  { source: 'zhengrong', target: '征荣' },
  { source: 'hongju', target: '鸿举' },
  { source: 'qingce', target: '清侧' },

  { source: 'haozhao', target: '郝昭' },
  { source: 'zhengu', target: '镇骨' },
  { source: 'zhengu sources: {0}', target: '镇骨[{0}]' },

  { source: 'zhugezhan', target: '诸葛瞻' },
  { source: 'zuilun', target: '罪论' },
  { source: 'fuyin', target: '父荫' },

  { source: 'chendao', target: '陈到' },
  { source: 'wanglie', target: '往烈' },

  { source: 'lukang', target: '陆抗' },
  { source: 'qianjie', target: '谦节' },
  { source: 'jueyan', target: '决堰' },
  { source: 'poshi', target: '破势' },
  { source: 'huairou', target: '怀柔' },

  { source: 'zhoufei', target: '周妃' },
  { source: 'liangyin', target: '良姻' },
  { source: '#liangyin', target: '良姻' },
  { source: 'kongsheng', target: '箜声' },

  { source: 'lei_yuanshu', target: '仲帝袁术' },
  { source: 'lei_yongsi', target: '庸肆' },
  { source: 'lei_weidi', target: '伪帝' },

  { source: 'zhangxiu', target: '张绣' },
  { source: 'congjian', target: '从谏' },
  { source: 'xiongluan', target: '雄乱' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhengrong_description',
    target:
      '当你使用【杀】或伤害类锦囊牌指定第一个目标后，你可以将一名手牌数不小于你的目标角色的一张牌置于你的武将牌上，称为“荣”。',
  },
  {
    source: 'hongju_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你拥有至少三张“荣”，你可以用至少一张手牌交换“荣”，无论你是否交换，你减1点体力上限，获得技能“清侧”。',
  },
  {
    source: 'qingce_description',
    target: '出牌阶段，你可以选择一张“荣”和一张手牌，你获得此“荣”并弃置此手牌，然后你弃置场上一张牌。',
  },

  {
    source: 'zhengu_description',
    target: '结束阶段开始时，你可以选择一名其他角色，其将手牌摸至或弃置至与你的手牌数相同（最多摸至五张），且其于其下个回合结束时执行同样的操作。',
  },

  {
    source: 'zuilun_description',
    target: '结束阶段开始时，你可以观看牌堆顶三张牌，若X：大于0，你获得其中X张牌，然后将其余牌以任意顺序置于牌堆顶；为0，你选择一名其他角色并与其各失去1点体力（X为你满足以下条件的项数：1.你与本回合内造成过伤害；2.你与本回合内未弃置过牌；3.你的手牌数为全场最少）。',
  },
  {
    source: 'fuyin_description',
    target: '<b>锁定技</b>，当你于一回合首次成为【杀】或【决斗】的目标后，若使用者的手牌数不少于你，此牌对你无效。',
  },

  {
    source: 'wanglie_description',
    target: '你于出牌阶段使用的第一张牌无距离限制；当你于出牌阶段使用【杀】或普通锦囊牌时，你可以令此牌不可被响应，且你于此阶段内不能再使用牌。',
  },

  {
    source: 'qianjie_description',
    target:
      '<b>锁定技</b>，当你横置前，你防止之；你不能成为拼点和延时类锦囊牌的目标。',
  },
  {
    source: 'jueyan_description',
    target: '出牌阶段限一次，你可以废除：武器栏，令你此阶段可多使用三张【杀】；防具栏，摸三张牌且你本回合手牌上限+3；所有坐骑栏，令你此阶段使用牌无距离限制；宝物栏，令你于此阶段内拥有“集智”。',
  },
  {
    source: 'poshi_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你的装备栏均废除或你的体力值为1，你减1点体力上限，然后将手牌摸至体力上限，失去技能“决堰”，获得技能“怀柔”。',
  },
  {
    source: 'huairou_description',
    target: '出牌阶段，你可以重铸一张武器牌。',
  },

  {
    source: 'liangyin_description',
    target: '当有牌移出游戏后，你可以令手牌数大于你的一名角色摸一张牌；当有牌从游戏外进入手牌后，你可以令手牌数小于你的一名角色弃置一张牌。',
  },
  {
    source: 'kongsheng_description',
    target: '准备阶段开始时，你可以将至少一张牌置于你的武将牌上。若如此做，此回合的结束阶段开始时，若其中有你可以使用的装备牌，你依次使用这些牌，并获得其余牌。',
  },

  {
    source: 'lei_yongsi_description',
    target: '<b>锁定技</b>，摸牌阶段，你令摸牌数改为X（X为存活势力数）；出牌阶段结束时，若你于此阶段：未造成过伤害，你将手牌摸至体力上限；造成过至少2点伤害，你本回合手牌上限为你已损失的体力值。',
  },
  {
    source: 'lei_weidi_description',
    target: '<b>主公技</b>，弃牌阶段开始时，若X大于0，你可以将一至X张手牌交给等量名其他群雄角色各一张（X为你的手牌数减去手牌上限的值）。',
  },

  {
    source: 'congjian_description',
    target: '当你成为普通锦囊牌的目标后，若目标数大于1，你可以将一张牌交给目标中的一名其他角色，若此牌：不为装备牌，你摸一张牌；为装备牌，你摸两张牌。',
  },
  {
    source: 'xiongluan_description',
    target: '<b>限定技</b>，出牌阶段，你可以废除所有装备栏和判定区，并选择一名其他角色，你于此阶段内对其使用牌无距离和次数限制，且其于此阶段内不能使用或打出手牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target to draw or drop hand cards until the number of hand cards equal to you?',
    target: '{0}：你可以令一名其他角色将手牌摸至或弃置至与你的手牌数相同',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：请弃置 {1} 张牌',
  },

  {
    source: '{0}: do you want to choose a target to prey a card from him, and put this card on your general card as ‘Rong’?',
    target: '{0}：你可以将一名手牌数不小于你的目标角色的一张牌置为“荣”',
  },

  {
    source: '{0}: do you want to obtain {1} card(s) from the top of draw stack?',
    target: '{0}：你可以获得牌堆顶 {1} 张牌',
  },
  {
    source: '{0}: do you want to view 3 cards from the top of draw stack, then choose another player to lose 1 hp with him?',
    target: '{0}：你可以观看牌堆顶三张牌，然后选择一名其他角色与你失去1点体力',
  },
  {
    source: 'to obtain',
    target: '获得的牌',
  },
  {
    source: 'zuilun: please choose another player to lose 1 hp with you',
    target: '罪论：请选择一名其他角色与你各失去1点体力',
  },

  {
    source: '{0}: do you want to make {1} disreponsive, then you cannot use card this phase?',
    target: '{0}：你可以令 {1} 不可被响应，然后你于此阶段内不能再使用牌',
  },

  {
    source: '{0}: do you want to choose a liangyin target to draw 1 card?',
    target: '{0}：你可以令一名手牌数多于你的角色摸一张牌',
  },
  {
    source: '{0}: do you want to choose a liangyin target to drop 1 card?',
    target: '{0}：你可以令一名手牌数少于你的角色弃置一张牌',
  },
  {
    source: '{0}: please drop a card',
    target: '{0}：请弃置一张牌',
  },

  {
    source: '{0}: do you want to put at least 1 card on your general card as ‘Kong’?',
    target: '{0}：你可以将至少一张牌置为“箜”',
  },
  {
    source: '{0}: please use a equip from ‘Kong’',
    target: '{0}：请选择“箜”中的一张装备牌使用',
  },

  {
    source: '{0}: do you want to choose a card to give it to another Qun general (can repeat {1} times)?',
    target: '{0}：你可以选择一张手牌和一名其他群雄角色，将此牌交给他（可重复 {1} 次）',
  },
  
  {
    source: '{0}: do you want to give a card to another target?',
    target: '{0}：你可以将一张牌交给一名其他角色，然后摸一张牌（若交出装备牌则改为摸两张）',
  },
];
