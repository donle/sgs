import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'mobile', target: '手杀专属' },

  { source: 'simazhao', target: '司马昭' },
  { source: 'daigong', target: '怠攻' },
  { source: 'zhaoxin', target: '昭心' },

  { source: 'lifeng', target: '李丰' },
  { source: 'tunchu', target: '屯储' },
  { source: 'shuliang', target: '输粮' },

  { source: 'lingcao', target: '凌操' },
  { source: 'dujin', target: '独进' },

  { source: 'sunru', target: '孙茹' },
  { source: 'yingjian', target: '影箭' },
  { source: 'shixin', target: '释衅' },

  { source: 'xing_ganning', target: '星甘宁' },
  { source: 'jinfan', target: '锦帆' },
  { source: 'sheque', target: '射却' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'daigong_description',
    target:
      '每回合限一次，当你受到伤害时，你可以展示所有手牌并令伤害来源选择一项：1.交给你一张与你展示的所有牌花色均不同的牌；2.防止此伤害。',
  },
  {
    source: 'zhaoxin_description',
    target:
      '出牌阶段限一次，若X大于0，你可以将一至X张牌置于你的武将牌上，称为“望”，然后摸等量的牌（X为3减去你的“望”数之差）；你或在你攻击范围内的角色的摸牌阶段结束时，其可以获得你的一张“望”，然后你可以对其造成1点伤害。',
  },

  {
    source: 'tunchu_description',
    target:
      '摸牌阶段，若你没有“粮”，你可以多摸两张牌，然后你可以将至少一张手牌置于你的武将牌上，称为“粮”；若你有“粮”，你不能使用【杀】。',
  },
  {
    source: 'shuliang_description',
    target: '一名角色的结束阶段开始时，你可以移去一张“粮”，令其摸两张牌。',
  },

  {
    source: 'dujin_description',
    target: '摸牌阶段，你可以多摸X+1张牌（X为你装备区里牌数的一半，向下取整）。',
  },

  {
    source: 'yingjian_description',
    target: '准备阶段开始时，你可以视为使用一张无距离限制的【杀】。',
  },
  {
    source: 'shixin_description',
    target: '<b>锁定技</b>，当你受到火焰伤害时，防止之。',
  },

  {
    source: 'jinfan_description',
    target: '弃牌阶段开始时，你可以将至少一张花色各不相同，且与你的所有“铃”花色均不相同的手牌置于你的武将牌上，称为“铃”；你的“铃”可以如手牌般使用或打出；当你的一张“铃”移至其他区域后，你随机获得牌堆里一张花色相同的牌。',
  },
  {
    source: 'sheque_description',
    target: '其他角色的准备阶段开始时，若其装备区里有牌，你可以对其使用一张无视防具的【杀】。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to put at least 1 hand card on your general card as ‘liang’?',
    target: '{0}；你可以将至少一张手牌置为“粮”',
  },

  {
    source: '{0}: do you want to remove a ‘liang’ to let {1} draws 2 cards?',
    target: '{0}；你可以移去一张“粮”，令 {1} 摸两张牌',
  },

  {
    source: '{0}: you need to give a card to {1}, otherwise the damage to {1} will be terminated',
    target: '{0}；请交给 {1} 一张可选牌，否则将防止对 {1} 的伤害',
  },

  {
    source: '{0}: you can choose a card to gain. If you do this, {1} can deal 1 damage to you',
    target: '{0}；你可以获得其中一张牌。若如此做，{1} 可以对你造成1点伤害',
  },

  {
    source: '{0}: do you want to use a slash to {1} (this slash ignores armors)?',
    target: '{0}；你可以对 {1} 使用一张无视防具的【杀】',
  },
];
