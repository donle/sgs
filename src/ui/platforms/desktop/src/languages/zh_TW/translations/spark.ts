import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'spark', target: '星火燎原' },

  { source: 'liuyan', target: '刘焉' },
  { source: 'tushe', target: '图射' },
  { source: 'limu', target: '立牧' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'tushe_description',
    target: '当你使用非装备牌指定第一个目标后，若你的手牌中没有基本牌，你可以摸X张牌（X为目标数）。',
  },
  {
    source: 'limu_description',
    target: '出牌阶段，你可以将一张方块牌当【乐不思蜀】对自己使用，然后回复1点体力；若你的判定区有牌，你对攻击范围内的角色使用牌无距离和次数限制。',
  },
];

export const promptDescriptions: Word[] = [];
