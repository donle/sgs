import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'zhanghe', target: 'Zhang He' },
  { source: 'qiaobian', target: 'Flexibility' },

  { source: 'dengai', target: 'Deng Ai' },
  { source: 'tuntian', target: 'Amassing Field' },
  { source: 'zaoxian', target: 'Conduit' },
  { source: 'jixi', target: 'Blitz' },

  { source: 'jiangwei', target: 'Jiang Wei' },
  { source: 'tiaoxin', target: 'Provoke' },
  { source: 'zhiji', target: 'Carry out Behest' },

  { source: 'liushan', target: 'Liu Shan' },
  { source: 'xiangle', target: 'Indulged' },
  { source: 'fangquan', target: 'Devolution' },
  { source: 'ruoyu', target: 'Like Fool' },
  { source: 'sishu', target: 'Miss Shu' },

  { source: 'sunce', target: 'Sun Ce' },
  { source: 'jiang', target: 'Heated' },
  { source: 'hunzi', target: 'Divine Aura' },
  { source: 'zhiba', target: 'Hegemony' },
  { source: '~zhiba', target: 'Hegemony' },

  { source: 'zhangzhaozhanghong', target: 'Zhang Zhao & Zhang Hong' },
  { source: 'zhijian', target: 'Blunt Advice' },
  { source: 'guzheng', target: 'Stabilization' },

  { source: 'zuoci', target: 'Zuo Ci' },
  { source: 'huashen', target: 'Incarnation' },
  { source: 'xinsheng', target: 'Rebirth' },

  { source: 'caiwenji', target: 'Cai Wenji' },
  { source: 'beige', target: 'Dirge' },
  { source: 'duanchang', target: 'Sorrow' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'tuntian_description',
    target:
      'After you lose card outside your turn, you can perform a judgement, if the result is heart, you get the judge card, otherwise you place the judge card on you character card, face-up ("Field"). The distance from you to other player is reduced by X. (X = the amount of "Fields")',
  },
  {
    source: 'zaoxian_description',
    target:
      '<b>Awaken skill</b>, at the start of prepare phase, if you have 3 or 3+ "Fields", you lose 1 max HP and acquire the skill Blitz.',
  },
  { source: 'jixi_description', target: 'You can use a "Field" as Snatch.' },
  {
    source: 'qiaobian_description',
    target:
      'You can discard 1 hand card and skip a phase. If you use this skill to skip: draw phase, you can take 1 hand card from up to 2 players; play phase, you can move a card on the field.',
  },
  {
    source: 'tiaoxin_description',
    target:
      "Once per play phase, you can select a player who has you within his attack range, then ask him to use a Slash to you. If he didn't use Slash or that Slash didn't deal damage to you, you discard him 1 card, and this skill change to 'twice per play phase' in this phase.",
  },
  {
    source: 'zhiji_description',
    target:
      "<b>Awaken skill</b>, at the start of you prepare phase, if you don't have hand cards, you choose: 1. Draw 2 cards; 2. Heal 1 HP. Then you lose 1 max HP and acquire the skill Stargaze.",
  },
  {
    source: 'xiangle_description',
    target:
      '<b>Compulsory skill</b>, after a player uses Slash to target you, the user choose: 1. Discard 1 basic card; 2. This Slash has no effect on you.',
  },
  {
    source: 'fangquan_description',
    target:
      'You can skip your play phase, and at the start of discard phase in this turn, you discard 1 hand card and choose another player, he will play an extra turn when this turn over.',
  },
  {
    source: 'ruoyu_description',
    target:
      '<b>Lord skill, Awaken skill</b>, at the start of you prepare phase, if you have the least HP, you heal 1 max HP and heal 1 HP, then acquire the skills Rouse and Miss Shu.',
  },
  {
    source: 'sishu_description',
    target: 'At the start of play phase, you can make a player reverse his Indulgence judge result in this game.',
  },
  {
    source: 'jiang_description',
    target: 'After you target with/you are targeted by Duel or red Slash, you can draw 1 card.',
  },
  {
    source: 'hunzi_description',
    target:
      '<b>Awaken skill</b>, at the start of prepare phase, if you HP is not more than 2, you lose 1 max HP and acquire the skills Soul of Hero and Handsome.',
  },
  {
    source: 'zhiba_description',
    target:
      '<b>Lord skill</b>, once per play phase of another Wu character, he can point fight you (if you have activated you can refuse him), if he lose, you can take both cards.',
  },
  {
    source: 'zhijian_description',
    target:
      "During your play phase, you can place 1 on-hand equip card to another player's equip area, then draw 1 cards; when you use equip card in your play phase, you can draw 1 card.",
  },
  {
    source: 'guzheng_description',
    target:
      "At the end of another player's discard phase, you can give him 1 card that was discarded in this phase, then you can get the rest of discards.",
  },
  {
    source: 'beige_description',
    target:
      'After a player take damage from Slash, you can discard 1 card and let him perform a judgement, if the result is: heart, he heals X HP (X = the damage amount); diamond, he draws 3 cards; club, the damage source discard 2 cards; spade, the damage source turns over.',
  },
  {
    source: 'duanchang_description',
    target: '<b>Compulsory skill</b>, when you died, the killer loses all of his skills.',
  },
  {
    source: 'huashen_description',
    target:
      'At the start of the game, you pick 3 character cards randomly and place them on you character card, face-down ("Incarnation"), then you reveal 1 "Incarnation" and choose a skill on it to acquire (except Limited skill, Awaken skill, Lord skill, Duty skill and Lurk skill), then your gender and nationality are regarded as the same of this "Incarnation". At the start of your prepare phase or finish phase, you can choose: 1. Change your "Incarnation"; 2. Remove 1-2 not revealed "Incarnation" and get the same amount of new "Incarnation".',
  },
  { source: 'xinsheng_description', target: 'After you take 1 damage, you can get 1 new "Incarnation".' },
];

