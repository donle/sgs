import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'limited', target: '限定' },

  { source: 'caochun', target: '曹純' },
  { source: 'shanjia', target: '繕甲' },
  { source: 'shanjia count: {0}', target: '繕甲[{0}]' },

  { source: 'jianggan', target: '蔣幹' },
  { source: 'weicheng', target: '偽誠' },
  { source: 'daoshu', target: '盜書' },

  { source: 'ruanyu', target: '阮瑀' },
  { source: 'xingzuo', target: '興作' },
  { source: 'miaoxian', target: '妙弦' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shanjia_description',
    target:
      '出牌階段開始時，你可以摸三張牌，然後棄置三張牌（本局遊戲內你每不因使用而失去一張裝備牌，便少棄置一張牌）。若你未以此法棄置非裝備牌，你可視為使用一張無距離限制的【殺】。',
  },

  {
    source: 'weicheng_description',
    target: '當其他角色獲得你的手牌，或你交給其他角色你的手牌後，若你的手牌數小於體力值，你可以摸一張牌。',
  },
  {
    source: 'daoshu_description',
    target:
      '出牌階段，你可以宣告一種花色並獲得一名其他角色的一張手牌，若此牌與你宣告的花色：相同，你對其造成1點傷害；不同，你交給其一張不為你以此法獲得的牌花色的手牌（若無法給出，則改為展示所有手牌），且此技能於本回合內失效。',
  },

  {
    source: 'xingzuo_description',
    target:
      '出牌階段開始時，你可以觀看牌堆底三張牌，然後你可以用至少一張手牌交換其中等量的牌。若你交換了牌，你於本回合的結束階段開始時，令一名有手牌的角色將所有手牌與牌堆底三張牌交換，若以此法置於牌堆底的牌數大於三張，你失去1點體力。',
  },
  {
    source: 'miaoxian_description',
    target:
      '若你的手牌中僅有一張：黑色牌，你可以將此牌當任意普通錦囊牌使用（每回合限一次）；紅色牌，你使用此牌時摸一張牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}: 請棄置 {1} 張牌，若棄牌中均為裝備牌，則可視為使用一張無距離限制的【殺】',
  },
  {
    source: 'shanjia: do you want to use a slash?',
    target: '繕甲：你可以視為使用一張【殺】（無距離限制）',
  },

  {
    source: '{0}: please choose a card suit',
    target: '{0}: 請選擇一種花色',
  },
  {
    source: '{0}: please give {1} a hand card except the card with suit {2}',
    target: '{0}: 請交給 {1} 一張非{2}手牌',
  },

  {
    source: 'the bottom of draw stack',
    target: '牌堆底的牌',
  },
  {
    source: 'xingzuo: please select cards to put on draw stack bottom',
    target: '興作：請選擇其中三張牌作為牌堆底的牌',
  },
  {
    source: '{0}: do you want to choose a target to exchange hand cards with draw stack bottom?',
    target: '{0}：你可以令一名有牌的角色將所有手牌與牌堆底三張牌交換',
  },
];
