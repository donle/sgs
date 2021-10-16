import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'decade', target: '十周年' },

  { source: 'niujin', target: '牛金' },
  { source: 'cuirui', target: '摧锐' },
  { source: 'liewei', target: '裂围' },

  { source: 'zhanghu', target: '张虎' },
  { source: 'cuijian', target: '摧坚' },
  { source: 'cuijian_I', target: '摧坚' },
  { source: 'cuijian_II', target: '摧坚' },
  { source: 'cuijian_EX', target: '摧坚' },
  { source: 'tongyuan', target: '同援' },

  { source: 'xugong', target: '许贡' },
  { source: 'biaozhao', target: '表召' },
  { source: 'yechou', target: '业仇' },
  { source: '#s_yechou_debuff', target: '业仇（失去体力）' },

  { source: 'zhangwen', target: '张温' },
  { source: 'songshu', target: '颂蜀' },
  { source: 'sibian', target: '思辨' },

  { source: 'lijue', target: '李傕' },
  { source: 'langxi', target: '狼袭' },
  { source: 'yisuan', target: '亦算' },

  { source: 'guosi', target: '郭汜' },
  { source: 'tanbei', target: '贪狈' },
  { source: 'sidao', target: '伺盗' },

  { source: 'fanchou', target: '樊稠' },
  { source: 'xingluan', target: '兴乱' },

  { source: 'zhangji', target: '张济' },
  { source: 'lveming', target: '掠命' },
  { source: 'lveming times: {0}', target: '掠命[{0}]' },
  { source: 'tunjun', target: '屯军' },

  { source: 'liangxing', target: '梁兴' },
  { source: 'lulve', target: '掳掠' },
  { source: 'zhuixi', target: '追袭' },

  { source: 'duanwei', target: '段煨' },
  { source: 'langmie', target: '狼灭' },

  { source: 'zhangheng', target: '张横' },
  { source: 'dangzai', target: '挡灾' },
  { source: 'liangjue', target: '粮绝' },

  { source: 'panfeng', target: '潘凤' },
  { source: 'kuangfu', target: '狂斧' },

  { source: 'xingdaorong', target: '邢道荣' },
  { source: 'xuhe', target: '虚猲' },

  { source: 'caoxing', target: '曹性' },
  { source: 'liushi', target: '流矢' },
  { source: 'liushi: {0}', target: '流矢[{0}]' },
  { source: 'zhanwan', target: '斩腕' },

  { source: 'zhaozhong', target: '赵忠' },
  { source: 'yangzhong', target: '殃众' },
  { source: 'huangkong', target: '惶恐' },

  { source: 'hucheer', target: '胡车儿' },
  { source: 'daoji', target: '盗戟' },
  { source: 'fuzhong', target: '负重' },
  { source: 'zhong', target: '重' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'cuirui_description',
    target: '你的第一个回合开始时，你可以获得一至X名其他角色的各一张手牌（X为你的体力值）。',
  },
  {
    source: 'liewei_description',
    target: '每回合限X次（X为你的体力值），当你令其他角色进入濒死状态时，你可以摸一张牌。',
  },

  {
    source: 'cuijian_description',
    target:
      '出牌阶段限一次，你可以选择一名有手牌的其他角色，若其手牌中；有【闪】，其将手牌里的所有【闪】和装备区里的防具牌交给你，然后你交给其等量的牌；没有【闪】，你弃置一张手牌。',
  },
  {
    source: 'cuijian_I_description',
    target:
      '出牌阶段限一次，你可以选择一名有手牌的其他角色，若其手牌中；有【闪】，其将手牌里的所有【闪】和装备区里的防具牌交给你，然后你交给其等量的牌；没有【闪】，你摸一张牌。',
  },
  {
    source: 'cuijian_II_description',
    target:
      '出牌阶段限一次，你可以选择一名有手牌的其他角色，若其手牌中；有【闪】，其将手牌里的所有【闪】和装备区里的防具牌交给你，然后你交给其一张牌；没有【闪】，你弃置一张手牌。',
  },
  {
    source: 'cuijian_EX_description',
    target:
      '出牌阶段限一次，你可以选择一名有手牌的其他角色，若其手牌中；有【闪】，其将手牌里的所有【闪】和装备区里的防具牌交给你，然后你交给其一张牌；没有【闪】，你摸一张牌。',
  },
  {
    source: 'tongyuan_description',
    target:
      '<b>锁定技</b>，当你于回合外使用牌结算结束后，若此牌为：【无懈可击】，你将你的“摧坚”中的“你弃置一张手牌”修改为“你摸一张牌”；【桃】，你将你的“摧坚”中的“你交给其等量的牌”修改为“你交给其一张牌”。若以上两个修改都已被触发，则你于本局游戏内接下来使用的【无懈可击】不可被抵消，使用的【桃】回复值+1。',
  },

  {
    source: 'biaozhao_description',
    target:
      '结束阶段开始时，若你没有“表”，你可以将一张牌扣置于你的武将牌上，称为“表”；当与你的“表”花色和点数均相同的牌进入弃牌堆后，你移去你的“表”（若进入弃牌堆的牌为其他角色弃置，则改为该角色获得你的“表”），且你失去1点体力；准备阶段开始时，若你有“表”，你移去你的“表”，选择一名角色，令其回复1点体力并将手牌摸至X张（X为场上手牌数最多的角色的手牌数，且至多为5）。',
  },
  {
    source: 'yechou_description',
    target:
      '当你死亡时，你可以选择一名已损失体力值大于1的其他角色。若如此做，直到其下个回合开始前，其于每名角色的回合结束时失去1点体力。',
  },

  {
    source: 'songshu_description',
    target: '出牌阶段，你可以与一名角色拼点。若你没赢，其摸两张牌，且本技能于此阶段内失效。',
  },
  {
    source: 'sibian_description',
    target:
      '摸牌阶段，你可以改为亮出牌堆顶四张牌，你获得其中点数最大和最小的所有牌，然后若剩余的牌数为2且它们的点数之差小于存活角色数，你可以将剩余的牌交给手牌数最少的一名角色。',
  },

  {
    source: 'langxi_description',
    target: '准备阶段开始时，你可以选择一名体力值不大于你的其他角色，你对其造成0~2点随机伤害。',
  },
  {
    source: 'yisuan_description',
    target: '每阶段限一次，当你于出牌阶段内使用普通锦囊牌结算结束后，你可以减1点体力上限，获得之。',
  },

  {
    source: 'tanbei_description',
    target:
      '出牌阶段限一次，你可以令一名其他角色选择一项：1.令你随机获得其区域内的一张牌，然后你此阶段内不能对其使用牌；2.令你此阶段内对其使用牌无距离和次数限制。',
  },
  {
    source: 'sidao_description',
    target:
      '每阶段限一次，当你于出牌阶段内使用牌结算结束后，若此牌有包含在你于此阶段内使用过的上一张牌的目标中的目标角色，你可以将一张手牌当【顺手牵羊】对其中一名角色使用（目标须合法）。',
  },

  {
    source: 'xingluan_description',
    target: '每阶段限一次，当你于出牌阶段内使用牌结算结束后，你可以从牌堆随机获得点数为6的一张牌。',
  },

  {
    source: 'lveming_description',
    target:
      '出牌阶段限一次，你可以令装备区里牌数小于你的一名角色选择一个点数，然后你判定，若结果点数与其所选点数：相等，你对其造成2点伤害；不等，你随机获得其区域里的一张牌。',
  },
  {
    source: 'tunjun_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以令有空装备栏的一名角色依次从牌堆随机使用X张其装备区内没有的副类别的装备牌（X为你本局游戏发动过“掠命”的次数）。',
  },

  {
    source: 'lulve_description',
    target:
      '出牌阶段开始时，你可以令有手牌且手牌数小于你的一名角色选择一项：1.将所有手牌交给你，然后你翻面；2.翻面，然后视为对你使用一张【杀】。',
  },
  {
    source: 'zhuixi_description',
    target: '<b>锁定技</b>，当你对一名角色造成伤害时，或一名角色对你造成伤害时，若其武将牌正面朝向与你不同，此伤害+1。',
  },

  {
    source: 'langmie_description',
    target:
      '其他角色的出牌阶段结束时，若其于此阶段内使用过至少两张同类别的牌，你可以摸一张牌；其他角色的结束阶段开始时，若其于本回合内造成过的伤害值不少于2点，你可以弃置一张牌，对其造成1点伤害。',
  },

  {
    source: 'dangzai_description',
    target: '出牌阶段开始时，你可以将一名其他角色判定区里的一张牌移至你的判定区。',
  },
  {
    source: 'liangjue_description',
    target: '<b>锁定技</b>，当黑色牌进入或离开你的判定区或装备区后，若你的体力值大于1，你失去1点体力，然后摸两张牌。',
  },

  {
    source: 'kuangfu_description',
    target:
      '出牌阶段限一次，你可以弃置一名角色装备区里的一张牌，然后视为使用一张无距离限制的【杀】（不计入次数限制）。若你以此法弃置的牌为：你的牌，且此【杀】造成过伤害，你摸两张牌；其他角色的牌，且此【杀】未造成过伤害，你弃置两张手牌。',
  },

  {
    source: 'xuhe_description',
    target:
      '出牌阶段开始时，你可以减1点体力上限，然后弃置距离1以内的所有角色各一张牌或令这些角色各摸一张牌；出牌阶段结束时，若你的体力上限为全场最少，你加1点体力上限。',
  },

  {
    source: 'liushi_description',
    target:
      '出牌阶段，你可以将一张红桃牌置于牌堆顶，然后视为使用一张无距离限制的【杀】（不计入次数限制）。当此【杀】造成伤害后，受伤角色的手牌上限-1。',
  },
  {
    source: 'zhanwan_description',
    target:
      '<b>锁定技</b>，受到“流矢”效果影响的角色的弃牌阶段结束时，若其于此阶段内弃置过其牌，你摸等量的牌，然后移除其“流矢”效果。',
  },

  {
    source: 'yangzhong_description',
    target:
      '当你造成伤害后，你可以弃置两张牌，令受伤角色失去1点体力；当你受到伤害后，伤害来源可以弃置两张牌，令你失去1点体力。',
  },
  {
    source: 'huangkong_description',
    target: '<b>锁定技</b>，当你于回合外成为【杀】或伤害类锦囊牌的唯一目标后，若你没有手牌，你摸两张牌。',
  },

  {
    source: 'daoji_description',
    target:
      '当其他角色使用其于本局游戏内使用过的第一张武器牌时，你可以选择一项：1.获得此武器牌；2.其本回合不能使用或打出【杀】。',
  },
  {
    source: 'fuzhong_description',
    target:
      '<b>锁定技</b>，当你于回合外获得牌后，你获得1枚“重”标记；若你的“重”标记数不小于：1，你的手牌上限+1；2，你计算与其他角色的距离-1；3，摸牌阶段多摸一张牌；4，回合开始时，你对一名其他角色造成1点伤害，然后移去你的所有“重”。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$langxi:1',
    target: '袭夺之势，如狼噬骨！',
  },
  {
    source: '$langxi:2',
    target: '引吾至此，怎能不袭掠之？',
  },
  {
    source: '$yisuan:1',
    target: '吾亦能善算谋划！',
  },
  {
    source: '$yisuan:2',
    target: '算计人心，我也可略施一二。',
  },

  {
    source: '$tanbei:1',
    target: '此机，我怎么会错失？',
  },
  {
    source: '$tanbei:2',
    target: '你的东西，现在是我的了！',
  }, 
  {
    source: '$sidao:1',
    target: '连发伺动，顺手可得。',
  },
  {
    source: '$sidao:2',
    target: '伺机而动，此地可窃。',
  },

  {
    source: '$xingluan:1',
    target: '大兴兵争，长安当乱！',
  },
  {
    source: '$xingluan:2',
    target: '勇猛兴军，乱世当立！',
  },

  {
    source: '$lveming:1',
    target: '劫命掠财，毫不费力。',
  },
  {
    source: '$lveming:2',
    target: '人财，皆掠之。嘿嘿！',
  }, 
  {
    source: '$tunjun:1',
    target: '得封侯爵，屯军弘农。',
  },
  {
    source: '$tunjun:2',
    target: '屯军弘农，养精蓄锐。',
  },

  {
    source: '$lulve:1',
    target: '趁火打劫，乘威掳掠。',
  },
  {
    source: '$lulve:2',
    target: '天下大乱，掳掠以自保。',
  },
  {
    source: '$zhuixi:1',
    target: '得势追袭，胜望在握！',
  },
  {
    source: '$zhuixi:2',
    target: '诸将得令，追而袭之！',
  },

  {
    source: '$kuangfu:1',
    target: '大斧到处，片甲不留！',
  },
  {
    source: '$kuangfu:2',
    target: '你可接得住我一斧？',
  },

  {
    source: '$xuhe:1',
    target: '说出吾名，吓汝一跳！',
  },
  {
    source: '$xuhe:2',
    target: '我乃是零陵上将军！',
  },
];


