import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'xiahouyuan', target: 'Xiahou Yuan' },
  { source: 'shensu', target: 'Amazing Speed' },
  { source: 'shebian', target: 'Improvise' },

  { source: 'caoren', target: 'Cao ren' },
  { source: 'jushou', target: 'Fortified' },
  { source: 'jiewei', target: 'Lift the Siege' },
  { source: '#jiewei', target: 'Lift the Siege' },

  { source: 'huangzhong', target: 'Huang Zhong' },
  { source: 'liegong', target: 'Fearsome Archer' },
  { source: '#liegong', target: 'Fearsome Archer' },

  { source: 'weiyan', target: 'Wei Yan' },
  { source: 'kuanggu', target: 'Haughty Streak' },
  { source: 'qimou', target: 'Rare Plan' },

  { source: 'xiaoqiao', target: 'Xiao Qiao' },
  { source: 'tianxiang', target: 'Heavenly Scent' },
  { source: 'hongyan', target: 'Youthful Beauty' },
  { source: '#hongyan', target: 'Youthful Beauty' },
  { source: 'piaoling', target: 'Wither' },

  { source: 'zhoutai', target: 'Zhou Tai' },
  { source: 'buqu', target: 'Refusing Death' },
  { source: 'fenji', target: 'Exertion' },

  { source: 'zhangjiao', target: 'Zhang Jiao' },
  { source: 'leiji', target: 'Lighting Strike' },
  { source: '#leiji', target: 'Lighting Strike' },
  { source: 'guidao', target: 'Dark Sorcery' },
  { source: 'huangtian', target: 'Yellow Sky' },
  { source: '~huangtian', target: 'Yellow Sky' },

  { source: 'yuji', target: 'Yu Ji' },
  { source: 'guhuo', target: 'Demagogue' },
  { source: 'chanyuan', target: 'Spirit Haunt' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shensu_description',
    target:
      'You can choose up to 3 options: 1. Skip your judge phase and draw phase; 2. Skip your play phase and discard 1 equip card; 3. Skip your discard phase and turn over. Any of the options is regarded as using Slash with no distance limit.',
  },
  { source: 'shebian_description', target: 'After you turned over, you can move a equip card on the field.' },
  {
    source: 'jushou_description',
    target:
      'At the start of your finish phase, you can turn over and draw 4 cards; then, discard 1 hand card. If the card you discard is an equipment, you use it instead.',
  },
  {
    source: 'jiewei_description',
    target:
      'You can use cards in your equip area as Nullification. When you turn over to face up, you can discard 1 card, then move 1 card on the field.',
  },
  {
    source: 'liegong_description',
    target:
      "You can use Slash to target players at distance not more than the number of the Slash. After you use Slash to target a player, you can apply these effects: 1. If your hand cards is more than his, he can't use Jink; 2. If your HP is not more than his HP, the damage of this Slash is increased by +1.",
  },
  {
    source: 'kuanggu_description',
    target: 'After you cause 1 damage to a player at distance 1, you can choose: 1. heal 1 HP; 2. draw 1 card.',
  },
  {
    source: 'qimou_description',
    target:
      '<b>Limited skill</b>, during you play phase, you can lose any amount of HP and draw X card(s). Until this turn end, the distance from you to other players is reduced by X and you can use +X extra Slash. (X is the amount of HP you lost by this skill)',
  },
  {
    source: 'tianxiang_description',
    target:
      'When you are about to take damage, you can discard 1 heart card, prevent this damage and select another player to: 1. He takes 1 damage, then he draws X cards (X is his lost HP, max. 5); 2. He loses 1 HP, then he takes the card you discarded.',
  },
  {
    source: 'hongyan_description',
    target:
      '<b>Compulsory skill</b>, your spade cards are always regarded as heart cards; if there is any heart card in your equip area, your max card is equal to you max HP.',
  },
  {
    source: 'piaoling_description',
    target:
      'At the start of finish phase, you can perform a judgement, if the result is heart, you choose: 1. Give the judge card to a player, if you give it to yourself, you discard 1 card; 2. Place the judge card to the top of draw pile.',
  },
  {
    source: 'buqu_description',
    target:
      '<b>Compulsory skill</b>, when you are dying, you place a card at the top of draw pile to your character card, face-up ("Wound"). If its suit is not same as all your other "Wounds", you heal to 1 HP; otherwise, place it to discard pile. If you have "Wounds", your max card becomes the number of "Wounds" you have.',
  },
  {
    source: 'fenji_description',
    target:
      'When a player has hand cards taken/discarded by another player, you can lose 1 HP, then the player that lost hand cards draws 2 cards.',
  },
  {
    source: 'leiji_description',
    target:
      'When you use/play Jink or Lightning, you can perform a judgement. After your judge card takes effect, if the result is: spade, you can deal 2 Thunder damage to another player; club, you heal 1 HP, then you can deal 1 Thunder damage to another player.',
  },
  {
    source: 'guidao_description',
    target:
      'When a player performs a judgement, before it takes effect: you can play a black card to replace the judge card. If you played a spade 2-9 card, you draw 1 card then.',
  },
  {
    source: 'huangtian_description',
    target:
      '<b>Lord skill</b>, once per play phase of other Neutral characters, they can give you a Jink or a Lightning.',
  },
  {
    source: 'guhuo_description',
    target:
      'Once per turn, you can use/play a card face-down and declare it as any basic card or normal trick card; then all other players are asked whether they believe you. This card takes effect unless someone doubts you, in this case flip the card immediately: if is was fake, the card is useless, and all the disbelievers draw 1 card; if it was true, all the disbelievers choose discard 1 card or lose 1 HP, then they acquire the skill Spirit Haunt.',
  },
  {
    source: 'chanyuan_description',
    target:
      "<b>Compulsory skill</b>, you can't doubt Demagogue; if your HP is not more than 1, all of your other skills are invaild.",
  },
  {
    source: '#piaoling-select',
    target: 'Please choose: 1. Place judge card to the top of deck. 2. Give it to a player.',
  },
  {
    source: 'piaoling: select a player to obtain the judge card',
    target: 'Wither: please choose a player to take the judge card',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$shensu:1',
    target: '奔轶绝尘，不留踪影！',
  },
  {
    source: '$shensu:2',
    target: '健步如飞，破敌不备！',
  },
  {
    source: '$shebian:1',
    target: '设变力战，虏敌千万！',
  },
  {
    source: '$shebian:2',
    target: '随机应变，临机设变。',
  },

  {
    source: '$jushou:1',
    target: '坚守此地，不退半步。',
  },
  {
    source: '$jushou:2',
    target: '兵精粮足，守土一方。',
  },
  {
    source: '$jiewei:1',
    target: '化守为攻，出奇制胜！',
  },
  {
    source: '$jiewei:2',
    target: '坚壁清野，以挫敌锐！',
  },

  {
    source: '$liegong:1',
    target: '弓不离手，自有转机。',
  },
  {
    source: '$liegong:2',
    target: '箭阵开道，所向无敌！',
  },

  {
    source: '$kuanggu:1',
    target: '反骨狂傲，彰显本色！',
  },
  {
    source: '$kuanggu:2',
    target: '只有战场，能让我感到兴奋。',
  },
  {
    source: '$qimou:1',
    target: '为了胜利，可以出其不意。',
  },
  {
    source: '$qimou:2',
    target: '勇战不如奇谋。',
  },

  {
    source: '$tianxiang:1',
    target: '碧玉闺秀，只可远观。',
  },
  {
    source: '$tianxiang:2',
    target: '你岂会懂我的美丽？',
  },
  {
    source: '$hongyan:1',
    target: '红颜娇花好，折花门前盼。',
  },
  {
    source: '$hongyan:2',
    target: '我的容貌，让你心动了吗？',
  },
  {
    source: '$piaoling:1',
    target: '清风拂君，落花飘零。',
  },
  {
    source: '$piaoling:2',
    target: '花自飘零水自流。',
  },

  {
    source: '$buqu:1',
    target: '战如熊虎，不惜屈命。',
  },
  {
    source: '$buqu:2',
    target: '哼，这点小伤算什么！',
  },
  {
    source: '$fenji:1',
    target: '百战之身，奋勇趋前！',
  },
  {
    source: '$fenji:2',
    target: '两肋插刀，愿付此躯！',
  },

  {
    source: '$guhuo:1',
    target: '这牌，猜对了吗？',
  },
  {
    source: '$guhuo:2',
    target: '真真假假，虚实难测。',
  },

  {
    source: '$leiji:1',
    target: '疾雷迅电，不可趋避！',
  },
  {
    source: '$leiji:2',
    target: '雷霆之诛，灭军毁城！',
  },
  {
    source: '$guidao:1',
    target: '鬼道运行，由我把控！',
  },
  {
    source: '$guidao:2',
    target: '汝之命运，吾来改之！',
  },
  {
    source: '$huangtian:1',
    target: '黄天法力，万军可灭！',
  },
  {
    source: '$huangtian:2',
    target: '天书庇佑，黄巾可兴！',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose a target to deal {1} damage?',
    target: '{0}: please choose a target to deal {1} Thunder damage',
  },

  {
    source: '{0}: please choose a hand card, if it’s equipment, use it, otherwise drop it',
    target: "{0}: please choose a hand card, if it's equipment, use it, otherwise drop it",
  },
];
