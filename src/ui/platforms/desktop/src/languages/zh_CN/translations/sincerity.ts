import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sincerity', target: '信包' },

  { source: 'xin_xinpi', target: '信辛毗' },
  { source: 'xin_yinju', target: '引裾' },
  { source: 's_xin_yinju_debuff', target: '引裾（跳过阶段）' },
  { source: 'xin_chijie', target: '持节' },

  { source: 'wangling', target: '王凌' },
  { source: 'mouli', target: '谋立' },
  { source: '~side_mouli', target: '谋立' },
  { source: 'mouli:li', target: '立' },
  { source: 'zifu', target: '自缚' },

  { source: 'mifuren', target: '糜夫人' },
  { source: 'guixiu', target: '闺秀' },
  { source: 'qingyu', target: '清玉' },
  { source: 'xuancun', target: '悬存' },

  { source: 'wangfuzhaolei', target: '王甫赵累' },
  { source: 'xunyi', target: '殉义' },
  { source: 'xunyi:yi', target: '义' },

  { source: 'wujing', target: '吴景' },
  { source: 'heji', target: '合击' },
  { source: 'liubing', target: '流兵' },

  { source: 'zhouchu', target: '周处' },
  { source: 'xianghai', target: '乡害' },
  { source: 'chuhai', target: '除害' },

  { source: 'kongrong', target: '孔融' },
  { source: 'mingshi', target: '名仕' },
  { source: 'lirang', target: '礼让' },
  { source: 'qian', target: '谦' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'mouli_description',
    target:
      '出牌阶段限一次，你可以交给一名其他角色一张手牌，其获得“立”标记并拥有以下效果直到你的下个回合开始：其可以将一张黑色牌当【杀】使用，或将一张红色牌当【闪】使用；当其下一次使用【杀】或【闪】结算结束后，你摸三张牌。',
  },
  {
    source: 'zifu_description',
    target: '<b>锁定技</b>，当拥有“立”标记的角色死亡后，你减2点体力上限。',
  },

  {
    source: 'xin_yinju_description',
    target:
      '出牌阶段限一次，你可以令一名其他角色须对你使用一张【杀】（无距离限制），否则于其下个回合的首个准备阶段开始时，其跳过本回合的出牌阶段和弃牌阶段。',
  },
  {
    source: 'xin_chijie_description',
    target: '每回合限一次，当你成为其他角色使用牌的唯一目标时，你可以判定，若结果点数大于6，取消之。',
  },

  {
    source: 'xunyi_description',
    target:
      '游戏开始时，你可以选择一名其他角色，其获得“义”标记：当你或其造成伤害后，对方摸一张牌；当你或其受到伤害后，对方弃置一张牌（你和其对对方造成的伤害除外）。当其死亡时，你可以移动此“义”。',
  },

  {
    source: 'guixiu_description',
    target: '<b>锁定技</b>，结束阶段开始时，若你的体力值为奇数，你摸一张牌，否则你回复1点体力。',
  },
  {
    source: 'qingyu_description',
    target:
      '<b>使命技</b>，当你受到伤害时，你弃置两张牌并防止此伤害。<br><b>成功</b>：准备阶段开始时，若你未受伤且没有手牌，你获得技能“悬存”；<br><b>失败</b>：当你进入濒死状态时，若你的体力小于1，你减1点体力上限。',
  },
  {
    source: 'xuancun_description',
    target:
      '其他角色的回合结束时，若你的体力值大于手牌数，你可以令其摸X张牌（X为你的体力值与手牌数的差值，且至多为2）。',
  },

  {
    source: 'heji_description',
    target:
      '当一名角色使用红色【杀】或红色【决斗】结算结束后，若目标数为1，你可对此目标使用一张【杀】或【决斗】（无距离限制）。若你以此法使用的牌不为转化牌，当此牌使用时，你随机获得牌堆里的一张牌。',
  },
  {
    source: 'liubing_description',
    target: '<b>锁定技</b>，当你于一回合内首次声明使用有花色的【杀】后，此【杀】的花色视为方片。',
  },

  {
    source: 'xianghai_description',
    target: '<b>锁定技</b>，其他角色的手牌上限-1；你手牌中的装备牌均视为【酒】。',
  },
  {
    source: 'chuhai_description',
    target:
      '出牌阶段限一次，你可以摸一张牌并与一名角色拼点。若你赢，你观看其手牌，从牌堆或弃牌堆随机获得其手牌中拥有的所有类别的牌各一张，且你于此阶段内对其造成伤害后，你从牌堆或弃牌堆中随机将一张你装备区里没有的副类别的装备牌置入你的装备区。',
  },

  {
    source: 'mingshi_description',
    target:
      '<b>锁定技</b>，当你受到伤害后，若你有“谦”标记，伤害来源弃置其区域内的一张牌，若此牌为：黑色，你获得之；红色，你回复1点体力。',
  },
  {
    source: 'lirang_description',
    target:
      '其他角色的摸牌阶段，你可以令其多摸两张牌，然后你获得一枚“谦”标记。若如此做，你于本回合内的其弃牌阶段结束时，你可获得其于此阶段内弃置过的至多两张牌；摸牌阶段开始前，若你有“谦”标记，你跳过此阶段并移去“谦”标记。',
  },
];

