import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan6', target: '原6' },

  { source: 'sunziliufang', target: '孙资刘放' },
  { source: 'guizao', target: '瑰藻' },
  { source: 'jiyu', target: '讥谀' },

  { source: 'liyan', target: '李严' },
  { source: 'duliang', target: '督粮' },
  { source: 'fulin', target: '腹鳞' },

  { source: 'sundeng', target: '孙登' },
  { source: 'kuangbi', target: '匡弼' },

  { source: 'cenhun', target: '岑昏' },
  { source: 'jishe', target: '极奢' },
  { source: '#jishe', target: '极奢' },
  { source: 'lianhuo', target: '链祸' },

  { source: 'zhangrang', target: '张让' },
  { source: 'taoluan', target: '滔乱' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'guizao_description',
    target:
      '弃牌阶段结束时，若你于此阶段内因规则弃牌而弃置的牌数大于1，且这些牌的花色各不相同，你可以摸一张牌或回复1点体力。',
  },
  {
    source: 'jiyu_description',
    target:
      '出牌阶段，若你有可以使用的手牌，你可以令一名有手牌的角色弃置一张手牌，然后你于此阶段内不能再使用与其弃置的牌花色相同的手牌。若其以此法弃置的牌的花色为黑桃，你翻面，其失去1点体力。',
  },

  {
    source: 'duliang_description',
    target:
      '出牌阶段限一次，你可以获得一名其他角色的一张手牌，然后选择一项：1.令其观看牌堆顶两张牌，然后其获得其中的基本牌；2.令其于其下个摸牌阶段多摸一张牌。',
  },
  {
    source: 'fulin_description',
    target: '<b>锁定技</b>，你于本回合内获得的牌不计入你的手牌上限。',
  },

  {
    source: 'kuangbi_description',
    target:
      '出牌阶段限一次，你可以令一名有牌的其他角色将一至三张牌扣置于你的武将牌上，称为“弼”。若如此做，你的下个准备阶段开始时，你获得这些“弼”，其摸等量的牌。',
  },

  {
    source: 'jishe_description',
    target: '出牌阶段，若你的手牌上限大于0，你可以摸一张牌，然后你的手牌上限于本回合内-1。',
  },
  {
    source: 'lianhuo_description',
    target: '<b>锁定技</b>，当你受到不为连环伤害的火焰伤害时，若你处于连环状态，此伤害+1。',
  },

  {
    source: 'taoluan_description',
    target:
      '你可以将一张牌当任意基本牌或普通锦囊牌（不能为你于本局游戏内以此法使用过的牌）使用，然后你令一名其他角色选择一项：1.交给你一张与你以此法使用的牌类别不同的牌；2.令你失去1点体力，且本技能于本回合内失效。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$taoluan:1',
    target: '国家承平，神器稳固，陛下勿忧。',
  },
  {
    source: '$taoluan:2',
    target: '睁开你的眼睛看看，现在是谁说了算？',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please put at least 1 and less than 3 cards onto {1} ’s general card as ‘bi’',
    target: '{0}：请将一至三张牌置为 {1} 的“弼”',
  },

  {
    source: 'taoluan: please choose another player to ask for a card',
    target: '滔乱：请选择一名其他角色，令其选择是否交给你牌',
  },
  {
    source: '{0}: please give a card to {1}, or he/she will lose 1 hp',
    target: '{0}：你可以交给 {1} 一张符合条件的牌，否则其会失去1点体力，且“滔乱”于本回合内失效',
  },
];
