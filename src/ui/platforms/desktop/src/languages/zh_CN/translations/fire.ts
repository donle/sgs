import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'dianwei', target: '典韦' },
  { source: 'qiangxi', target: '强袭' },

  { source: 'xunyu', target: '荀彧' },
  { source: 'quhu', target: '驱虎' },
  { source: 'jieming', target: '节命' },

  { source: 'pangtong', target: '庞统' },
  { source: 'lianhuan', target: '连环' },
  { source: 'niepan', target: '涅槃' },

  { source: 'wolong', target: '卧龙诸葛亮' },
  { source: 'bazhen', target: '八阵' },
  { source: 'huoji', target: '火计' },
  { source: 'kanpo', target: '看破' },
  { source: 'cangzhuo', target: '藏拙' },

  { source: 'taishici', target: '太史慈' },
  { source: 'tianyi', target: '天义' },
  { source: 'tianyi_win', target: '天义[赢]' },
  { source: 'tianyi_lose', target: '天义[没赢]' },
  { source: 'hanzhan', target: '酣战' },

  { source: 'pangde', target: '庞德' },
  { source: 'jianchu', target: '鞬出' },

  { source: 'yanliangwenchou', target: '颜良文丑' },
  { source: 'shuangxiong', target: '双雄' },
  { source: '#shuangxiong', target: '双雄' },
  { source: 'shuangxiong_red', target: '双雄[非红]' },
  { source: 'shuangxiong_black', target: '双雄[非黑]' },

  { source: 'yuanshao', target: '袁绍' },
  { source: 'luanji', target: '乱击' },
  { source: '#luanji', target: '乱击' },
  { source: 'xueyi', target: '血裔' },
  { source: '#xueyi', target: '血裔' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qiangxi_description',
    target:
      '出牌阶段限两次，你可以失去1点体力或弃置一张武器牌，并对本回合内你未以此法指定过的一名其他角色造成1点伤害。',
  },
  {
    source: 'quhu_description',
    target:
      '出牌阶段限一次，你可以与体力值大于你的一名角色拼点，若你：赢，你令该角色对其攻击范围内由你选择的一名角色造成1点伤害；没赢，其对你造成1点伤害。',
  },
  {
    source: 'jieming_description',
    target: '当你受到1点伤害后，你可以令一名角色摸两张牌，然后若其手牌数小于其体力上限，你摸一张牌。',
  },
  {
    source: 'lianhuan_description',
    target: '你可以将一张梅花手牌当【铁索连环】使用或重铸；你使用【铁索连环】的目标上限+1。',
  },
  {
    source: 'niepan_description',
    target:
      '<b>限定技</b>，当你处于濒死状态时，你可以弃置你区域里的所有牌，然后复原你的武将牌，摸三张牌并将体力回复至3点。然后你从“八阵”、“火计”、“看破”中选择一个获得。',
  },
  { source: 'bazhen_description', target: '<b>锁定技</b>，若你的装备区里没有防具牌，则视为你装备【八卦阵】。' },
  { source: 'huoji_description', target: '你可以将一张红色牌当【火攻】使用。' },
  { source: 'kanpo_description', target: '你可以将一张黑色牌当【无懈可击】使用。' },
  {
    source: 'cangzhuo_description',
    target: '<b>锁定技</b>，弃牌阶段开始时，若你本回合未使用过锦囊牌，则你的锦囊牌于本回合内不计入手牌上限。',
  },
  {
    source: 'tianyi_description',
    target:
      '出牌阶段限一次，你可以与一名角色拼点，若你：赢，直到回合结束，你使用【杀】无距离限制且次数上限和目标上限+1；没赢，本回合你不能使用【杀】。',
  },
  {
    source: 'hanzhan_description',
    target:
      '你与角色拼点，或其他角色对你发起拼点时，你可令其使用随机手牌拼点。当你拼点后，你可获得拼点牌中点数最大的【杀】。',
  },
  {
    source: 'jianchu_description',
    target:
      '当你使用【杀】指定一名角色为目标后，你可以弃置其一张牌，若你以此法弃置的牌：不为基本牌，此【杀】不可被【闪】响应，且你本回合内使用【杀】的次数上限+1；为基本牌，该角色获得此【杀】。',
  },
  {
    source: 'shuangxiong_description',
    target:
      '摸牌阶段，你可以改为亮出牌堆顶两张牌，并获得其中一张牌，然后本回合内你可以将与此牌颜色不同的一张手牌当【决斗】使用；当你因“双雄”而受到伤害后，你可以获得本次【决斗】中其他角色打出的【杀】。',
  },
  {
    source: 'luanji_description',
    target: '你可以将两张花色相同的手牌当【万箭齐发】使用；你使用【万箭齐发】可以少选一个目标。',
  },
  {
    source: 'xueyi_description',
    target:
      '<b>主公技</b>，游戏开始时，你获得X枚“裔”标记（X为群势力角色数）；回合开始时，你可以移除一枚"裔"并摸一张牌；你每有一枚"裔"，手牌上限便+2。',
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
    target: '双雄：是否获得本次【决斗】中其他角色打出的【杀】？',
  },
];
