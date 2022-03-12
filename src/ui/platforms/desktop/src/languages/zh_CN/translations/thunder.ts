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
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你拥有至少三张“荣”，你可以用至少一张手牌交换“荣”，无论你是否交换，你减1点体力上限，获得技能“清侧”。',
  },
  {
    source: 'qingce_description',
    target: '出牌阶段，你可以选择一张“荣”和一张手牌，你获得此“荣”并弃置此手牌，然后你弃置场上一张牌。',
  },

  {
    source: 'zhengu_description',
    target:
      '结束阶段开始时，你可以选择一名其他角色，其将手牌摸至或弃置至与你的手牌数相同（最多摸至五张），且其于其下个回合结束时执行同样的操作。',
  },

  {
    source: 'zuilun_description',
    target:
      '结束阶段开始时，你可以观看牌堆顶三张牌，若X：大于0，你获得其中X张牌，然后将其余牌以任意顺序置于牌堆顶；为0，你选择一名其他角色并与其各失去1点体力（X为你满足以下条件的项数：1.你与本回合内造成过伤害；2.你与本回合内未弃置过牌；3.你的手牌数为全场最少）。',
  },
  {
    source: 'fuyin_description',
    target: '<b>锁定技</b>，当你于一回合首次成为【杀】或【决斗】的目标后，若使用者的手牌数不少于你，此牌对你无效。',
  },

  {
    source: 'wanglie_description',
    target:
      '你于出牌阶段使用的第一张牌无距离限制；当你于出牌阶段使用【杀】或普通锦囊牌时，你可以令此牌不可被响应，且你于此阶段内不能再使用牌。',
  },

  {
    source: 'qianjie_description',
    target: '<b>锁定技</b>，当你横置前，你防止之；你不能成为拼点和延时类锦囊牌的目标。',
  },
  {
    source: 'jueyan_description',
    target:
      '出牌阶段限一次，你可以废除：武器栏，令你此阶段可多使用三张【杀】；防具栏，摸三张牌且你本回合手牌上限+3；所有坐骑栏，令你此阶段使用牌无距离限制；宝物栏，令你于此阶段内拥有“集智”。',
  },
  {
    source: 'poshi_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你的装备栏均废除或你的体力值为1，你减1点体力上限，然后将手牌摸至体力上限，失去技能“决堰”，获得技能“怀柔”。',
  },
  {
    source: 'huairou_description',
    target: '出牌阶段，你可以重铸一张武器牌。',
  },

  {
    source: 'liangyin_description',
    target:
      '当有牌移出游戏后，你可以令手牌数大于你的一名角色摸一张牌；当有牌从游戏外进入手牌后，你可以令手牌数小于你的一名角色弃置一张牌。',
  },
  {
    source: 'kongsheng_description',
    target:
      '准备阶段开始时，你可以将至少一张牌置于你的武将牌上。若如此做，此回合的结束阶段开始时，若其中有你可以使用的装备牌，你依次使用这些牌，并获得其余牌。',
  },

  {
    source: 'lei_yongsi_description',
    target:
      '<b>锁定技</b>，摸牌阶段，你令摸牌数改为X（X为存活势力数）；出牌阶段结束时，若你于此阶段：未造成过伤害，你将手牌摸至体力值；造成过至少2点伤害，你本回合手牌上限为你已损失的体力值。',
  },
  {
    source: 'lei_weidi_description',
    target:
      '<b>主公技</b>，弃牌阶段开始时，若X大于0，你可以将一至X张手牌交给等量名其他群雄角色各一张（X为你的手牌数减去手牌上限的值）。',
  },

  {
    source: 'congjian_description',
    target:
      '当你成为普通锦囊牌的目标后，若目标数大于1，你可以将一张牌交给目标中的一名其他角色，若此牌：不为装备牌，你摸一张牌；为装备牌，你摸两张牌。',
  },
  {
    source: 'xiongluan_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以废除所有装备栏和判定区，并选择一名其他角色，你于此阶段内对其使用牌无距离和次数限制，且其于此阶段内不能使用或打出手牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhengrong:1',
    target: '跨海东征，家国俱荣！',
  },
  {
    source: '$zhengrong:2',
    target: '东征高句丽，保辽东安稳！',
  },
  {
    source: '$hongju:1',
    target: '一举拿下，鸿途可得！',
  },
  {
    source: '$hongju:2',
    target: '鸿飞荣升，举重若轻！',
  },
  {
    source: '$qingce:1',
    target: '感明帝之恩，清君侧之贼！',
  },
  {
    source: '$qingce:2',
    target: '得太后手诏，清奸佞乱臣！',
  },

  {
    source: '$zhengu:1',
    target: '镇守城池，必以骨相拼！',
  },
  {
    source: '$zhengu:2',
    target: '孔明计虽百算，却难抵吾镇骨千拒！',
  },

  {
    source: '$zuilun:1',
    target: '吾有三罪，未能除黄皓，制伯约，守国土。',
  },
  {
    source: '$zuilun:2',
    target: '哎，数罪当论，吾愧对先帝恩惠。',
  },
  {
    source: '$fuyin:1',
    target: '得父荫庇，平步青云。',
  },
  {
    source: '$fuyin:2',
    target: '吾自幼心怀父诫，方不愧父亲荫庇。',
  },

  {
    source: '$wanglie:1',
    target: '猛将之烈，统帅之所往。',
  },
  {
    source: '$wanglie:2',
    target: '与子龙忠勇相往，猛烈相合。',
  },

  {
    source: '$qianjie:1',
    target: '继父之节，谦逊恭毕。',
  },
  {
    source: '$qianjie:2',
    target: '谦谦清廉德，节节卓尔茂。',
  },
  {
    source: '$jueyan:1',
    target: '毁堰坝之计，实为阻晋粮道。',
  },
  {
    source: '$jueyan:2',
    target: '堰坝毁之，可令敌军自退。',
  },
  {
    source: '$poshi:1',
    target: '破晋军分进合击之势，牵晋军主力之实！',
  },
  {
    source: '$poshi:2',
    target: '破羊祜之策，势在必行！',
  },
  {
    source: '$huairou:1',
    target: '各保分界，无求细利。',
  },
  {
    source: '$huairou:2',
    target: '胸怀千万，彰其德，包其柔。',
  },

  {
    source: '$liangyin:1',
    target: '结得良姻，固吴基业。',
  },
  {
    source: '$liangyin:2',
    target: '君恩之命，妾身良姻之福。',
  },
  {
    source: '$kongsheng:1',
    target: '窈窕淑女，箜篌友之。',
  },
  {
    source: '$kongsheng:2',
    target: '箜篌声声，琴瑟鸣鸣。',
  },

  {
    source: '$lei_yongsi:1',
    target: '传朕旨意，诸部遵旨即可！',
  },
  {
    source: '$lei_yongsi:2',
    target: '传国玉玺在手，朕一语便是天言！',
  },
  {
    source: '$lei_weidi:1',
    target: '朕今日雄举淮南，明日便可一匡天下！',
  },
  {
    source: '$lei_weidi:2',
    target: '天下，即将尽归我袁公路！',
  },

  {
    source: '$congjian:1',
    target: '哼，目光所及，短寸之间。',
  },
  {
    source: '$congjian:2',
    target: '狭目之见，只能窥底。',
  },

  {
    source: '$xiongluan:1',
    target: '雄踞宛城，虽乱世可安。',
  },
  {
    source: '$xiongluan:2',
    target: '北地枭雄，乱世不败。',
  },
  {
    source: '$congjian:1',
    target: '听君谏言，去危亡，保宗祀。',
  },
  {
    source: '$congjian:2',
    target: '从谏良计，可得自保。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source:
      '{0}: do you want to choose a target to draw or drop hand cards until the number of hand cards equal to you?',
    target: '{0}：你可以令一名其他角色将手牌摸至或弃置至与你的手牌数相同',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：请弃置 {1} 张牌',
  },

  {
    source:
      '{0}: do you want to choose a target to prey a card from him, and put this card on your general card as ‘Rong’?',
    target: '{0}：你可以将一名手牌数不小于你的目标角色的一张牌置为“荣”',
  },

  {
    source: '{0}: do you want to obtain {1} card(s) from the top of draw stack?',
    target: '{0}：你可以获得牌堆顶 {1} 张牌',
  },
  {
    source:
      '{0}: do you want to view 3 cards from the top of draw stack, then choose another player to lose 1 hp with him?',
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
