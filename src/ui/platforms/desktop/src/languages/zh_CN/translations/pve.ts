import { Word } from 'languages';

export const characterDictionary: Word[] = [
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
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>锁定技</b>，游戏开始时，你获得5枚“化神”标记。当你死亡时，你弃置手牌区及装备区所有牌，移去一枚“化神”标记，进入下一形态；若如此做，其它所有角色依次回复1点体力，摸一张牌，并从三名武将中选择一个，获得其一个技能。',
  },
  {
    source: 'pve_longlin_description',
    target: '<b>锁定技</b>，当你使用装备牌时，若你已受伤，你回复一点体力并摸一张牌，若你未受伤，你摸三张牌',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>锁定技</b>，结束阶段开始时，你摸三张牌。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>锁定技</b>，当你成为一名其它角色使用牌的目标后，你弃置其一张牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>锁定技</b>，当你受到伤害后，你摸一张牌并将一张牌置于武将牌上，称为【碑】；你的手牌上限+X；摸牌阶段开始时，你额外摸X张牌（X为碑的数目）。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，你依次弃置其它角色两张牌，如此做后，若其手牌区及装备区均无牌，其失去一点体力上限。',
  },
  {
    source: 'pve_longlie_description',
    target: '<b>锁定技</b>，你使用的【杀】指定目标后，你令此【杀】不能被【闪】响应，且此【杀】伤害加一。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '请选择一个武将并获得其一个技能',
  },
];