export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
    target: '{0}；你可以对体力值不大于你的一名其他角色造成0~2点随机伤害',
  },

  {
    source: '{0}: do you want to lose a max hp to gain {1}?',
    target: '{0}；你可以减1点体力上限以获得 {1}',
  },

  {
    source: '{0}: do you want to gain a card with card number 6 from draw stack?',
    target: '{0}；你可以从牌堆随机获得点数为6的一张牌',
  },

  {
    source: '{0}: please choose lveming options',
    target: '{0}；请选择一个点数',
  },

  {
    source: '{0}: please choose tanbei options: {1}',
    target:
      '{0}；请选择一项：1.令 {1} 随机获得你区域内的一张牌，然后其本回合不能对你使用牌；2.令 {1} 本回合对你用牌无限制',
  },
  { source: 'tanbei:prey', target: '令其获得牌' },
  { source: 'tanbei:unlimited', target: '令其对你用牌无限制' },

  {
    source: '{0}: do you want to use a card as ShunShouQianYang to one of them?',
    target: '{0}；你可以将一张手牌当【顺手牵羊】对其中一名角色使用（目标须合法）',
  },

  {
    source: '{0}: do you want to choose a lulve target to use this skill?',
    target: '{0}；你可以选择手牌数少于你的一名角色，对其发动“掳掠”',
  },
  {
    source: '{0}: please choose lulve options: {1}',
    target: '{0}；请选择一项：1.交给 {1} 所有手牌，其翻面；2.你翻面，视为对 {1} 使用一张【杀】',
  },
  { source: 'lulve:prey', target: '交给其手牌' },
  { source: 'lulve:turnOver', target: '你翻面' },

  {
    source: '{0}: please choose a target to use a virtual slash to him',
    target: '{0}；请为此【杀】选择目标',
  },

  {
    source: '{0}: please choose xuhe options: {1}',
    target: '{0}；你可以弃置 {1} 各一张牌，或令这些角色各摸一张牌',
  },
  { source: 'xuhe:draw', target: '摸牌' },
  { source: 'xuhe:discard', target: '弃置牌' },

  {
    source: '{0}: do you want to discard 2 cards to let {1} lose 1 hp?',
    target: '{0}；你可以弃置两张牌，令 {1} 失去1点体力',
  },

  {
    source: '{0}: you need to give a handcard to {1}, otherwise you cannot response the card {1} use',
    target: '{0}；你可以交给 {1} 一张牌，否则你本回合不能响应 {1} 使用的牌',
  },

  {
    source: '{0}: please choose daoji options: {1} {2}',
    target: '{0}；你可以获得 {1} ，或令 {2} 本回合不能使用或打出【杀】',
  },
  { source: 'daoji:prey', target: '获得此武器' },
  { source: 'daoji:block', target: '其不能出杀' },

  {
    source: 'fuzhong: please choose another player to deal 1 damage',
    target: '负重：请选择一名其他角色，对其造成1点伤害',
  },

  {
    source: '{0}: do you want to choose at most {1} targets to prey cards?',
    target: '{0}；你可以获得至多 {1} 名其他角色各一张牌',
  },

  {
    source: '{0}: do you want to display 4 cards from the top of draw stack?',
    target: '{0}；你可以改为亮出牌堆顶四张牌，获得其中点数最大和最小的所有牌',
  },
  {
    source: '{0}: do you want to choose a target to give him {1}',
    target: '{0}；你可以将 {1} 交给手牌数最少的一名角色',
  },

  {
    source: '{0}: do you want to put a card on your general card as ‘Biao’?',
    target: '{0}；你可以将一张牌置为“表”',
  },
  {
    source: 'biaozhao: please choose a target to let him recover 1 hp, and then he draws {1} cards',
    target: '表召：请选择一名角色，令其回复1点体力，将手牌摸至 {1} 张',
  },

  {
    source: '{0}: do you want to choose a yechou target to use this skill?',
    target: '你可以对已损失体力值大于1的一名其他角色发动【{0}】',
  },
];
