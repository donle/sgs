import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan6', target: '原7' },

  { source: 'xushi', target: '徐氏' },
  { source: 'wengua', target: '问卦' },
  { source: 'side_wengua_s', target: '问卦' },
  { source: 'fuzhu', target: '伏诛' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'wengua_description',
    target:
      '一名角色的出牌阶段限一次，若该角色：为你，你可以将一张牌置于牌堆顶或牌堆底，然后你从牌堆的另一端摸一张牌；不为你，其可将一张牌交给你，然后你可将此牌置于牌堆顶或牌堆底，且你与其从牌堆的另一端各摸一张牌。',
  },
  {
    source: 'side_wengua_s_description',
    target:
      '出牌阶段限一次，你可以将一张牌交给一名拥有技能“问卦”的其他角色，然后其可将此牌置于牌堆顶或牌堆底，且你与其从牌堆的另一端各摸一张牌。',
  },
  {
    source: 'fuzhu_description',
    target:
      '男性角色的结束阶段开始时，若牌堆的牌数不大于你的体力值的十倍，你可以对其使用牌堆中的第一张【杀】，然后若其未死亡或你于此流程中以此法使用【杀】的数量不大于游戏人数，你重复此流程。最后你洗牌。',
  },
];

export const skillAudios: Word[] = [];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose wengua options: {1}',
    target: '{0}：请选择将 {1} 置于牌堆顶或牌堆底，然后你从牌堆另一端摸一张牌',
  },
  { source: 'wengua:top', target: '置于牌堆顶' },
  { source: 'wengua:bottom', target: '置于牌堆底' },
  {
    source: '{0}: do you want to use this skill for {1}: {2}',
    target: '{0}：你是否要将 {2} 置于牌堆顶或牌堆底，然后你与 {1} 从牌堆另一端各摸一张牌',
  },
  {
    source: '{0}: please choose wengua options: {1} {2}',
    target: '{0}：请选择将 {1} 置于牌堆顶或牌堆底，然后你与 {2} 从牌堆另一端摸一张牌',
  },
];
