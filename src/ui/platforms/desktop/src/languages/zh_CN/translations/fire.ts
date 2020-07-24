import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'caopi', target: '曹丕' },
  { source: 'xingshang', target: '行殇' },
  { source: 'fangzhu', target: '放逐' },
  { source: 'songwei', target: '颂威' },

  { source: 'xuhuang', target: '徐晃' },
  { source: 'duanliang', target: '断粮' },
  { source: 'jiezi', target: '截辎' },

  { source: 'menghuo', target: '孟获' },
  { source: 'huoshou', target: '祸首' },
  { source: 'zaiqi', target: '再起' },

  { source: 'zhurong', target: '祝融' },
  { source: 'juxiang', target: '巨象' },
  { source: 'lieren', target: '烈刃' },

  { source: 'lusu', target: '鲁肃' },
  { source: 'haoshi', target: '好施' },
  { source: '#haoshi', target: '好施' },
  { source: 'dimeng', target: '缔盟' },

  { source: 'sunjian', target: '孙坚' },
  { source: 'yinghun', target: '英魂' },
  { source: 'wulie', target: '武烈' },
  { source: '#wulie_shadow', target: '武烈' },

  { source: 'dongzhuo', target: '董卓' },
  { source: 'jiuchi', target: '酒池' },
  { source: 'JiuChi_Used', target: '崩坏失效' },
  { source: 'roulin', target: '肉林' },
  { source: 'benghuai', target: '崩坏' },
  { source: 'baonve', target: '暴虐' },

  { source: 'jiaxu', target: '贾诩' },
  { source: 'wansha', target: '完杀' },
  { source: 'luanwu', target: '乱武' },
  { source: 'weimu', target: '帷幕' },
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
    target: '当你受到1点伤害后，你可以令一名角色摸两张牌，然后若其手牌数不大于其体力上限，你摸一张牌。',
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
  { source: 'hanzhan_description', target: '你与角色拼点，或其他角色对你发起拼点时，你可令其使用随机手牌拼点' },
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
