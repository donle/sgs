import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'decade', target: '十周年' },

  { source: 'lijue', target: '李傕' },
  { source: 'langxi', target: '狼袭' },
  { source: 'yisuan', target: '亦算' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'langxi_description',
    target:
      '准备阶段开始时，你可以选择一名体力值不大于你的其他角色，你对其造成0~2点随机伤害。',
  },
  {
    source: 'yisuan_description',
    target:
      '每阶段限一次，当你于出牌阶段内使用普通锦囊牌结算结束后，你可以减1点体力上限，获得之。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
    target:
      '{0}；你可以对体力值不大于你的一名其他角色造成0~2点随机伤害',
  },

  {
    source: '{0}: do you want to lose a max hp to gain {1}?',
    target:
      '{0}；你可以减1点体力上限以获得 {1}',
  },
];
