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
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>锁定技</b>，游戏开始时，你获得6枚“化神”标记。游戏开始时，你移去一枚“化神”标记，进入下一形态。当你进入濒死状态时，你弃置手牌区及装备区所有牌，移去一枚“化神”标记，进入下一形态；若如此做，其它所有角色依次回复1点体力，摸一张牌，并从三名武将中选择一个，获得其一个技能。',
  },
  {
    source: 'pve_longlin_description',
    target:
      '<b>锁定技</b>，锁定技，准备阶段开始时，若你的装备区：没有武器，你摸两张牌，没有防具，你摸两张牌，没有宝具，你摸两张牌；摸牌阶段开始时，你额外摸装备区花色数张牌；当你使用装备牌时，若你已受伤，你回复一点体力并摸一张牌，若你未受伤，你摸三张牌。',
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
    target:
      '<b>锁定技</b>，你使用的【杀】无法被响应，且游戏人数大于2时，此【杀】伤害+1。',
  },
  {
    source: 'pve_qinlv_description',
    target:
      '<b>锁定技</b>，每名角色结束阶段开始时，你与其各回复一点体力；若你仍受伤且不是你的回合，其失去X点体力；若其未受伤，则你摸X张牌。（X为体力上限一半，向下取整）',
  },
  {
    source: 'pve_longhou_description',
    target: '<b>锁定技</b>，你使用牌指定目标后，目标角色体力上限+1，然后受到其已损失体力值的伤害。',
  },
  {
    source: 'pve_jienu_description',
    target:
      '<b>锁定技</b>，当你翻面后，你回复一点体力并对所有其他角色造成两点火属性伤害；出牌阶段开始时，若你的体力值小于已损失的体力值，你翻面；当你受到伤害后，你翻面。（每受到一种属性伤害后削弱此技能直到受到普通伤害或单属性伤害超过四次）',
  },
  {
    source: 'pve_chaiyue_description',
    target:
      '<b>锁定技</b>，你每受到1点普通伤害后，你摸两张牌并将一张牌置于武将牌上，称为【碑】；摸牌阶段开始时，你摸X张牌；你的【杀】次数+X（X为【碑】数）',
  },
  {
    source: 'pve_lige_description',
    target:
      '<b>锁定技</b>，一名其他角色结束阶段开始时，其交给你一张牌或令你摸两张牌，选择后视为对其使用【决斗】',
  },
  {
    source: 'pve_bibao_description',
    target:
      '<b>锁定技</b>，你造成或受到伤害时，你回复1点体力且此伤害+1，你摸等同伤害+1张牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '请选择一个武将并获得其一个技能',
  },
];
