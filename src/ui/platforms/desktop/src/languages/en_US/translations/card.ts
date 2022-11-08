import { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'slash', target: 'Slash' },
  { source: 'jink', target: 'Jink' },
  { source: 'peach', target: 'Peach' },
  { source: 'alcohol', target: 'Alcohol' },
  { source: 'qinggang', target: 'Qing Gang Sword' },
  { source: 'zixing', target: 'Zi Xing' },
  { source: 'dayuan', target: 'Da Yuan' },
  { source: 'jueying', target: 'Jue Ying' },
  { source: 'chitu', target: 'Chi Tu' },
  { source: 'dilu', target: 'Di Lu' },
  { source: 'zhuahuangfeidian', target: 'Zhua Huang Fei Dian' },
  { source: 'nanmanruqing', target: 'Savage Assault' },
  { source: 'wanjianqifa', target: 'Archery Attack' },
  { source: 'lightning', target: 'Lighting' },
  { source: 'zhugeliannu', target: 'Zhu Ge Crossbow' },
  { source: 'guohechaiqiao', target: 'Dismantlement' },
  { source: 'shunshouqianyang', target: 'Snatch' },
  { source: 'wuxiekeji', target: 'Nullification' },
  { source: 'wuzhongshengyou', target: 'Ex Nihilo' },
  { source: 'baguazhen', target: 'Eight Diagram' },
  { source: 'duel', target: 'Duel' },
  { source: 'lebusishu', target: 'Indulgence' },
  { source: 'jiedaosharen', target: 'Collateral' },
  { source: 'taoyuanjieyi', target: 'Peach Garden' },
  { source: 'wugufengdeng', target: 'Amazing Grace' },
  { source: 'guanshifu', target: 'Rock Cleaving Axe' },
  { source: 'zhangbashemao', target: 'Serpent Spear' },
  { source: 'fangtianhuaji', target: 'Heaven Halberd' },
  { source: 'qinglongyanyuedao', target: 'Green Dragon Crescent Blade' },
  { source: 'qilingong', target: 'Kylin Bow' },
  { source: 'cixiongjian', target: 'Gendor Double Swords' },
  { source: 'renwangdun', target: 'Nioh Shield' },
  { source: 'hanbingjian', target: 'Ice Sword' },
  { source: 'fire_slash', target: 'Fire Slash' },
  { source: 'thunder_slash', target: 'Thunder Slash' },
  { source: 'fire_attack', target: 'Fire Attack' },
  { source: 'muniuliuma', target: 'Wooden Cow' },
  { source: '#muniuliuma', target: 'Wooden Cow' },
  { source: 'bingliangcunduan', target: 'Supply Shortage' },
  { source: 'gudingdao', target: 'Ancient Scimitar' },
  { source: 'zhuqueyushan', target: 'Phoenix Fan' },
  { source: 'tengjia', target: 'Vine Armor' },
  { source: 'baiyinshizi', target: 'Silver Lion' },
  { source: 'hualiu', target: 'Hua Liu' },
  { source: 'tiesuolianhuan', target: 'Iron Chain' },
];

