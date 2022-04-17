import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'pve_boss', target: '龙神' },
  { source: 'pve_huashen', target: '化神' },
  { source: 'pve_chaofeng', target: '嘲风' },
  { source: 'pve_longlin', target: '龙鳞' },
  { source: 'pve_suanni', target: '狻猊' },
  { source: 'pve_ruiyan', target: '瑞烟' },
  { source: 'pve_bian', target: '狴犴' },
  { source: 'pve_suwei', target: '肃威' },
  { source: 'pve_bixi', target: '赑屃' },
  { source: 'pve_lingxi', target: '灵屃' },
  { source: 'pve_fuxi', target: '负屃' },
  { source: 'pve_longshi', target: '龙识' },
  { source: 'pve_yazi', target: '睚眦' },
  { source: 'pve_longlie', target: '龙烈' },
  { source: '#pve_longlie', target: '龙烈' },
  { source: 'pve_qinlv', target: '琴律' },
  { source: 'pve_jienu', target: '介怒' },
  { source: 'pve_longhou', target: '龙吼' },
  { source: 'pve_chaiyue', target: '豺月' },
  { source: 'pve_lige', target: '离歌' },
  { source: 'pve_bibao', target: '必报' },
  { source: 'pve_tansuo', target: '探索' },

  { source: 'pve_soldier', target: '风瑶军' },
  { source: 'pve_qisha', target: '七杀' },
  { source: 'pve_tiantong', target: '天同' },
  { source: 'pve_tianliang', target: '天梁' },
  { source: 'pve_tianji', target: '天机' },
  { source: 'pve_tianxiang', target: '天相' },

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
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>锁定技</b>，游戏开始时，你获得6枚“化神”标记。游戏开始时，你移去一枚“化神”标记，进入下一形态。当你进入濒死状态时，你弃置手牌区及装备区所有牌，移去一枚“化神”标记，进入下一形态；若如此做，其它所有角色依次回复1点体力，摸两张牌，选择一张牌名强化并从四名武将中选择一个，获得其一个技能。',
  },
  {
    source: 'pve_longlin_description',
    target:
      '<b>锁定技</b>，锁定技，准备阶段开始时，若你的装备区：没有武器，你摸两张牌，没有防具，你摸两张牌，没有宝具，你摸两张牌；摸牌阶段开始时，你额外摸装备区花色数张牌；当你使用装备牌时，若你已受伤，你回复两点体力并摸一张牌，若你未受伤，你增加一点体力上限并摸三张牌。',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>锁定技</b>，准备阶段或结束阶段开始时，你摸X张牌（X为其它角色数）。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>锁定技</b>，当你成为一名其它角色使用牌的目标后，你摸一张牌并弃置其一张牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>锁定技</b>，当你受到伤害后，你摸一张牌并将一张牌置于武将牌上，称为【碑】；你的手牌上限+X；摸牌阶段开始时，你额外摸X张牌（X为碑的数目）。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>锁定技</b>，锁定技: 准备阶段开始时，你依次弃置其它角色各个区域至多三张牌；若你以此法弃置的卡牌类型之和：为3，你获得这些牌，为2，你对其造成一点伤害，不大于1，你扣减其一点体力上限。',
  },
  {
    source: 'pve_longlie_description',
    target: '<b>锁定技</b>，你使用的【杀】无法被响应，且游戏人数大于2时，此【杀】伤害+1。',
  },
  {
    source: 'pve_qinlv_description',
    target:
      '<b>锁定技</b>，每名角色结束阶段开始时，你与其各回复一点体力；若你仍受伤且不是你的回合，其失去X点体力；若其未受伤，则你摸X张牌。（X为其体力上限一半，向下取整）',
  },
  {
    source: 'pve_longhou_description',
    target: '<b>锁定技</b>，你使用牌指定目标后，目标角色体力上限+1，然后受到其已损失体力值的伤害。',
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
    source: 'pve_tansuo_description',
    target:
      '<b>锁定技</b>，第四关及之后，玩家使用牌有概率触发机关（此牌点数越高几率越大）或奇遇宝物。玩家初始强化【桃】且玩家共用强化池',
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
      '<b>锁定技</b>，你点亮的标记拥有如下效果：贪狼：其它角色准备阶段开始时，若你的手牌数不大于体力上限，你可以摸一张牌；文曲：你使用顺手牵羊、过河拆桥、火攻和决斗可以额外增加一个目标；武曲：准备阶段结束时，你可以与一名角色拼点，若你嬴，视为你对其使用一张杀；破军：当你受到伤害后，你可以弃置x张牌；你以此法每弃置一张黑色牌，摸两张牌；若你弃置的所有牌均为红色，你回复一点体力（x为你的体力值）；每当一种花色的判定牌亮出，或当你杀死一名角色时，你点亮一个阶段的标记。准备阶段开始时，若你已点亮四种标记时，你获得适应性加强。',
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
    target: '当你成为其它角色使用牌的目标后，你可以摸一张牌',
  },
  {
    source: 'pve_classic_tiantong_description',
    target: '<b>限定技</b>准备阶段开始时，你的体力值及体力上限加3；',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '请选择一个武将并获得其一个技能',
  },
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
    source: 'pve_huashen: please announce a boss',
    target: '请选择最终BOSS难度',
  },
  {
    source: 'pve_huashen:choose a role losehp 1',
    target: '选择一名角色，令其失去1点体力',
  },
  {
    source: 'pve_huashen:choose a role damage',
    target: '选择一名角色，对其造成伤害。',
  },
  {
    source: 'please announce a skill',
    target: '请选择一个技能',
  },
  {
    source: 'Please choose a character for get a skill',
    target: '请选择一个武将并获得其一个技能',
  },
];
export const eventDictionary: Word[] = [
  { source: 'pve-easy-mode', target: '低难度' },
  { source: 'pve-hard-mode', target: '高难度' },
  { source: '{0} ouyujiguan', target: '{0} 偶遇了机关' },
  { source: '{0} qiyubaowu', target: '{0} 奇遇宝物' },
  { source: 'please discard a card to deal 1 thunder damage to {0} ?', target: '请弃置一张牌并对{0}造成一点雷电伤害' },
  { source: '{0}: do you want to awaken?', target: '{0} 已点亮四种标记，请选择适应性强化' },
  { source: '{0}: get the next stage mark', target: '{0} 点亮下一阶段标记' },
  { source: '{0}: do you want to draw a card?', target: '{0} 你可以摸一张牌' },
  { source: '{0} triggered skill {1}, draw a card', target: '{0} 触发了{1}摸了一张牌' },
  {
    source: '{0}: you can append a player to the targets of {1}',
    target: '{0} 你可以选择一名其它角色，令其也成为 {1} 的目标',
  },
  { source: '{0} triggered skill {1}, add a target for {2}', target: '{0} 使用了技能 {1}, 为 {2} 添加了一个目标' },
  { source: '{0}: you can pindian to a player', target: '{0} 你可以选择一名角色拼点' },
  { source: '{0}: you can drop {1}', target: '{0} 你可以弃置{1}张牌' },
];