export const skillAudios: Word[] = [
  /*  {
    source: '$xin_yinju:1',
    target: '据理直谏，吾人臣本分。',
  },
  {
    source: '$xin_yinju:2',
    target: '迁徙之计，危涉万民。',
  },
  {
    source: '$xin_chijie:1',
    target: '持节阻战，奉帝赐诏。',
  },
  {
    source: '$xin_chijie:2',
    target: '此战不在急，请仲达明了。',
  },*/

  {
    source: '$yinju:1',
    target: '据理直谏，吾人臣本分。',
  },
  {
    source: '$yinju:2',
    target: '迁徙之计，危涉万民。',
  },
  {
    source: '$chijie:1',
    target: '持节阻战，奉帝赐诏。',
  },
  {
    source: '$chijie:2',
    target: '此战不在急，请仲达明了。',
  },

  {
    source: '$mouli:1',
    target: '司马氏虽权尊势重，吾等徐图亦无不可。',
  },
  {
    source: '$mouli:2',
    target: '先谋后事者昌，先事后谋者亡！',
  },
  {
    source: '$zifu:1',
    target: '有心无力，请罪愿降。',
  },
  {
    source: '$zifu:2',
    target: '舆榇自缚，只求太傅开恩。',
  },

  {
    source: '$cunsi:1',
    target: '子龙，定要保吾儿平安。',
  },
  {
    source: '$cunsi:2',
    target: '将军护禅儿，快快突围！',
  },
  {
    source: '$guixiu:1',
    target: '通儿女之情意，晓乱世之冷暖。',
  },
  {
    source: '$guixiu:2',
    target: '深闺藏英秀，独怜乱世秋。',
  },

  {
    source: '$xunyi:1',
    target: '古有死恩之士，今有殉义之人。',
  },
  {
    source: '$xunyi:2',
    target: '舍身殉义，为君效死。',
  },

  {
    source: '$heji:1',
    target: '你我合势而击之，区区贼寇，岂会费力？',
  },
  {
    source: '$heji:2',
    target: '伯符，今日之战吾必全力攻之。',
  },

  {
    source: '$xianghai:1',
    target: '快快闪开，伤到你们可就不好了，哈哈…',
  },
  {
    source: '$xianghai:2',
    target: '你自己撞上来的，这可怪不得小爷我。',
  },
  {
    source: '$chuhai:1',
    target: '有我在此，安敢为害？',
  },
  {
    source: '$chuhai:2',
    target: '小小孽畜，还不伏诛？',
  },

  {
    source: '$mingshi:1',
    target: '纵有强权在侧，亦不可失吾风骨。',
  },
  {
    source: '$mingshi:2',
    target: '黜邪崇正，何惧之有？',
  },
  {
    source: '$lirang:1',
    target: '仁之所至，礼之所及。',
  },
  {
    source: '$lirang:2',
    target: '施之以礼，还之以德。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to use a slash or duel to {1} ?',
    target: '{0}：你可以对 {1} 使用一张【杀】或【决斗】',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 ‘Yi’?',
    target: '{0}：你可以令一名其他角色获得一枚“义”',
  },
];