export const cardDescriptions: Word[] = [
  {
    source: 'slash_description',
    target: 'Once per play phase, use this card to any other player in your attack range. Deal 1 damage to the target.',
  },
  {
    source: 'fire_slash_description',
    target: 'Once per play phase, use this card to any other player in your attack range. Deal 1 fire damage to the target.',
  },
  {
    source: 'thunder_slash_description',
    target: 'Once per play phase, use this card to any other player in your attack range. Deal 1 thunder damage to the target.',
  },
  {
    source: 'jink_description',
    target: 'Use this card in response to any Slash targeting you. The Slash is nullified.',
  },
  {
    source: 'peach_description',
    target:
      '<b style="color:red">During your play phase</b>/<b style="color:green">when any player enter dying</b>, use this card to <b style="color:red">you</b>/<b style="color:green">this player</b>. The target heals 1 HP.',
  },
  {
    source: 'alcohol_description',
    target: `① Once per turn, use this card to yourself for boosting. The damage of the next Slash used by the target in this turn will increased by 1.<br />
      ② When you are dying, use this card to yourself. The target heals 1 HP.`,
  },
  {
    source: 'bingliangcunduan_description',
    target: 'During your play phase, place on the judgement area of another player at distance 1. If the judgement result is not club, he skips the next draw phase of this turn.',
  },
  {
    source: 'guohechaiqiao_description',
    target: 'During your play phase, use this card to another player who has cards in any area. Discard 1 card in one of the areas of the target player.',
  },
  {
    source: 'fire_attack_description',
    target:
      'During your play phase, use this card to another player who has handcards. Target shows 1 hand card, and then if you discard 1 hand card with the same suit, you cause him 1 fire damage.',
  },
  {
    source: 'muniuliuma_description',
    target:
      'Once per play phase, you can place 1 hand card on this card, face-down ("Supply"). If you do, you can move this card to the equipment area of another player.<br /> You can use/play the "Supplies" as if they were in your hand.',
  },
  {
    source: 'jiedaosharen_description',
    target:
      'During your play phase, use this card to another player with an equipped weapon. Unless he uses Slash on a player of your choice within his attack range, he gives you his equipped weapon.',
  },
  {
    source: 'duel_description',
    target:
      'During your play phase, use this card to another player. In turns (starting with the target player), both of you play Slash successively. The first player who doesn\'t play Slash takes 1 damage from the other player.',
  },
  {
    source: 'lebusishu_description',
    target: 'During your play phase, place on another player\'s judgement area. If the judgement result is not heart, he skips his next play phase in this turn.',
  },
  {
    source: 'nanmanruqing_description',
    target: 'During your play phase, use this card to all of other players. Target needs to play a Slash, or takes 1 damage from you.',
  },
  {
    source: 'lightning_description',
    target: 'During your play phase, place on your judgement area. If the judgement result is not 2~9 spade, move this card to the next player, otherwise the target takes 3 thunder damage.',
  },
  {
    source: 'shunshouqianyang_description',
    target: 'During your play phase, use this card to another player at distance 1 with cards in any area. Take 1 card in one of the areas of the target player.',
  },
  {
    source: 'taoyuanjieyi_description',
    target: 'During your play phase, use this card to all players. Target heals 1 HP.',
  },
  {
    source: 'tiesuolianhuan_description',
    target: 'During your play phase, use this card to 1 or 2 players. Target changes his chain state.<br /> Note: This card can be recasted.',
  },
  {
    source: 'wanjianqifa_description',
    target: 'During your play phase, use this card to all of other players. Target needs to play a Jink, or takes 1 damage from you.',
  },
  {
    source: 'wuxiekeji_description',
    target: 'Before a trick card takes effect on a player, you can use this card to that trick card. Target trick card will be nullified.',
  },
  {
    source: 'wuzhongshengyou_description',
    target: 'During your play phase, use this card to you. Draw 2 cards.',
  },
  {
    source: 'wugufengdeng_description',
    target: 'During your play phase, use this card to all of the players. Reveal as many cards from the deck as target players; then, each target player takes 1 of those cards.',
  },
  {
    source: 'cixiongjian_description',
    target: 'After you use Slash to a target of the opposite sex, you may make him choose: 1. Discard 1 handcard; 2. You draw 1 card.',
  },
  {
    source: 'fangtianhuaji_description',
    target: '<b>Compulsory skill</b>, when your used Slash is all of your handcards, you can target up to +2 additional players within your attack range.',
  },
  {
    source: 'gudingdao_description',
    target: '<b>Compulsory skill</b>, when your used Slash is about to cause damage, if the target has no handcards, the damage is increased by +1.',
  },
  {
    source: 'guanshifu_description',
    target: 'When your used Slash is nullified by a Jink, you can discard 2 other cards, then this Slash will be forced to take effect.',
  },
  {
    source: 'hanbingjian_description',
    target: 'When your used Slash is about to cause damage, if the target has cards, you can prevent the damage and discard him 2 cards successively.',
  },
  {
    source: 'qilingong_description',
    target: 'When your used Slash is about to cause damage, you can discard the target 1 mount in his equipment area.',
  },
  {
    source: 'qinggang_description',
    target: '<b>Compulsory skill</b>, After you use Slash to a target, ignore his armor.',
  },
  {
    source: 'qinglongyanyuedao_description',
    target: 'When your used Slash is nullified by a Jink, you can use another Slash immediately on the same target.',
  },
  {
    source: 'zhangbashemao_description',
    target: 'You can use/play 2 hand cards as Slash.',
  },
  {
    source: 'zhugeliannu_description',
    target: '<b>Compulsory skill</b>，you can use any number of Slash.',
  },
  {
    source: 'zhuqueyushan_description',
    target: 'You can use Slash as Fire Slash.',
  },
  {
    source: 'baguazhen_description',
    target: 'When you need to use/play Jink: you can perform a judgement; if the result is red, you are regarded as having used/played Jink.',
  },
  {
    source: 'baiyinshizi_description',
    target: 'When you are about to take Fire damage, the damage is reduced to 1; when you lose this card in your equipment area, you heal 1 HP.',
  },
  {
    source: 'renwangdun_description',
    target: '<b>Compulsory skill</b>，black Slash have no effect on you.',
  },
  {
    source: 'tengjia_description',
    target: '<b>Compulsory skill</b>，Savage Assault, Archery Attack and normal Slash have no effect on you; when you are about to take Fire damage, the damage is increased by +1.',
  },
  {
    source: 'zixing_description',
    target: 'The distance from you to other players is reduced by -1.',
  },
  {
    source: 'dayuan_description',
    target: 'The distance from you to other players is reduced by -1.',
  },
  {
    source: 'jueying_description',
    target: 'The distance from other players to you is increased by +1.',
  },
  {
    source: 'chitu_description',
    target: 'The distance from you to other players is reduced by -1.',
  },
  {
    source: 'dilu_description',
    target: 'The distance from other players to you is increased by +1.',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: 'The distance from other players to you is increased by +1.',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: 'The distance from other players to you is increased by +1.',
  },
  {
    source: 'hualiu_description',
    target: 'The distance from other players to you is increased by +1.',
  },
];

export const promptDescriptions: Word[] = [
  { source: 'do you wish to deliver muniuliuma to another player?', target: 'Do you wish to deliver Wooden Cow to another player?' },
  {
    source: '{0} used card {1} to {2} and announced {3} as pending target',
    target: '{0} used card {1} to {2} and announced {3} as pending target',
  },
  {
    source: 'player {0} selected {1}, {2} get 1 damage hit from {0}',
    target: 'player {0} selected {1}, {2} takes 1 damage from {0}',
  },
];
