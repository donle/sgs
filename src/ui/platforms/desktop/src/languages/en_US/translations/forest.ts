import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'caopi', target: 'Cao Pi' },
  { source: 'xingshang', target: 'Funeral Affair' },
  { source: 'fangzhu', target: 'Banish into Exile' },
  { source: 'songwei', target: 'Exalt the Powerful' },

  { source: 'xuhuang', target: 'Xu Huang' },
  { source: 'duanliang', target: 'Blockade' },
  { source: 'jiezi', target: 'Cut Supplies' },

  { source: 'menghuo', target: 'Meng Huo' },
  { source: 'huoshou', target: 'The Smoking Gun' },
  { source: 'zaiqi', target: 'Great Again' },

  { source: 'zhurong', target: 'Zhu Rong' },
  { source: 'juxiang', target: 'Giant Elephant' },
  { source: 'lieren', target: 'Fearsome Blade' },

  { source: 'lusu', target: 'Lu Su' },
  { source: 'haoshi', target: 'Altruism' },
  { source: '#haoshi', target: 'Altruism' },
  { source: 'dimeng', target: 'Alliance' },

  { source: 'sunjian', target: 'Sun Jian' },
  { source: 'yinghun', target: 'Soul of Hero' },
  { source: 'wulie', target: 'Wulie' },
  { source: '#wulie_shadow', target: 'Wulie' },

  { source: 'dongzhuo', target: 'Dong Zhuo' },
  { source: 'jiuchi', target: 'Drown in Wine' },
  { source: 'JiuChi_Used', target: 'Disintegration invaild' },
  { source: 'roulin', target: 'Garden of Lust' },
  { source: 'benghuai', target: 'Disintegration' },
  { source: 'baonve', target: 'The Tyrant' },

  { source: 'jiaxu', target: 'Jia Xu' },
  { source: 'wansha', target: 'Unmitigated Murder' },
  { source: 'luanwu', target: 'Descend into Chaos' },
  { source: 'weimu', target: 'Behind the Curtain' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'xingshang_description',
    target: 'When other player died, you can choose: 1. Get all his cards; 2. Heal 1 HP.',
  },
  {
    source: 'fangzhu_description',
    target:
      'After you take damage, you can make another player choose: 1. Draw X card(s), then turn over; 2. Discard X card(s), then lose 1 HP. (X = your lost HP)',
  },
  {
    source: 'songwei_description',
    target: "<b>Lord skill</b>, after another Wei character's judge card takes effect, he can let you draw 1 card.",
  },
  {
    source: 'duanliang_description',
    target:
      'You can use a black basic card or black equip card as Supply Shortage; your Supply Shortage have no distance limit to the players whose hand cards are not less than yours.',
  },
  {
    source: 'jiezi_description',
    target: '<b>Compulsory skill</b>, when other players skip his draw phase, you draw 1 card.',
  },
  {
    source: 'huoshou_description',
    target:
      '<b>Compulsory skill</b>, Savage Assault has no effect on you; when Savage Assault deal damage, you become the damage source.',
  },
  {
    source: 'zaiqi_description',
    target:
      'After you discard phase, you can let 1-X players choose: 1. Heal 1 HP for you; 2. Draw 1 card. (X = the amount of red cards entered discard pile in this turn)',
  },
  {
    source: 'juxiang_description',
    target:
      '<b>Compulsory skill</b>, Savage Assault has no effect on you; after Savage Assault used by another player have concluded all effects, you get that card.',
  },
  {
    source: 'lieren_description',
    target:
      'After you use Slash target to player, you can point fight to the target, if you win, you take a card from the target; if you lose, you exchange the point fight card with him.',
  },
  {
    source: 'haoshi_description',
    target:
      'During your draw phase, you can draw +2 extra cards, then if your hand cards are more than 5, you must give half of them (rounded down) to another player with the lowest amount of hand cards.',
  },
  {
    source: 'dimeng_description',
    target:
      'Once per action phase: you can select 2 other players and discard X cards, then they exchange their hand cards. (X = difference between their amount of hand cards)',
  },
  {
    source: 'yinghun_description',
    target:
      'At the start of your prepare phase, if you are wounded, you can choose another player and choose: 1. He draws 1 card, then discard X card(s); 2. He draws X card(s), then discard 1 card. (X = the amount of your lost HP)',
  },
  {
    source: 'wulie_description',
    target:
      '<b>Limited skill</b>, at the start of your finish phase, you can lose any amount of HP and choose the same targets of another players, they get 1 "Wulie" mark; when a player who has "Wulie" take damage, he lose this mark and prevent the damage.',
  },
  {
    source: 'jiuchi_description',
    target:
      'You can use a spade hand card as Alcohol; you can use any amount of Alcohol; after you deal damage with Slash boosted by Alcohol, you skill Disintegrate is invaild for the rest of this turn.',
  },
  {
    source: 'roulin_description',
    target:
      '<b>Compulsory skill</b>, when you use Slash target to a female character of when a famale character uses Slash target to you, the target needs to use 2 Jink to evade it.',
  },
  {
    source: 'benghuai_description',
    target:
      "<b>Compulsory skill</b>, at the start of your finish phase, if you aren't the player with the lowest HP, you choose: 1. Lose 1 HP; 2. Lose 1 max HP.",
  },
  {
    source: 'baonve_description',
    target:
      '<b>Lord skill</b>, after other Neutral character deals 1 damage, he can let you perform a judgement, if the result is spade, you take the judge card and heal 1 HP.',
  },
  {
    source: 'wansha_description',
    target: '<b>Compulsory skill</b>, during your turn, only you and the dying player can use Peach.',
  },
  {
    source: 'luanwu_description',
    target:
      '<b>Limited skill</b>, during you play phase, you can make all other players choose: 1. Use a Slash to the player in their least distance; 2. Lose 1 HP.',
  },
  {
    source: 'weimu_description',
    target: "<b>Compulsory skill</b>, you can't be the target of black trick cards.",
  },
];

