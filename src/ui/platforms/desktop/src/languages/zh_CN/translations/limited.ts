import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'limited', target: '限定' },

  { source: 'caochun', target: '曹纯' },
  { source: 'shanjia', target: '缮甲' },
  { source: 'shanjia count: {0}', target: '缮甲[{0}]' },

  { source: 'jianggan', target: '蒋干' },
  { source: 'weicheng', target: '伪诚' },
  { source: 'daoshu', target: '盗书' },

  { source: 'ruanyu', target: '阮瑀' },
  { source: 'xingzuo', target: '兴作' },
  { source: 'miaoxian', target: '妙弦' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shanjia_description',
    target:
      '出牌阶段开始时，你可以摸三张牌，然后弃置三张牌（本局游戏内你每不因使用而失去一张装备牌，便少弃置一张牌）。若你未以此法弃置非装备牌，你可视为使用一张无距离限制的【杀】。',
  },

  {
    source: 'weicheng_description',
    target: '当其他角色获得你的手牌，或你交给其他角色你的手牌后，若你的手牌数小于体力值，你可以摸一张牌。',
  },
  {
    source: 'daoshu_description',
    target:
      '出牌阶段，你可以声明一种花色并获得一名其他角色的一张手牌，若此牌与你声明的花色：相同，你对其造成1点伤害；不同，你交给其一张不为你以此法获得的牌花色的手牌（若无法给出，则改为展示所有手牌），且此技能于本回合内失效。',
  },

  {
    source: 'xingzuo_description',
    target:
      '出牌阶段开始时，你可以观看牌堆底三张牌，然后你可以用至少一张手牌交换其中等量的牌。若你交换了牌，你于本回合的结束阶段开始时，令一名有手牌的角色将所有手牌与牌堆底三张牌交换。',
  },
  {
    source: 'miaoxian_description',
    target:
      '若你的手牌中仅有一张：黑色牌，你可以将此牌当任意普通锦囊牌使用（每回合限一次）；红色牌，你使用此牌时摸一张牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}: 请弃置 {1} 张牌，若弃牌中均为装备牌，则可视为使用一张无距离限制的【杀】',
  },
  {
    source: 'shanjia: do you want to use a slash?',
    target: '缮甲：你可以视为使用一张【杀】（无距离限制）',
  },

  {
    source: '{0}: please choose a card suit',
    target: '{0}: 请选择一种花色',
  },
  {
    source: '{0}: please give {1} a hand card except the card with suit {2}',
    target: '{0}: 请交给 {1} 一张非{2}手牌',
  },

  {
    source: 'the bottom of draw stack',
    target: '牌堆底的牌',
  },
  {
    source: 'xingzuo: please select cards to put on draw stack bottom',
    target: '兴作：请选择其中三张牌作为牌堆底的牌',
  },
  {
    source: '{0}: do you want to choose a target to exchange hand cards with draw stack bottom?',
    target: '{0}：你可以令一名有牌的角色将所有手牌与牌堆底三张牌交换',
  },
];
