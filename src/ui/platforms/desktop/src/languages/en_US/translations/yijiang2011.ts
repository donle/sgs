import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2011', target: 'YJ2011' },

  { source: 'caozhi', target: 'Cao Zhi' },
  { source: 'luoying', target: 'Falling Bloom' },
  { source: 'jiushi', target: 'Drunken Quatrain' },
  { source: '#jiushi', target: 'Drunken Quatrain' },
  { source: 'chengzhang', target: 'Turn Out Poetry' },

  { source: 'yujin', target: 'Yu Jin' },
  { source: 'jieyue', target: 'Tally' },

  { source: 'zhangchunhua', target: 'Zhang Chunhua' },
  { source: 'jueqing', target: 'Ruthless' },
  { source: 'shangshi', target: 'Bereavement' },

  { source: 'masu', target: 'Ma Su' },
  { source: 'sanyao', target: 'Rumor' },
  { source: 'zhiman', target: 'Subdue Savage' },

  { source: 'fazheng', target: 'Fa Zheng' },
  { source: 'enyuan', target: 'Gratitude and Grudge' },
  { source: 'xuanhuo', target: 'Artifice of the Masses' },

  { source: 'xushu', target: 'Xu Shu' },
  { source: 'wuyan', target: 'Silence' },
  { source: 'jujian', target: 'Recommendation' },

  { source: 'wuguotai', target: 'Wu Guo Tai' },
  { source: 'ganlu', target: 'Amrita' },
  { source: 'buyi', target: 'Ameliorate' },

  { source: 'xusheng', target: 'Xu Sheng' },
  { source: 'pojun', target: 'Annihilate' },

  { source: 'lingtong', target: 'Ling Tong' },
  { source: 'xuanfeng', target: 'Tempest' },
  { source: 'yongjin', target: 'Bravely Rush' },

  { source: 'chengong', target: 'Chen Gong' },
  { source: 'mingce', target: 'Brilliant Scheme' },
  { source: 'zhichi', target: 'Slow Wisdom' },

  { source: 'gaoshun', target: 'Gao Shun' },
  { source: 'xianzhen', target: 'Ambush' },
  { source: '#####xianzhen', target: 'Ambush' },
  { source: 'jinjiu', target: 'Prohibit Alcohol' },
  { source: 'xianzhen target: {0}', target: 'Ambush:{0}' },
  { source: 'xianzhen_lose', target: 'Ambush[Lose]' },

  { source: 'std_xuanfeng', target: 'Tempest' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'luoying_description',
    target:
      "After another player's club cards enter discard pile as a result of discard or judgement, you can take as least 1 of them.",
  },
  {
    source: 'jiushi_description',
    target:
      'LV1: When you need to use Alcohol, if your character card is face up, you can turn over, this is regarded as you use 1 Alcohol.After you take damage, if you are face down, you can turn over and get 1 random trick card from the deck. <br />LV2: When you need to use Alcohol, if your character card is face up, you can turn over, this is regarded as you use 1 Alcohol.After you take damage, if you are face down, you can turn over. When you turn over, you get 1 random trick card from the deck.',
  },
  {
    source: 'chengzhang_description',
    target:
      '<b>Awaken skill</b>, at the start of you prepare phase, if the amount of damage you have dealt/taken is not fewer than 7, you heal 1 HP and draw 1 card, then upgrade Drunken Quatrain.',
  },
  {
    source: 'jieyue_description',
    target:
      'At the start of finish phase, you can give 1 card to another player, then he chooses: 1. Keep 1 hand card and 1 equipped card, discard other cards; 2. You draw 3 cards.',
  },

  {
    source: 'jueqing_description',
    target: '<b>Compulsory skill</b>, all the damage your are about to cause are regarded as loss of HP.',
  },
  {
    source: 'shangshi_description',
    target: 'When you hand cards is fewer than X, you can draw cards until you have X hand cards. (X = your lost HP)',
  },

  {
    source: 'sanyao_description',
    target:
      'During your play phase, you can discard 1 card and choose: 1. Choose 1 player whose HP is the highest; 2. Choose 1 player whose amount of hand cards is the most. You deal 1 damage to the player you have chosen. Every option can only be chose once in this phase.',
  },
  {
    source: 'zhiman_description',
    target:
      'When you deal damage to another player, you can prevent the damage, then take 1 card in one of the areas of the target player.',
  },

  {
    source: 'enyuan_description',
    target:
      'After you take 1 damage, you can let the damage source choose: 1. Give you 1 hand card, if its suit is not heart, you draw 1 card; 2. Lose 1 HP. When you get cards from another player, if the amount of cards is not fewer than 2, you can let him draw 1 card.',
  },
  {
    source: 'xuanhuo_description',
    target:
      'After your draw phase, you can give 2 hand cards to another player, then choose an other another player, the former chooses: 1. He is regarded as use a Slash or Duel to the latter; 2. He gives all of his hand cards to you.',
  },

  {
    source: 'wuyan_description',
    target: '<b>Compulsory skill</b>, when you deal/take damage with/by trick cards, the damage is prevented.',
  },
  {
    source: 'jujian_description',
    target:
      'At the start of finish phase, you can discard 1 non-basic card and choose another player, he chooses: 1. Heal 1 HP; 2. Draw 2 cards; 3: Reset his character card.',
  },

  {
    source: 'pojun_description',
    target:
      'After you use Slash target to player, you can place up to X cards on his character card, face-down (X = his HP), he gets the cards when this turn is over; When you deal damage to player whose hand cards and equipped cards are all not more than you with Slash, the damage is increased by +1.',
  },

  {
    source: 'ganlu_description',
    target:
      'Once per play phase, you can choose: 1. Select 2 players whose difference in the amount of cards in the equipment area is not more than your lost HP, they exchange their cards in the equipment area; 2. You exchange the cards in the equipment area with another player.',
  },
  {
    source: 'buyi_description',
    target:
      "When a player is dying, you can display 1 of his hand cards, if it isn't a basic card, he discards it and heals 1 HP.",
  },

  {
    source: 'xuanfeng_description',
    target:
      'After you discard 2+ cards in your discard phase, or after you lose card in your equipment area, you can discard 1-2 cards from another players, if this happens in your turn, you can deal 1 damage to one of them.',
  },
  {
    source: 'yongjin_description',
    target:
      '<b>Limited Skill</b>, during your play phase, you can move 1~3 different equip cards on the field successively.',
  },

  {
    source: 'mingce_description',
    target:
      'Once per turn, you can give a Slash or equip card to another player, then he choose: 1. He is regarded as using Slash on another player of your choice within his attack rage; 2. Draw 1 card.',
  },
  {
    source: 'zhichi_description',
    target:
      '<b>Compulsory skill</b>, after you take damage outside of your turn, Slash and normal trick cards have no effect on you for the rest of this turn.',
  },

  {
    source: 'xianzhen_description',
    target:
      'Once per play phase, you can point fight another player, if you win, until the end of this phase, you disregard his armor, and you can use card to him with no distance limit and no use time limit, when you use Slash or normal trick card to an only target, you can make him as the extra target; if you lose, you can not use Slash for the rest of turn, and your Slash are not counted to you max card in this turn.',
  },
  {
    source: 'jinjiu_description',
    target: '<b>Compulsory skill</b>, your Alcohol are regarded as Slash.',
  },

  {
    source: 'std_xuanfeng_description',
    target:
      'After you discard 2+ cards in your discard phase, or after you lose card in your equipment area, you can discard 1-2 cards from another players.',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}: You need to give 1 handcard to {1}, or lose 1 HP',
  },

  { source: 'xuanhuo:attack', target: 'Option 1' },
  { source: 'xuanhuo:give', target: 'Option 2' },
  {
    source: '{0}: please choose xuanhuo options: {1} {2}',
    target: '{0}: 1. Regard as use a Slash or Duel to {1}; 2. Give all hand cards to {2}',
  },
  {
    source: '{0}: please choose xuanhuo attack options: {1}',
    target: '{0}: Please choose the card to use to {1}',
  },

  {
    source: 'please choose sanyao options',
    target: 'Rumor: Please choose',
  },
  { source: 'sanyao:hp', target: 'HP' },
  { source: 'sanyao:handNum', target: 'Hand cards' },

  {
    source: '{0}: do you want to prevent the damage to {1} to pick one card in areas?',
    target: '{0}: You can prevent the damage to {1}, and take his card',
  },

  // {
  //   source: '{0} triggered skill {1}, prevent the damage of {2}',
  //   target: '{0} 触发了技能 {1} ，防止了 {2} 造成的伤害',
  // },
  // {
  //   source: '{0}: do you want to drop a card except basic card and choose a target',
  //   target: '{0}：你可以弃置一张非基本牌并选择一名其他角色，其选择摸牌、回血或复原',
  // },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}: You can discard 1 non-basic card and choose another player, he chooses draw card, heal or reset',
  },
  { source: 'jujian:draw', target: 'Draw 2 cards' },
  { source: 'jujian:recover', target: 'Heal 1 HP' },
  { source: 'jujian:restore', target: 'Reset character card' },

  {
    source: '{0}: please choose a target who {1} can use slash to',
    target: "{0}: Please choose a player within {1}'s attack range as the target of Slash",
  },

  {
    source: 'please choose mingce options:{0}',
    target: 'Brilliant Scheme: 1. Regard as use Slash to {0}; 2. Draw 1 card',
  },
  { source: 'mingce:slash', target: 'Regard as use Slash' },
  { source: 'mingce:draw', target: 'Draw 1 card' },

  {
    source: 'jieyue: please choose jieyue options',
    target: '{0}: 1. Keep 1 hand card and 1 equipped card, discard other cards; 2. Let {1} draw 3 cards.',
  },

  {
    source: '{0}: do you want to reveal a hand card from {1} ?',
    target: "{0}: You can show 1 of {1}'s hand cards, if it is not basic card, he discard it and heal 1 HP",
  },
  {
    source: 'xianzhen: do you want to add {0} as targets of {1}?',
    target: 'Ambush: You can add {0} to the targets of {1}',
  },

  {
    source: '{0}: do you want to choose a target to drop a card?',
    target: '{0}: You can discard 1 card from a player now',
  },
  {
    source: '{0}: do you want to choose a XuanFeng target to deal 1 damage?',
    target: '{0}: You can deal 1 damage to one of them',
  },

  {
    source: '{0}: please choose two target to move their equipment',
    target: '{0}: Please choose 2 players, move 1 equipment from the former to the latter',
  },

  // {
  //   source: '{0}: do you want to draw {1} cards?',
  //   target: '{0}: 是否摸 {1} 张牌?',
  // },
];

