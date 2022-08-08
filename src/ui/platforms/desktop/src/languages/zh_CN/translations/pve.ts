import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'pve_longshen', target: '龙神' },
  { source: 'pve_longshen_zhihuo', target: '止火' },
  { source: 'pve_longshen_qifu', target: '祈福' },
  { source: '~pve_longshen_qifu', target: '祈福' },
  { source: 'pve_longshen_chouxin', target: '抽薪' },
  { source: 'pve_longshen_suwei', target: '肃威' },
  { source: 'pve_longshen_ziyu', target: '自愈' },
  { source: 'pve_longshen_longlin', target: '龙鳞' },
  { source: 'pve_longshen_longling', target: '龙铃' },
  { source: 'pve_longshen_longning', target: '龙聍' },
  { source: 'pve_longshen_ruiyan', target: '瑞烟' },
  { source: 'pve_longshen_longshi', target: '龙识' },
  { source: 'pve_longshen_longli', target: '龙厉' },
  { source: 'pve_longshen_longlie', target: '龙烈' },
  { source: 'pve_longshen_qinlv', target: '琴律' },
  { source: 'pve_longshen_longhou', target: '龙吼' },
  { source: 'pve_longshen_longwei', target: '龙威' },
  { source: 'pve_longshen_longen', target: '龙恩' },
  { source: 'pve_longshen_longxiao', target: '龙啸' },
  { source: 'pve_longshen_longgu', target: '龙顾' },

  { source: 'pve_soldier', target: '风瑶军' },
  { source: 'pve_qisha', target: '七杀' },
  { source: 'pve_tiantong', target: '天同' },
  { source: 'pve_tianliang', target: '天梁' },
  { source: 'pve_tianji', target: '天机' },
  { source: 'pve_tianxiang', target: '天相' },
  { source: 'pve_lianzhen', target: '廉贞' },

  { source: 'pve_jian', target: '渐' },
  { source: 'pve_zhi', target: '制' },
  { source: 'pve_xi', target: '袭' },
  { source: 'pve_ji', target: '疾' },
  { source: 'pve_yu', target: '御' },
  { source: 'pve_ying', target: '盈' },
  { source: 'pve_gu', target: '孤' },
  { source: 'pve_he', target: '合' },
  { source: 'pve_tanlang', target: '贪狼' },
  { source: 'pve_wenqu', target: '文曲' },
  { source: 'pve_wuqu', target: '武曲' },
  { source: 'pve_pojun', target: '破军' },

  { source: 'pve_classic_qisha', target: '七杀' },
  { source: 'pve_classic_tiantong', target: '天同' },
  { source: 'pve_classic_tianliang', target: '天梁' },
  { source: 'pve_classic_tianji', target: '天机' },
  { source: 'pve_classic_tianxiang', target: '天相' },
  { source: 'pve_classic_lianzhen', target: '廉贞' },
  { source: 'pve_classic_gu', target: '孤勇' },
  { source: '#pve_classic_gu', target: '孤勇' },
  { source: 'pve_classic_guyong', target: '孤勇' },
  { source: '#pve_classic_guyong', target: '孤勇-天命' },
  { source: '##pve_classic_guyong', target: '孤勇-贪狼' },
  { source: '###pve_classic_guyong', target: '孤勇-文曲' },
  { source: '####pve_classic_guyong', target: '孤勇-武曲' },
  { source: '#####pve_classic_guyong', target: '孤勇-破军' },
  { source: 'pve_classic_ai', target: '合击' },
  { source: '#pve_classic_ai', target: '合击' },
  { source: 'pve_beifa', target: '北伐' },
  { source: 'pve_beifa times: {0}', target: '北[{0}]' },
  { source: 'pve_buxu', target: '不许' },
  { source: 'pve_buxu times: {0}', target: '不[{0}]' },
  { source: 'pve_dudu', target: '都督' },
  { source: 'pve_dudu times: {0}', target: '都[{0}]' },
  { source: 'pve_feihua', target: '飞华' },
  { source: 'pve_feihua times: {0}', target: '废[{0}]' },
  { source: 'pve_chengxiang', target: '丞相' },
  { source: 'pve_chengxiang times: {0}', target: '丞[{0}]' },
  { source: 'pve_zhibing', target: '知兵' },
  { source: 'pve_zhibing times: {0}', target: '知[{0}]' },
  { source: 'pve_pyjiaoyi', target: '交易' },
  { source: 'pve_tishen', target: '替身' },
  { source: 'pve_zhiheng', target: '再议' },

  { source: '{0} level start', target: '====== 第{0}关开始 ======' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_longshen_zhihuo_description',
    target: '<b>锁定技</b>，你的回合开始时，若其它角色技能数量超过5个，你随机获得其一个技能',
  },
  {
    source: 'pve_longshen_qifu_description',
    target:
      '其它角色出牌阶段内，其可以发动此技能并获得一个技能；若其发动此技能前技能数量已经不小于5个，其需先失去一个技能',
  },
  {
    source: 'pve_longshen_ziyu_description',
    target: '<b>锁定技</b>，准备阶段开始时，你将体力值恢复至体力上限。',
  },
  {
    source: 'pve_longshen_chouxin_description',
    target: '<b>锁定技</b>，其它角色于出牌阶段获得牌后，你获得其一张牌。',
  },
  {
    source: 'pve_longshen_suwei_description',
    target: '<b>锁定技</b>，当你成为一名其它角色使用牌的目标后，你摸一张牌并弃置其一张牌。',
  },
  {
    source: 'pve_longshen_longlin_description',
    target:
      '<b>锁定技</b>当你使用装备牌时，若你已受伤，你回复1点体力并摸两张牌，若你未受伤，你增加一点体力上限并摸三张牌。',
  },
  {
    source: 'pve_longshen_longling_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，若你的装备区：没有武器，你摸一张牌，没有防具，你摸一张牌，没有宝具，你摸一张牌。',
  },
  {
    source: 'pve_longshen_longning_description',
    target: '<b>锁定技</b>，当你摸牌时，你的装备区每有一种花色的牌，你多摸一张牌。',
  },
  {
    source: 'pve_longshen_ruiyan_description',
    target: '<b>锁定技</b>，准备阶段或结束阶段开始时，你摸X张牌（X为其它角色数）。',
  },
  {
    source: 'pve_longshen_longshi_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，你依次弃置其它角色各个区域至多三张牌；若你以此法弃置的卡牌类型之和：为3，你获得这些牌，为2，你对其造成一点伤害，不大于1，你扣减其一点体力上限。',
  },
  {
    source: 'pve_longshen_longli_description',
    target: '<b>锁定技</b>，你使用的牌无法被响应。',
  },
  {
    source: 'pve_longshen_longlie_description',
    target: '<b>锁定技</b>，你造成的伤害+1。',
  },
  {
    source: 'pve_longshen_qinlv_description',
    target: '<b>锁定技</b>，每名角色结束阶段开始时，你回复一点体力，若你仍受伤，你摸X张牌。（X为你已损失的体力值）',
  },
  {
    source: 'pve_longshen_longhou_description',
    target:
      '<b>锁定技</b>，每回合限三次，当你使用牌指定其它角色为目标后，你令其体力上限+1，然后受到其已损失体力值的伤害。',
  },
  { source: 'pve_longshen_longwei_description', target: '<b>锁定技</b>，你的回合外，其它角色使用的前3张牌对你无效。' },
  {
    source: 'pve_longshen_longen_description',
    target: '<b>锁定技</b>，其它角色摸牌时，视为你对其使用一张火杀，然后你令其多摸一张牌。',
  },
  {
    source: 'pve_longshen_longxiao_description',
    target: '<b>锁定技</b>，你使用牌无次数限制。',
  },
  {
    source: 'pve_longshen_longgu_description',
    target: '<b>锁定技</b>，回合开始时，你获得牌堆中一张装备牌并使用。',
  },

  {
    source: 'pve_jienu_description',
    target:
      '<b>锁定技</b>，当你翻面后，你回复一点体力并对所有其他角色造成两点火属性伤害；出牌阶段开始时，若你的体力值小于已损失的体力值，你翻面；当你受到伤害后，你对所有其他角色造成两点火属性伤害，若此伤害为普通伤害，则你回复两点体力',
  },
  {
    source: 'pve_chaiyue_description',
    target:
      '<b>锁定技</b>，你每受到1点普通伤害后，你摸两张牌并将一张牌置于武将牌上，称为【碑】；摸牌阶段开始时，你摸X张牌；你的【杀】次数+X（X为【碑】数）',
  },
  {
    source: 'pve_lige_description',
    target: '<b>锁定技</b>，一名其他角色结束阶段开始时，其交给你一张牌或令你摸两张牌，选择后视为对其使用【决斗】',
  },
  {
    source: 'pve_bibao_description',
    target: '<b>锁定技</b>，你造成或受到伤害时，你回复1点体力且此伤害+1，你摸等同伤害+1张牌。',
  },
  {
    source: 'pve_beifa_description',
    target: '<b>锁定技</b>，你失去最后一张牌时，令一名角色失去X点体力。（X为此技能等级）',
  },
  {
    source: 'pve_buxu_description',
    target: '<b>锁定技</b>，BOSS回合内其使用的前X张牌对你无效。（X为此技能等级）',
  },
  {
    source: 'pve_dudu_description',
    target: '出牌阶段限一次，你摸1张牌。（升级多摸两张）',
  },
  {
    source: 'pve_chengxiang_description',
    target: '<b>锁定技</b>，出牌阶段结束时，你随机回复1-3点体力。（升级提升1点回复。）',
  },
  {
    source: 'pve_zhibing_description',
    target: '出牌阶段限一次，对一名角色造成随机1-3点伤害。（升级提升1点伤害上限）',
  },
  {
    source: 'pve_classic_ai_desc',
    target:
      '<b>锁定技</b> 你或你的队友拥有如下标记时，执行对应操作：【渐】摸牌阶段可以多摸一张牌；【制】手牌上限等于体力值；【袭】出牌阶段可以多出一张杀；【疾】初始手牌数量加3；【御】受到伤害后可以摸一张牌；【盈】体力及体力上限加1',
  },
  {
    source: 'pve_classic_gu_desc',
    target:
      '<b>锁定技</b>你每打出或使用一种花色的牌，若没有对应的标记，根据这些牌的花色，你获得对应标记：黑桃牌，获得“紫微”；梅花牌，获得“后土”；红桃牌，获得“玉清”；方块牌，获得“勾陈”。当你摸牌时，消耗一枚标记，额外摸一张牌；当你造成或受到伤害时，消耗两枚标记，伤害值+1/-1；准备阶段开始时，消耗三枚标记，摸一张牌并视为使用一张杀；结束阶段结束时，消耗四枚标记，增加一点体力上限并回复一点体力',
  },
  {
    source: 'pve_classic_guyong_description',
    target:
      '<b>锁定技</b>，你点亮的标记拥有如下效果：<p>贪狼：其它角色准备阶段开始时，若你的手牌数不大于体力上限，你可以摸一张牌</p><p>文曲：你使用顺手牵羊、过河拆桥、火攻和决斗可以额外增加一个目标</p><p>武曲：准备阶段结束时，你可以与一名角色拼点，若你嬴，视为你对其使用一张杀，若你没赢，视为其对你使用一张决斗</p><p>破军：每回合限一次，当你于回合外成为锦囊牌的目标后，你可以弃置一张牌；若此牌：为装备牌，你对其造成一点伤害；为锦囊牌，你随机获得其一张手牌，为基本牌，你摸一张牌</p>每当一种花色的判定牌亮出，或当你杀死一名角色时，你点亮一个阶段的标记。准备阶段开始时，若你已点亮四种标记时，你获得适应性加强。',
  },
  {
    source: 'pve_classic_qisha_description',
    target: '<b>锁定技</b>，你的杀、决斗、火攻、南蛮入侵和万箭齐发的伤害基数+1',
  },
  {
    source: 'pve_classic_tianji_description',
    target: '其他角色回合结束时，若其本回合没有造成过伤害，你弃一张牌对其造成一点雷属性伤害',
  },
  {
    source: 'pve_classic_tianliang_description',
    target: '<b>锁定技</b>，摸牌时你多摸一张牌（每回合限x次，x为你的体力上限）',
  },
  {
    source: 'pve_classic_tianxiang_description',
    target:
      '当你受到伤害后，你可以弃置x张牌；你以此法每弃置一张黑色牌，摸两张牌；若你弃置的所有牌均为红色，你对伤害来源造成一点伤害（x为你已损失的体力值）',
  },
  {
    source: 'pve_classic_tiantong_description',
    target: '<b>限定技</b>准备阶段开始时，你的体力值及体力上限加3；',
  },
  {
    source: 'pve_classic_lianzhen_description',
    target: '回合开始时，你可以指定一名角色，该角色每获得一张牌，你摸一张牌；若此时在你的回合内，你额外摸一张牌；',
  },
  {
    source: 'pve_tishen_description',
    target: '准备阶段，你可以将体力恢复至体力上限并摸等量张牌',
  },
  {
    source: 'pve_zhiheng_description',
    target: '出牌阶段限一次，你可以弃置至少一张牌，然后摸等量的牌。若你以此法弃置了所有的手牌，则额外摸一张牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please make a card1',
    target: '请选择一张牌名，使用此牌名时，摸一张牌',
  },
  {
    source: 'pve_huashen: please make a card2',
    target: '请选择一张牌名，使用此牌名时，令一名角色失去1点体力',
  },
  {
    source: 'pve_huashen: please make a card3',
    target: '请选择一张牌名，使用此牌名时，对一名角色造成随机1-3点伤害',
  },
  {
    source: 'pve_huashen: please make a card4',
    target: '请选择一张牌名，使用此牌名时，你随机回复至多3点体力',
  },
  {
    source: 'pve_huashen:choose a role losehp 1',
    target: '选择一名角色，令其失去1点体力',
  },
  {
    source: 'pve_huashen:choose a role damage',
    target: '选择一名角色，对其造成伤害。',
  },
  { source: 'Please drop a skill', target: '请选择一个技能失去' },
  {
    source: 'Please announce a skill',
    target: '请选择一个技能获得',
  },
  {
    source: 'Please select cards which needs to be replaced',
    target: '请选择需要更换的手牌',
  },
];

