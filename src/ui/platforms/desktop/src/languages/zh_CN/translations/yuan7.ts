import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan7', target: '原7' },

  { source: 'jikang', target: '嵇康' },
  { source: 'qingxian', target: '清弦' },
  { source: 'juexiang', target: '绝响' },
  { source: 'jixian', target: '激弦' },
  { source: 'liexian', target: '烈弦' },
  { source: 'hexian', target: '和弦' },
  { source: 'rouxian', target: '柔弦' },

  { source: 'xushi', target: '徐氏' },
  { source: 'wengua', target: '问卦' },
  { source: '~side_wengua_s', target: '问卦' },
  { source: 'fuzhu', target: '伏诛' },

  { source: 'xuezong', target: '薛综' },
  { source: 'funan', target: '复难' },
  { source: 'funan_EX', target: '复难' },
  { source: 'jiexun', target: '诫训' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qingxian_description',
    target:
      '当你受到伤害/回复体力后，若场上没有角色处于濒死状态，你可以选择以下一项令伤害来源/一名其他角色执行：1.失去1点体力，随机使用牌堆里的一张装备牌；2.回复1点体力，随机弃置其一张装备牌。若其以此法使用或弃置的牌为梅花牌，你摸一张牌。',
  },
  {
    source: 'juexiang_description',
    target:
      '当你死亡时，你可以令一名其他角色随机获得“清弦残谱”中的一项技能，且直到其下个回合开始，其不能成为除其外使用梅花牌的目标。',
  },
  {
    source: 'jixian_description',
    target:
      '当你受到伤害后，若场上没有角色处于濒死状态，你可以令伤害来源失去1点体力，然后其随机使用牌堆里的一张装备牌。',
  },
  {
    source: 'liexian_description',
    target:
      '当你回复体力后，若场上没有角色处于濒死状态，你可以令一名其他角色失去1点体力，然后其随机使用牌堆里的一张装备牌。',
  },
  {
    source: 'rouxian_description',
    target: '当你受到伤害后，若场上没有角色处于濒死状态，你可以令伤害来源回复1点体力，然后其随机弃置其一张装备牌。',
  },
  {
    source: 'hexian_description',
    target: '当你回复体力后，若场上没有角色处于濒死状态，你可以令一名其他角色回复1点体力，然后其随机弃置其一张装备牌。',
  },

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

  {
    source: 'funan_description',
    target:
      '当其他角色使用或打出牌响应你使用的牌时，你可以令其获得你使用的牌（其于本回合内不能使用以此法获得的牌），然后你获得其使用或打出的牌。',
  },
  {
    source: 'funan_EX_description',
    target: '当其他角色使用或打出牌响应你使用的牌时，你可以获得此牌。',
  },
  {
    source: 'jiexun_description',
    target:
      '结束阶段开始时，你可以令一名其他角色摸X张牌（X为场上的方块牌数），然后弃置等同于你发动过本技能次数的牌。若其以此法弃置了所有的牌，你失去本技能，且你的技能“复难”改为无须令其获得你使用的牌。',
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
