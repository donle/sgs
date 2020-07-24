import type { Word } from 'languages';

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
  { source: 'xingshang_description', target: '当其他角色死亡时，你可以选择一项：1.获得其所有牌；2.回复1点体力。' },
  {
    source: 'fangzhu_description',
    target:
      '当你受到伤害后，你可以令一名其他角色选择一项：1.摸X张牌并翻面；2.弃置X张牌并失去1点体力（X为你已损失的体力值）。',
  },
  {
    source: 'songwei_description',
    target: '<b>主公技</b>，当其他魏势力的黑色判定牌生效后，其可以令你摸一张牌。',
  },
  {
    source: 'duanliang_description',
    target: '你可以将一张黑色基本或装备牌当【兵粮寸断】使用；你对手牌数不小于你的角色使用【兵粮寸断】无距离限制。',
  },
  { source: 'jiezi_description', target: '<b>锁定技</b>，当其他角色跳过摸牌阶段后，你摸一张牌。' },
  {
    source: 'huoshou_description',
    target:
      '<b>锁定技</b>，【南蛮入侵】对你无效；当其他角色使用【南蛮入侵】指定第一个目标后，你代替其成为此牌造成伤害的伤害来源。',
  },
  {
    source: 'zaiqi_description',
    target:
      '弃牌阶段结束时，你可以令一至X名角色选择一项：1.令你回复1点体力；2.摸一张牌（X为本回合内进入弃牌堆的红色牌数）。',
  },
  {
    source: 'juxiang_description',
    target: '<b>锁定技</b>，【南蛮入侵】对你无效；当其他角色使用的【南蛮入侵】结算结束后，你获得之。',
  },
  {
    source: 'lieren_description',
    target: '当你使用【杀】指定目标后，你可以与目标角色拼点，若你：赢，你获得其一张牌；没赢，你与其交换拼点牌。',
  },
  {
    source: 'haoshi_description',
    target:
      '摸牌阶段，你可以多摸两张牌。若如此做，此阶段结束时，若你的手牌数大于5，你将一半的手牌交给除你外手牌数最少的一名角色（向下取整）。',
  },
  {
    source: 'dimeng_description',
    target:
      '出牌阶段限一次，你可以选择两名其他角色（至少一名角色有手牌）并弃置X张牌（X为这两名角色的手牌数之差），然后令这两名角色交换其手牌。',
  },
  {
    source: 'yinghun_description',
    target:
      '准备阶段开始时，若你已受伤，你可以选择一名其他角色并选择一项：1.令其摸X张牌并弃置一张牌；2.令其摸一张牌并弃置X张牌（X为你已损失的体力值）。',
  },
  {
    source: 'wulie_description',
    target:
      '<b>限定技</b>，结束阶段开始时，你可以失去至少1点体力并选择等量其他角色，这些角色各获得一枚“烈”标记；当有“烈”标记的角色受到伤害时，其移去此标记并防止此伤害。',
  },
  {
    source: 'jiuchi_description',
    target: '你可以将一张黑桃手牌当【酒】使用；你使用【酒】【杀】造成伤害后，本回合内你的“崩坏”无效。',
  },
  {
    source: 'roulin_description',
    target:
      '<b>锁定技</b>，当你使用【杀】指定女性角色为目标/女性角色使用【杀】指定你为目标后，其/你需依次使用两张【闪】才能抵消此【杀】。',
  },
  {
    source: 'benghuai_description',
    target: '<b>锁定技</b>，结束阶段开始时，若你不为体力值最小的角色，你选择一项：1.失去1点体力；2.减1点体力上限。',
  },
  {
    source: 'baonve_description',
    target: '<b>主公技</b>，当其他群势力角色造成伤害后，其可以令你进行判定，若结果为黑桃，你回复1点体力。',
  },
  {
    source: 'wansha_description',
    target: '<b>锁定技</b>，你的回合内，除处于濒死状态的角色外的其他角色不能使用【桃】。',
  },
  {
    source: 'luanwu_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以令所有其他角色选择一项：1.对除其外与其距离最近的角色使用一张【杀】；2.失去1点体力。',
  },
  {
    source: 'weimu_description',
    target: '<b>锁定技</b>，你不能成为黑色锦囊牌的目标。',
  },
];
