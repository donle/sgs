import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan6', target: '原6' },

  { source: 'zhangrang', target: '张让' },
  { source: 'taoluan', target: '滔乱' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'taoluan_description',
    target: '你可以将一张牌当任意基本牌或普通锦囊牌（不能为你于本局游戏内以此法使用过的牌）使用，然后你令一名其他角色选择一项：1.交给你一张与你以此法使用的牌类别不同的牌；2.令你失去1点体力，且本技能于本回合内失效。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$huituo:1',
    target: '大展宏图，就在今日！',
  },
  {
    source: '$huituo:2',
    target: '富我大魏，扬我国威！',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'taoluan: please choose another player to ask for a card',
    target: '滔乱：请选择一名其他角色，令其选择是否交给你牌',
  },
  {
    source: '{0}: please give a card to {1}, or he/she will lose 1 hp',
    target: '{0}：你可以交给 {1} 一张符合条件的牌，否则其会失去1点体力，且“滔乱”于本回合内失效',
  },
]
