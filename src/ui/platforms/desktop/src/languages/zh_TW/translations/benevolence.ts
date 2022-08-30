import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'benevolence', target: '仁包' },

  { source: 'ren_xujing', target: '仁许靖' },
  { source: 'boming', target: '博名' },
  { source: '#boming', target: '博名（摸牌）' },
  { source: 'ejian', target: '恶荐' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'boming_description',
    target:
      '出牌阶段限两次，你可以将一张牌交给一名其他角色，若此为你于此阶段内以此法给出的第二张牌，你于本回合的下个结束阶段开始时摸一张牌。',
  },
  {
    source: 'ejian_description',
    target:
      '<b>锁定技</b>，当其他角色因“博名”而获得牌后，若其有与此牌类别相同的其他牌，其选择一项：1.受到1点伤害；2.展示所有手牌，然后弃置其中所有与此牌类别相同的牌。',
  },
];

export const skillAudios: Word[] = [];

export const promptDescriptions: Word[] = [];
