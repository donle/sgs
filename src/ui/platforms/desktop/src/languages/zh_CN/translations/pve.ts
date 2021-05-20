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
  { source: 'pve_longxian', target: '龙弦' },
  { source: 'pve_fuxi', target: '负屃' },
  { source: 'pve_longshi', target: '龙识' },
  { source: 'pve_yazi', target: '睚眦' },
  { source: 'pve_longlie', target: '龙烈' },
  { source: '#pve_longlie', target: '龙烈' },
  { source: 'pve_pitai', target: '疲态' },
  { source: 'pve_longlv', target: '龙律' },
  { source: 'pve_jienu', target: '介怒' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>锁定技</b>，游戏开始时，你获得5枚“化神”标记。当你死亡时，你弃置手牌区及装备区所有牌，移去一枚“化神”标记，进入下一形态；若如此做，其它所有角色依次回复1点体力，摸一张牌，并从三名武将中选择一个，获得其一个技能。',
  },
  {
    source: 'pve_longlin_description',
    target: '<b>锁定技</b>，准备阶段开始时，你装备区域内每无一张牌，你摸两张牌；当你使用装备牌时，你摸三张牌。',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>锁定技</b>，准备阶段或结束阶段开始时，你摸X张牌（X为其他角色数）。',
  },
  {
    source: 'pve_longlv_description',
    target: '<b>锁定技</b>，一名角色结束阶段开始时，你与其各回复一点体力，回复前若你受伤，则当前回合角色失去体力上限一半体力，回复后若其未受伤，则你与其各摸1张牌。特殊情况下改变此技能效果。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>锁定技</b>，你成为其他角色锦囊牌目标后，你弃置其装备区内全部牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>锁定技</b>，当你每受到1点普通伤害后，你摸一张牌并将一张牌置于武将牌上，称为【碑】；摸牌阶段开始时，你摸2X张牌且本回合【杀】次数+X（X为【碑】数）',
  },
  {
    source: 'pve_jienu_description',
    target:
      '<b>锁定技</b>，当你翻面时，你回复一点体力并对所有其他角色造成两点火属性伤害；出牌阶段开始时或受到伤害后，若你体力小于已损失体力，则你翻面。',
  },
  {
    source: 'pve_longxian_description',
    target:
      '<b>锁定技</b>，你造成伤害改为增加等量体力（且能超过体力上限）；准备阶段开始时，其他角色当前体力调整为已损失体力值并摸一张牌。',
  },
  {
    source: 'pve_pitai_description',
    target:
      '<b>锁定技</b>，你跳过出牌阶段并增加一点体力上限(至多增加4)。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>锁定技</b>，你使用牌指定目标后，目标角色体力上限+1并受到已损失体力值伤害。',
  },
  {
    source: 'pve_longlie_description',
    target: '<b>锁定技</b>，你使用【杀】指定目标后，你令此【杀】无法被响应，且此【杀】伤害+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '请选择一个武将并获得其一个技能',
  },
];
