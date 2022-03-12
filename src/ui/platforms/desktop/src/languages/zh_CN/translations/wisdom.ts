import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'wisdom', target: '智包' },

  { source: 'zhi_wangcan', target: '智王粲' },
  { source: 'zhi_qiai', target: '七哀' },
  { source: 'zhi_shanxi', target: '善檄' },
  { source: 'zhi_shanxi:xi', target: '檄' },

  { source: 'bianfuren', target: '卞夫人' },
  { source: 'wanwei', target: '挽危' },
  { source: 'yuejian', target: '约俭' },

  { source: 'chenzhen', target: '陈震' },
  { source: 'shameng', target: '歃盟' },

  { source: 'feiyi', target: '费祎' },
  { source: 'jianyu', target: '谏喻' },
  { source: 'jianyu target: {0}', target: '谏喻:{0}' },
  { source: 'shengxi', target: '生息' },

  { source: 'luotong', target: '骆统' },
  { source: 'qinzheng', target: '勤政' },
  { source: 'qinzheng times: {0}', target: '勤政[{0}]' },

  { source: 'zhi_xunchen', target: '智荀谌' },
  { source: 'jianzhan', target: '谏战' },
  { source: 'duoji', target: '夺冀' },

  { source: 'zhi_duyu', target: '智杜预' },
  { source: 'wuku', target: '武库' },
  { source: 'wuku: {0}', target: '武库[{0}]' },
  { source: 'zhi_sanchen', target: '三陈' },
  { source: 'miewu', target: '灭吴' },

  { source: 'zhi_sunshao', target: '智孙邵' },
  { source: 'fubi', target: '辅弼' },
  { source: '#fubi', target: '辅弼' },
  { source: '##fubi', target: '辅弼' },
  { source: 'zuici', target: '罪辞' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhi_qiai_description',
    target: '出牌阶段限一次，你可以交给一名其他角色一张非基本牌，然后其选择一项：1.令你回复1点体力；2.令你摸两张牌。',
  },
  {
    source: 'zhi_shanxi_description',
    target:
      '出牌阶段开始时，你可以选择一名没有“檄”的其他角色，移去场上所有“檄”，其获得1枚“檄”标记；当有“檄”的角色回复体力后，若其不处于濒死状态，其选择一项：1.交给你两张牌；2.失去1点体力。',
  },

  {
    source: 'wanwei_description',
    target:
      '每轮限一次，你可令进入濒死状态的其他角色，或出牌阶段由你选择的一名其他角色回复X+1点体力，然后你失去X点体力（X为你的体力值）。',
  },
  {
    source: 'yuejian_description',
    target: '你的手牌上限等同于体力上限；当你进入濒死状态时，你可以弃置两张牌，回复1点体力。',
  },

  {
    source: 'shameng_description',
    target: '出牌阶段限一次，你可以弃置两张颜色相同的手牌，并令一名其他角色摸两张牌，然后你摸三张牌。',
  },

  {
    source: 'jianyu_description',
    target:
      '每轮限一次，出牌阶段，你可以指定两名角色。若如此做，直到你的下个回合开始，当其中一名角色使用牌指定另一名角色为目标后，后者摸一张牌。',
  },
  {
    source: 'shengxi_description',
    target: '结束阶段开始时，若你于本回合内未造成过伤害，你可以摸两张牌。',
  },

  {
    source: 'qinzheng_description',
    target:
      '<b>锁定技，</b>当你使用或打出牌时，根据你本局游戏使用或打出过牌数，随机获得牌堆里一张相应的牌：3的倍数，【杀】或【闪】；5的倍数，【酒】或【桃】；8的倍数，【无中生有】或【决斗】。',
  },

  {
    source: 'jianzhan_description',
    target:
      '出牌阶段限一次，你可以令一名其他角色选择一项：1.视为对其攻击范围内由你选择的一名体力值小于其的角色使用一张【杀】；2.令你摸一张牌。',
  },
  {
    source: 'duoji_description',
    target:
      '出牌阶段限一次，你可以将一张牌置于一名其他角色的武将牌上，称为“冀”；当有“冀”的角色使用装备牌结算结束后，你获得此牌，然后其移去一张“冀”，并摸一张牌；有“冀”的角色的回合结束时，你获得其所有“冀”。',
  },

  {
    source: 'wuku_description',
    target: '<b>锁定技，</b>当一名角色使用装备牌时，若你的“武库”标记小于3，你获得1枚“武库”标记。',
  },
  {
    source: 'zhi_sanchen_description',
    target: '<b>觉醒技，</b>结束阶段开始时，若你有3枚“武库”标记，你加1点体力上限，回复1点体力，获得技能“灭吴”。',
  },
  {
    source: 'miewu_description',
    target: '每回合限一次，你可以移去一枚“武库”标记，并将一张牌当任意基本牌或锦囊牌使用或打出，然后你摸一张牌。',
  },
  {
    source: 'fubi_description',
    target:
      '游戏开始时，你可以另一名其他角色获得一枚“辅”标记。拥有“辅”标记的角色准备阶段开时，你可以选择一项：令其本回合手牌上限+3；或令其此回合使用【杀】的次数上限+1',
  },
  {
    source: 'zuici_description',
    target: '准备阶段开始时或当你进入濒死状态时，你可以废除一个你的装备栏，回复2点体力，然后你可以转移“辅”标记',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhi_qiai:1',
    target: '恨我无时谋，譬诸具官臣。',
  },
  {
    source: '$zhi_qiai:2',
    target: '鞠躬中坚内，微画无所陈。',
  },

  {
    source: '$zhi_shanxi:1',
    target: '连舫踰万艘，带甲千万人。',
  },
  {
    source: '$zhi_shanxi:2',
    target: '率彼东南路，将定一举勋。',
  },
 
  {
    source: '$wanwei:1',
    target: '梁沛之间，无子廉焉有今日？',
  },
  {
    source: '$wanwei:2',
    target: '汝兄弟既为手足，何必苦苦相逼？',
  }, 
  {
    source: '$yuejian:1',
    target: '吾母仪天下，于节俭处当率先垂范。',
  },
  {
    source: '$yuejian:2',
    target: '取上为贪，取下为伪，妾则取其中者。',
  },
 
  {
    source: '$shameng:1',
    target: '歃血盟誓，以告神明。',
  },
  {
    source: '$shameng:2',
    target: '戮办一心，同讨魏贼。',
  },

  {
    source: '$jianyu:1',
    target: '功以才成，业由才广，弃才不用，非长计也。',
  },
  {
    source: '$jianyu:2',
    target: '舍此不任而防后患，是备风波而废舟楫也。',
  }, 
  {
    source: '$shengxi:1',
    target: '利治小之宜，秉居静之理。',
  },
  {
    source: '$shengxi:2',
    target: '外却骆谷之师，内保宁缉之实。',
  },

  {
    source: '$qinzheng:1',
    target: '夫国之有民，犹水之有舟。停则以安，扰则以危。',
  },
  {
    source: '$qinzheng:2',
    target: '治疾及其未笃，除患贵其未深。',
  },

  {
    source: '$jianzhan:1',
    target: '若能迎天子以兴兵讨贼，大业可成。',
  },
  {
    source: '$jianzhan:2',
    target: '明公乃当世之雄，谁可匹敌？',
  },
  {
    source: '$duoji:1',
    target: '将军若献冀州，必安如泰山也。',
  },
  {
    source: '$duoji:2',
    target: '袁氏得冀州，必厚德将军。',
  },

  {
    source: '$wuku:1',
    target: '损益万枢，竭世运机。',
  },
  {
    source: '$wuku:2',
    target: '胸藏万卷，充盈如库。',
  },
  {
    source: '$zhi_sanchen:1',
    target: '贼计已穷，陈兵吴地，可一鼓而下也。',
  },
  {
    source: '$zhi_sanchen:2',
    target: '伐吴此举，十有九利，惟陛下察之。',
  },
  {
    source: '$miewu:1',
    target: '倾荡之势已成，石城尽在眼下。',
  },
  {
    source: '$miewu:2',
    target: '吾军势如破竹，江东六郡唾手可得！',
  },