export const skillAudios: Word[] = [
  {
    source: '$qiaobian:1',
    target: '兵无常势，水无常形。',
  },
  {
    source: '$qiaobian:2',
    target: '用兵之道，变化万千。',
  },

  {
    source: '$tuntian:1',
    target: '休养生息，是为以备不虞！',
  },
  {
    source: '$tuntian:2',
    target: '战损难免，应以军务减之。',
  },
  {
    source: '$zaoxian:1',
    target: '用兵以险，则战之以胜！',
  },
  {
    source: '$zaoxian:2',
    target: '已至马阁山，宜速进军破蜀！',
  },
  {
    source: '$jixi:1',
    target: '攻敌之不备，斩将夺辎！',
  },
  {
    source: '$jixi:2',
    target: '奇兵正攻，敌何能为？',
  },

  {
    source: '$tiaoxin:1',
    target: '会闻用师，观衅而动。',
  },
  {
    source: '$tiaoxin:2',
    target: '宜乘其衅会，以挑敌将！',
  },
  {
    source: '$zhiji:1',
    target: '丞相遗志，不死不休！',
  },
  {
    source: '$zhiji:2',
    target: '大业未成，矢志不渝！',
  },
  {
    source: '$guanxing.jiangwei:1',
    target: '星象相衔，此乃吉兆。',
  },
  {
    source: '$guanxing.jiangwei:2',
    target: '星之分野，各有所属。',
  },

  {
    source: '$xiangle:1',
    target: '诶嘿嘿嘿，还是玩耍快乐~',
  },
  {
    source: '$xiangle:2',
    target: '美好的日子，应该好好享受。',
  },
  {
    source: '$fangquan:1',
    target: '蜀汉有相父在，我可安心。',
  },
  {
    source: '$fangquan:2',
    target: '这些事情，你们安排就好。',
  },
  {
    source: '$ruoyu:1',
    target: '若愚故泰，巧骗众人。',
  },
  {
    source: '$ruoyu:2',
    target: '愚昧者，非真傻也。',
  },
  {
    source: '$sishu:1',
    target: '蜀乐乡土，怎不思念？',
  },
  {
    source: '$sishu:2',
    target: '思乡心切，徘徊惶惶。',
  },

  {
    source: '$jiang:1',
    target: '我会把胜利，带回江东！',
  },
  {
    source: '$jiang:2',
    target: '天下英雄，谁能与我一战！',
  },
  {
    source: '$hunzi:1',
    target: '小霸王之名，响彻天下，何人不知！',
  },
  {
    source: '$hunzi:2',
    target: '江东已平，中原动荡，直取许昌！',
  },
  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },

  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },
  {
    source: '$zhiba:1',
    target: '我的霸业，才刚刚开始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是战是降，我皆奉陪。',
  },

  {
    source: '$zhijian:1',
    target: '为臣之道，在于直言不讳。',
  },
  {
    source: '$zhijian:2',
    target: '建言或逆耳，于国无一害。',
  },
  {
    source: '$guzheng:1',
    target: '为君者，不可私行土木，奢废物料。',
  },
  {
    source: '$guzheng:2',
    target: '安民固国，方可思栋。',
  },

  {
    source: '$huashen:1',
    target: '世间万物，贫道皆可化为其形。',
  },
  {
    source: '$huashen:2',
    target: '尘身土塑，唯魂魄难得。',
  },
  {
    source: '$xinsheng:1',
    target: '大成若缺，损亦无妨。',
  },
  {
    source: '$xinsheng:2',
    target: '大盈若冲，新神自现。',
  },

  {
    source: '$beige:1',
    target: '人多暴猛兮如虺蛇，控弦被甲兮为骄奢。',
  },
  {
    source: '$beige:2',
    target: '两拍张弦兮弦欲绝，志摧心折兮自悲嗟。',
  },
  {
    source: '$duanchang:1',
    target: '雁飞高兮邈难寻，空断肠兮思愔愔。',
  },
  {
    source: '$duanchang:2',
    target: '为天有眼兮，何不见我独漂流？',
  },
];

export const promptDictionary: Word[] = [
  {
    source: '{0}: do you want to drop a hand card to skip {1} ?',
    target: '{0}: do you want to discard a hand card to skip {1} ?',
  },
  // {
  //   source: '{0}: please choose one or two targets to obtain a hand card from each of them',
  //   target: '{0}：你可以选择一至两名其他角色，获得他们各一张手牌',
  // },
  {
    source: '{0}: do you want to move a card in the battlefield?',
    target: '{0}: do you want to move a card on the field?',
  },
];