export const skillAudios: Word[] = [
  {
    source: '$xingshang:1',
    target: '群燕辞归鹄南翔，念君客游思断肠。',
  },
  {
    source: '$xingshang:2',
    target: '霜露纷兮交下，木叶落兮凄凄。',
  },
  {
    source: '$fangzhu:1',
    target: '国法不可废，汝先退去。',
  },
  {
    source: '$fangzhu:2',
    target: '将军征战辛苦，孤当赠予良宅。',
  },
  {
    source: '$songwei:1',
    target: '藩屏大宗，御侮厌难！',
  },
  {
    source: '$songwei:2',
    target: '朕承符运，受终革命！',
  },

  {
    source: '$duanliang:1',
    target: '粮不三载，敌军已犯行军大忌！',
  },
  {
    source: '$duanliang:2',
    target: '断敌粮秣，此战可胜！',
  },
  {
    source: '$jiezi:1',
    target: '因粮于敌，故军食可足也。',
  },
  {
    source: '$jiezi:2',
    target: '食敌一钟，当吾二十钟。',
  },

  {
    source: '$huoshou:1',
    target: '汉人？岂是我等的对手！',
  },
  {
    source: '$huoshou:2',
    target: '定叫你们有来无回！',
  },
  {
    source: '$zaiqi:1',
    target: '胜败乃常事，无妨！',
  },
  {
    source: '$zaiqi:2',
    target: '汉人奸诈，还是不服，再战！',
  },

  {
    source: '$juxiang:1',
    target: '今日就让这群汉人，长长见识！',
  },
  {
    source: '$juxiang:2',
    target: '我的大象终于有了用武之地！',
  },
  {
    source: '$lieren:1',
    target: '有我手中飞刀在，何惧蜀军！',
  },
  {
    source: '$lieren:2',
    target: '长矛！飞刀！烈火！都来吧！',
  },

  {
    source: '$haoshi:1',
    target: '来来来，见面分一半。',
  },
  {
    source: '$haoshi:2',
    target: '拿去拿去，莫跟哥哥客气！',
  },
  {
    source: '$dimeng:1',
    target: '合纵连横，方能以弱胜强。',
  },
  {
    source: '$dimeng:2',
    target: '以和为贵，以和为贵~',
  },

  {
    source: '$yinghun:1',
    target: '提刀奔走，灭敌不休！',
  },
  {
    source: '$yinghun:2',
    target: '贼寇草莽，我且出战！',
  },
  {
    source: '$wulie:1',
    target: '孙武之后，英烈勇战！',
  },
  {
    source: '$wulie:2',
    target: '兴义之中，忠烈之名。',
  },

  {
    source: '$jiuchi:1',
    target: '有酒不欢？来来来，再饮，再饮！',
  },
  {
    source: '$jiuchi:2',
    target: '黄金美酒夜光杯，舍我其谁啊？哈哈哈哈哈',
  },
  {
    source: '$roulin:1',
    target: '美女、美酒、美食...嘿嘿！尽我享用！',
  },
  {
    source: '$roulin:2',
    target: '嗯~！尽享天下美味~ 呵哈哈哈',
  },
  {
    source: '$baonve:1',
    target: '不施严法怎治乱民？休得啰嗦！',
  },
  {
    source: '$baonve:2',
    target: '天子在我手里，我怕谁！',
  },
  {
    source: '$benghuai:1',
    target: '什么礼制纲常？我说的，就是纲常！',
  },
  {
    source: '$benghuai:2',
    target: '谁有权力，谁掌生死！',
  },

  {
    source: '$luanwu:1',
    target: '哼哼哼哼，坐山观虎斗。',
  },
  {
    source: '$luanwu:2',
    target: '哭喊吧，哀求吧，挣扎吧，然后死吧！',
  },
  {
    source: '$wansha:1',
    target: '我要你三更死，谁敢留你到五更！',
  },
  {
    source: '$wansha:2',
    target: '神仙难救，神仙难救啊！',
  },
  {
    source: '$weimu:1',
    target: '你奈我何？',
  },
  {
    source: '$weimu:2',
    target: '此计伤不到我。',
  },
];

export const eventDictionary: Word[] = [
  { source: 'yinghun:option-one', target: 'Draw 1 discard X' },
  { source: 'yinghun:option-two', target: 'Draw X discard 1' },
  { source: 'benghuai:hp', target: 'Lose 1 HP' },
  { source: 'benghuai:maxhp', target: 'Lose 1 max HP' },
  { source: 'xingshang:recover', target: 'Heal 1 HP' },
  { source: 'xingshang:pickup', target: 'Get all his cards' },
  { source: 'zaiqi:draw', target: 'Draw 1 card' },
  { source: 'zaiqi:recover', target: 'Heal 1 HP for Meng Huo' },
];