/*  {
    source: '$dingyi:1',
    target: '经国序民，还需制礼定仪。',
  },
  {
    source: '$dingyi:2',
    target: '无礼而治世，欲使国泰，安可得哉？',
  },*/
  {
    source: '$fubi:1',
    target: '辅君弼主，士之所志也。',
  },
  {
    source: '$fubi:2',
    target: '献策思计，佐定江山。',
  },
  {
    source: '$zuici:1',
    target: '既为朝堂宁定，吾请辞便是。',
  },
  {
    source: '$zuici:2',
    target: '国事为先，何惧清名有损。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'zhi_qiai:draw',
    target: '令其摸两张牌。',
  },
  {
    source: 'zhi_qiai:recover',
    target: '令其回复1点体力。',
  },
  {
    source: '{0}: please choose zhi_qiai options: {1}',
    target: '{0}：请选择令 {1} 摸牌或回复体力',
  },

  {
    source: '{0}: you need to give 2 cards to {1}, or you will lose 1 hp',
    target: '{0}：请交给 {1} 两张牌，否则你将失去1点体力',
  },

  {
    source: '{0}: do you want to let {1} recover {2} hp, then you lose {3} hp?',
    target: '{0}：你可以令 {1} 回复 {2} 点体力，然后你失去 {3} 点体力',
  },

  {
    source: '{0}: do you want to drop 2 cards to recover 1 hp?',
    target: '{0}：你可以弃置两张牌来回复1点体力',
  },

  {
    source: '{0}: do you want to draw 2 cards?',
    target: '{0}：你可以摸两张牌',
  },

  {
    source: '{0}: do you want to draw 2 cards?',
    target: '{0}：你可以摸两张牌',
  },

  {
    source: 'jianzhan:draw',
    target: '令其摸一张牌',
  },
  {
    source: 'jianzhan:slash',
    target: '视为对目标使用一张【杀】',
  },
  {
    source: '{0}: please choose jianzhan options: {1} {2}',
    target: '{0}：请选择视为对 {1} 使用一张【杀】，或令 {2} 摸一张牌',
  },
  {
    source: '{0}: please choose: {1}',
    target: '{0}：请选择令 {1} 摸一张牌',
  },

  {
    source: '{0}: please remove a Ji',
    target: '{0}：请选择一张“冀”移去',
  },
  {
    source: '{0}: please choose another player to transfer the "fu" mark',
    target: '{0}: 你可以将“辅”标记转移给一名其他角色',
  },
  { source: '{0}: please choose and abort an equip section', target: '{0}: 请选择废除一个装备区' },
  {
    source: '{0}: 1.owner has extra 3 cards hold limit, 2.one more time to use slash in current round',
    target: '{0}: 1. 其本回合手牌上限+3；2. 其此回合使用【杀】的次数上限+1',
  },
];
