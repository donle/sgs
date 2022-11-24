import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'dianwei', target: 'Dian Wei' },
  { source: 'qiangxi', target: 'Ferocious Assault' },

  { source: 'xunyu', target: 'Xun Yu' },
  { source: 'quhu', target: 'Rouse the Tiger' },
  { source: 'jieming', target: 'Eternal Loyalty' },

  { source: 'pangtong', target: 'Pang Tong' },
  { source: 'lianhuan', target: 'Chaining' },
  { source: 'niepan', target: 'Nirvana' },

  { source: 'wolong', target: 'Young Zhuge Liang' },
  { source: 'bazhen', target: 'Eight Diagram' },
  { source: 'huoji', target: 'Arson Tactic' },
  { source: 'kanpo', target: 'See Through' },
  { source: 'cangzhuo', target: 'Hide Defect' },

  { source: 'taishici', target: 'Taishi Ci' },
  { source: 'tianyi', target: 'Justice of Heaven' },
  { source: 'tianyi_win', target: 'Justice of Heaven[Win]' },
  { source: 'tianyi_lose', target: 'Justice of Heaven[Not win]' },
  { source: 'hanzhan', target: 'Pitched Battle' },

  { source: 'pangde', target: 'Pang De' },
  { source: 'jianchu', target: 'Sudden Attack' },

  { source: 'yanliangwenchou', target: 'Yan Liang & Wen Chou' },
  { source: 'shuangxiong', target: 'Dual Heroes' },
  { source: '#shuangxiong', target: 'Dual Heroes' },
  { source: 'shuangxiong_red', target: 'Dual Heroes[non red]' },
  { source: 'shuangxiong_black', target: 'Dual Heroes[non black]' },

  { source: 'yuanshao', target: 'Yuan Shao' },
  { source: 'luanji', target: 'Chaos Archery' },
  { source: '#luanji', target: 'Chaos Archery' },
  { source: 'xueyi', target: 'Bloodline' },
  { source: '#xueyi', target: 'Bloodline' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qiangxi_description',
    target:
      "Twice per play phase, you can lose 1 HP or discard 1 weapon, and deal 1 damage to another player who didn't be chose by this skill in this turn.",
  },
  {
    source: 'quhu_description',
    target:
      'Once per play phase, you can point fight another player whose HP is higher than yours, if you win, he deals 1 damage to another player of your choice within his attack range; if you lose, he deals 1 damage to you.',
  },
  {
    source: 'jieming_description',
    target:
      'After you take 1 damage, you can let a player draw 2 cards, then if his hand cards is fewer than his max HP, you draw 1 card.',
  },
  {
    source: 'lianhuan_description',
    target: 'You can use club hand card as Iron Chain; your Iron Chain can target to +1 extra player.',
  },
  {
    source: 'niepan_description',
    target:
      '<b>Limited skill</b>, when you are dying, you can discard all of your cards, reset your character card, then draw 3 cards and heal to 3 HP. Then you choose to acquire a skill: Eight Diagram, Arson Tactic, See Through.',
  },
  {
    source: 'bazhen_description',
    target:
      "<b>Compulsory skill</b>, If you don't have any armor equipped, you are regarded as having Eight Diagram equipped.",
  },
  { source: 'huoji_description', target: 'You can use red cards as Fire Attack.' },
  { source: 'kanpo_description', target: 'You can use black cards as Nullification.' },
  {
    source: 'cangzhuo_description',
    target:
      "<b>Compulsory skill</b>, at the start of discard phase, if you haven't use any trick card in this turn, your trick cards are not counted to you max card in this turn.",
  },
  {
    source: 'tianyi_description',
    target:
      "Once per play phase, you can point fight with another player, if you win, until the end of the turn, your Slash have no distance limit, you can use +1 extra Slash, and your Slash can target to +1 extra player; if you lose, you can't use Slash for the rest of this turn.",
  },
  {
    source: 'hanzhan_description',
    target:
      'When you point fight with other players, you can make your opponent use his random hand card for point fight; after you point fight, you can take the Slash of the biggest number in the point fight cards.',
  },
  {
    source: 'jianchu_description',
    target:
      "After you use Slash to target a player, you can discard him 1 card, if the discarded card is: not basic card, he can't use Jink, you can use +1 extra Slash this turn; basic card, he take the Slash you just used.",
  },
  {
    source: 'shuangxiong_description',
    target:
      'During you draw phase, you can change to perform a judgement; you get the judge result card, and in this turn you can use any card with a different color from the judge result as Duel; after you take damage by the Duel of this skill, you can take all the Slash you opponent played in this Duel.',
  },
  {
    source: 'luanji_description',
    target:
      'You can use 2 hand cards with the same suit as Archery Attack; you can remove 1 target from your Archery Attack.',
  },
  {
    source: 'xueyi_description',
    target:
      '<b>Lord skill</b>, at the start of the game, you get X "Scion" mark(s) (X = the amount of Neutral characters in the game); at the start of your turn, you can remove 1 "Scion" and draw 1 card; every 1 "Scion" you have, you max card is increased by +2.',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$qiangxi:1',
    target: '铁戟双提八十斤，威风凛凛震乾坤！',
  },
  {
    source: '$qiangxi:2',
    target: '勇字当头，义字当先！',
  },

  {
    source: '$quhu:1',
    target: '驱虎伤敌，保我无虑。',
  },
  {
    source: '$quhu:2',
    target: '无需费我，一兵一卒。',
  },
  {
    source: '$jieming:1',
    target: '杀身成仁，不负皇恩。',
  },
  {
    source: '$jieming:2',
    target: '因势利导，是为良计。',
  },

  {
    source: '$lianhuan:1',
    target: '连环之策，攻敌之计。',
  },
  {
    source: '$lianhuan:2',
    target: '锁链连舟，困步难行。',
  },
  {
    source: '$niepan:1',
    target: '烈火脱胎，涅槃重生。',
  },
  {
    source: '$niepan:2',
    target: '破而后立，方有大成。',
  },

  {
    source: '$bazhen:1',
    target: '八阵连星，日月同辉。',
  },
  {
    source: '$bazhen:2',
    target: '此阵变化，岂是汝等可解？',
  },
  {
    source: '$huoji:1',
    target: '赤壁借东风，燃火灭魏军。',
  },
  {
    source: '$huoji:2',
    target: '东风，让这火烧得再猛烈些吧！',
  },
  {
    source: '$kanpo:1',
    target: '此计奥妙，我已看破。',
  },
  {
    source: '$kanpo:2',
    target: '还有什么是我看不破的呢？',
  },
  {
    source: '$cangzhuo:1',
    target: '藏巧于拙，用晦而明。',
  },
  {
    source: '$cangzhuo:2',
    target: '寓清于浊，以屈为伸。',
  },

  {
    source: '$tianyi:1',
    target: '天降大任，速战解围！',
  },
  {
    source: '$tianyi:2',
    target: '义不从之，天必不佑！',
  },
  {
    source: '$hanzhan:1',
    target: '伯符，且与我一战！',
  },
  {
    source: '$hanzhan:2',
    target: '与君酣战，快哉快哉！',
  },

  {
    source: '$jianchu:1',
    target: '你这身躯，怎么能快过我？',
  },
  {
    source: '$jianchu:2',
    target: '这些，怎么能挡住我的威力！',
  },

  {
    source: '$shuangxiong:1',
    target: '哥哥，且看我与giao云一战！ ——且与他战个五十回合！',
  },
  {
    source: '$shuangxiong:2',
    target: '此战，若有你我一人在此，何惧华雄？ ——定叫他有去无回！',
  },

  {
    source: '$luanji:1',
    target: '谁都挡不住我的箭阵！',
  },
  {
    source: '$luanji:2',
    target: '我的箭支，准备颇多！',
  },
  {
    source: '$xueyi:1',
    target: '高贵名门，族裔盛名。',
  },
  {
    source: '$xueyi:2',
    target: '贵裔之脉，后起之秀！',
  },
];

export const conversations: Word[] = [
  {
    source: 'shuangxiong: do you wanna to obtain slashes from "shuangxiong" ?',
    target: 'Dual Heroes: do you wanna to obtain slashes played by your opponent?',
  },
];