export const eventDictionary: Word[] = [
  { source: '{0}: do you want to awaken?', target: '{0} 已点亮四种标记，请选择适应性强化' },
  { source: '{0}: get the next stage mark', target: '{0} 点亮下一阶段标记' },
  { source: '{0}: do you want to draw a card?', target: '{0} 你可以摸一张牌' },
  { source: '{0} triggered skill {1}, draw a card', target: '{0} 触发了{1}摸了一张牌' },
  {
    source: '{0}: you can append a player to the targets of {1}',
    target: '{0} 你可以选择一名其它角色，令其也成为 {1} 的目标',
  },
  { source: '{0}: please select a player append to target for {1}', target: '{0} 请选择一名角色成为{1}的额外目标' },
  { source: '{0} triggered skill {1}, add a target for {2}', target: '{0} 使用了技能 {1}, 为 {2} 添加了一个目标' },
  { source: '{0}: you can pindian to a player', target: '{0} 你可以选择一名角色拼点' },
  { source: '{0}: you can drop {1}', target: '{0} 你可以弃置{1}张牌' },
  {
    source: '{0}: you can drop a card',
    target: '{0}: 你可以弃置一张牌',
  },
  {
    source: '{0}: you can drop a card to deal 1 thunder damage to current player?',
    target: '{0}: 你可以弃置一张牌，并对当前回合角色造成一点雷属性伤害',
  },

  {
    source: 'Please choose a character for get a skill',
    target: '请选择一个武将并获得其一个技能',
  },
];