export const skillAudios: Word[] = [
  {
    source: '$luoying:1',
    target: '五月繁花落，怀愁不同秋。',
  },
  {
    source: '$luoying:2',
    target: '惊风飘白日，光景驰西流。',
  },

  {
    source: '$jiushi:1',
    target: '德祖箪杯酒，吾亦醉抚琴。',
  },
  {
    source: '$jiushi:2',
    target: '利剑不在掌，结友何须多。',
  },

  {
    source: '$chengzhang:1',
    target: '妙笔趁酒兴，文章尽自成。',
  },

  {
    source: '$jieyue:1',
    target: '敌人虚张声势，我且将计就计！',
  },
  {
    source: '$jieyue:2',
    target: '舍，然后才有得。',
  },

  {
    source: '$jueqing:1',
    target: '博弈此生，终至无情。',
  },
  {
    source: '$jueqing:2',
    target: '此情已逝，故来决绝！',
  },
  {
    source: '$shangshi:1',
    target: '情随伤而逝，恨随痛而至！',
  },
  {
    source: '$shangshi:2',
    target: '春华已老红颜去，此恨绵绵无绝期。',
  },

  {
    source: '$sanyao:1',
    target: '可曾听说，人言可畏？',
  },
  {
    source: '$sanyao:2',
    target: '丞相谋略，吾已习得八九。',
  },
  {
    source: '$zhiman:1',
    target: '巧力胜于蛮力。',
  },
  {
    source: '$zhiman:2',
    target: '取你一件东西使使。',
  },

  {
    source: '$enyuan:1',
    target: '善因得善果，恶因得恶报。',
  },
  {
    source: '$enyuan:2',
    target: '私我者赠之琼瑶，厌我者报之斧钺。',
  },
  {
    source: '$xuanhuo:1',
    target: '光以眩目，言以惑人。',
  },
  {
    source: '$xuanhuo:2',
    target: '我法孝直如何会害你？',
  },

  {
    source: '$wuyan:1',
    target: '不忠不孝之人，不敢开口。',
  },
  {
    source: '$wuyan:2',
    target: '别跟我说话！我想静静。',
  },
  {
    source: '$jujian:1',
    target: '大贤不可屈就，将军须当亲往。',
  },
  {
    source: '$jujian:2',
    target: '大汉中兴，皆系此人！',
  },

  {
    source: '$ganlu:1',
    target: '玄德实乃佳婿啊。',
  },
  {
    source: '$ganlu:2',
    target: '好一个郎才女貌，真是天作之合啊。',
  },
  {
    source: '$buyi:1',
    target: '有我在，定保贤婿无虞！',
  },
  {
    source: '$buyi:2',
    target: '东吴，岂容汝等儿戏！',
  },

  {
    source: '$pojun:1',
    target: '犯大吴疆土者，盛必击而破之！',
  },
  {
    source: '$pojun:2',
    target: '若敢来犯，必叫你大败而归！',
  },

  {
    source: '$xuanfeng:1',
    target: '风袭千里，片甲不留！',
  },
  {
    source: '$xuanfeng:2',
    target: '凌风逐敌，横扫千军！',
  },
  {
    source: '$yongjin:1',
    target: '勇力载舟，长浪奋进！',
  },
  {
    source: '$yongjin:2',
    target: '以勇拒曹刘，气吞万里如虎！',
  },

  {
    source: '$mingce:1',
    target: '如此，霸业可图也。',
  },
  {
    source: '$mingce:2',
    target: '如此，一击可擒也。',
  },
  {
    source: '$zhichi:1',
    target: '若吾早知如此。',
  },
  {
    source: '$zhichi:2',
    target: '如今之计，唯有退守，再做决断。',
  },

  {
    source: '$xianzhen:1',
    target: '攻无不克，战无不胜！',
  },
  {
    source: '$xianzhen:2',
    target: '破阵斩将，易如反掌！',
  },
  {
    source: '$jinjiu:1',
    target: '避嫌远疑，所以无误。',
  },
  {
    source: '$jinjiu:2',
    target: '贬酒阙色，所以无污。',
  },
];
