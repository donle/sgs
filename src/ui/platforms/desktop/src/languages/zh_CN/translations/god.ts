import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'god_guanyu', target: '神关羽' },
  { source: 'wushen', target: '武神' },
  { source: '##wushen', target: '武神' },
  { source: 'wuhun', target: '武魂' },
  { source: '#wuhun', target: '武魂' },

  { source: 'god_lvmeng', target: '神吕蒙' },
  { source: 'gongxin', target: '攻心' },
  { source: 'shelie', target: '涉猎' },

  { source: 'god_zhouyu', target: '神周瑜' },
  { source: 'qinyin', target: '琴音' },
  { source: 'yeyan', target: '业炎' },

  { source: 'god_zhugeliang', target: '神诸葛亮' },
  { source: 'qixing', target: '七星' },
  { source: '#qixing', target: '七星' },
  { source: 'kuangfeng', target: '狂风' },
  { source: 'dawu', target: '大雾' },

  { source: 'god_caocao', target: '神曹操' },
  { source: 'guixin', target: '归心' },
  { source: 'feiying', target: '飞影' },

  { source: 'god_lvbu', target: '神吕布' },
  { source: 'kuangbao', target: '狂暴' },
  { source: 'wumou', target: '无谋' },
  { source: 'wuqian', target: '无前' },
  { source: 'shenfen', target: '神愤' },

  { source: 'god_simayi', target: '神司马懿' },
  { source: 'renjie', target: '忍戒' },
  { source: 'baiyin', target: '拜印' },
  { source: 'jilve', target: '极略' },
  { source: '#jilve', target: '极略' },
  { source: '##jilve', target: '极略·鬼才' },
  { source: '###jilve', target: '极略·集智' },
  { source: '####jilve', target: '极略·放逐' },
  { source: 'jilve-zhiheng', target: '极略·制衡' },
  { source: 'lianpo', target: '连破' },

  { source: 'god_zhaoyun', target: '神赵云' },
  { source: 'juejing', target: '绝境' },
  { source: 'longhun', target: '龙魂' },
  { source: '#longhun', target: '龙魂' },
  { source: '##longhun', target: '龙魂' },

  { source: 'god_liubei', target: '神刘备' },
  { source: 'longnu', target: '龙怒' },
  { source: 'liu_jieying', target: '结营' },

  { source: 'god_luxun', target: '神陆逊' },
  { source: 'junlve', target: '军略' },
  { source: 'cuike', target: '摧克' },
  { source: 'zhanhuo', target: '绽火' },

  { source: 'god_zhangliao', target: '神张辽' },
  { source: 'duorui', target: '夺锐' },
  { source: 'duorui target skill: {0}', target: '被夺锐[{0}]' },
  { source: 'duorui skill: {0}', target: '夺锐[{0}]' },
  { source: 'zhiti', target: '止啼' },

  { source: 'god_ganning', target: '神甘宁' },
  { source: 'poxi', target: '魄袭' },
  { source: 'jieying', target: '劫营' },

  { source: 'god_guojia', target: '神郭嘉' },
  { source: 'god_huishi', target: '慧识' },
  { source: 'god_tianyi', target: '天翊' },
  { source: 'god_huishi_sec', target: '辉逝' },
  { source: 'zuoxing', target: '佐幸' },
  { source: '#zuoxing', target: '佐幸' },
  { source: 'side_zuoxing_s', target: '佐幸' },

  { source: 'god_taishici', target: '神太史慈' },
  { source: 'dulie', target: '笃烈' },
  { source: 'dulie_wei', target: '围' },
  { source: 'powei', target: '破围' },
  { source: 'powei:succeeded', target: '破围[成功]' },
  { source: 'powei:failed', target: '破围[失败]' },
  { source: 'shenzhuo', target: '神著' },

  { source: 'god_sunce', target: '神孙策' },
  { source: 'yingba', target: '英霸' },
  { source: 'pingding', target: '平定' },
  { source: 'god_fuhai', target: '覆海' },
  { source: 'pinghe', target: '冯河' },

  { source: 'god_xunyu', target: '神荀彧' },
  { source: 'tianzuo', target: '天佐' },
  { source: '#tianzuo', target: '天佐' },
  { source: 'lingce', target: '灵策' },
  { source: 'dinghan', target: '定汉' },

  { source: 'god_jiangwei', target: '神姜维' },
  { source: 'tianren', target: '天任' },
  { source: 'jiufa', target: '九伐' },
  { source: 'pingxiang', target: '平襄' },
  { source: '#pingxiang', target: '平襄' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'wushen_description',
    target: '<b>锁定技</b>，你的红桃手牌均视为【杀】；你使用红桃【杀】无距离和次数限制，无法被响应。',
  },
  {
    source: 'wuhun_description',
    target:
      '<b>锁定技</b>，当你受到1点伤害后，伤害来源获得1枚“梦魇”标记；当你死亡时，你令“梦魇”标记数最多的一名其他角色判定，若不为【桃】或【桃园结义】，该角色死亡。',
  },
  {
    source: 'shelie_description',
    target: '摸牌阶段，你可以改为亮出牌堆顶五张牌，然后获得其中每种花色的牌各一张。',
  },
  {
    source: 'gongxin_description',
    target:
      '出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以展示其中一张红桃牌，选择一项：1.弃置此牌；2.将此牌置于牌堆顶。',
  },
  {
    source: 'qinyin_description',
    target:
      '<b>锁定技</b>，弃牌阶段结束时，若你于此阶段内弃置过不少于两张手牌，则你令所有角色失去1点体力或回复1点体力。',
  },
  {
    source: 'yeyan_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以选择一至三名角色，对这些角色造成共计至多3点火焰伤害（若你将对其中一名角色分配不少于2点火焰伤害，你须先弃置四张花色各不相同的手牌并失去3点体力）。',
  },
  {
    source: 'qixing_description',
    target:
      '游戏开始时，你将牌堆顶七张牌扣置于你的武将牌上，称为“星”；摸牌阶段结束时，你可以用至少一张手牌交换等量的“星”。',
  },
  {
    source: 'kuangfeng_description',
    target:
      '结束阶段开始时，你可以移去一张“星”并选择一名角色，然后直到你的下个回合开始前，当该角色受到火焰伤害时，此伤害+1。',
  },
  {
    source: 'dawu_description',
    target:
      '结束阶段开始时，你可以移去至少一张“星”并选择等量角色，然后直到你的下个回合开始前，当这些角色受到非雷电伤害时，防止此伤害。',
  },
  {
    source: 'guixin_description',
    target: '当你受到1点伤害后，你可以随机获得每名其他角色区域里的一张牌，然后你翻面。',
  },
  {
    source: 'feiying_description',
    target: '<b>锁定技</b>，其他角色计算与你的距离+1。',
  },
  {
    source: 'kuangbao_description',
    target: '<b>锁定技</b>，游戏开始时，你获得2枚“暴怒”标记；当你造成或受到1点伤害后，你获得1枚“暴怒”标记。',
  },
  {
    source: 'wumou_description',
    target: '<b>锁定技</b>，当你使用普通锦囊牌时，你失去1点体力或移去一枚“暴怒”标记。',
  },
  {
    source: 'wuqian_description',
    target:
      '出牌阶段，你可以移去2枚“暴怒”标记并选择本回合内你未以此法选择过的一名其他角色，然后直到回合结束，你拥有“无双”且该角色的防具失效。',
  },
  {
    source: 'shenfen_description',
    target:
      '出牌阶段限一次，你可以移去6枚“暴怒”标记并对所有其他角色造成1点伤害，然后这些角色弃置装备区里的所有牌，再弃置四张手牌，最后你翻面。',
  },
  {
    source: 'renjie_description',
    target: '<b>锁定技</b>，当你受到伤害后，或于弃牌阶段内弃置手牌后，你获得X枚“忍”标记（X为伤害值或弃置的手牌数）。',
  },
  {
    source: 'baiyin_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你拥有不少于4枚“忍”标记，你减1点体力上限并获得技能“极略”。',
  },
  {
    source: 'jilve_description',
    target: '你可以移去1枚“忍”标记，发动下列一项技能：“鬼才”、“放逐”、“集智”、“制衡”或“完杀”。',
  },
  {
    source: 'lianpo_description',
    target: '一名角色的回合结束时，若你于此回合内杀死过角色，你可以获得一个额外的回合。',
  },
  {
    source: 'juejing_description',
    target: '<b>锁定技</b>，当你进入或脱离濒死状态时，你摸一张牌；你的手牌上限+2。',
  },
  {
    source: 'longhun_description',
    target:
      '你可以将一至两张同花色的牌按如下规则使用或打出：红桃当【桃】；方块当火【杀】；梅花当【闪】；黑桃当【无懈可击】。若你以此法使用或打出的两张牌为：红色，此牌的伤害值或回复值+1；黑色，你弃置当前回合角色的一张牌。',
  },

  {
    source: 'longnu_description',
    target:
      '<b>转换技</b>，<b>锁定技</b>，出牌阶段开始时，阳：你失去1点体力并摸一张牌，然后你于此阶段内红色手牌均视为火【杀】且使用火【杀】无距离限制；阴：你减1点体力上限并摸一张牌，然后你于此阶段内手牌中的锦囊牌均视为雷【杀】且你使用雷【杀】无次数限制。',
  },
  {
    source: 'liu_jieying_description',
    target:
      '<b>锁定技</b>，游戏开始时，你横置；当你重置前，你防止之；所有处于“连环状态”的角色的手牌上限+2；结束阶段开始时，你横置一名角色。',
  },

  {
    source: 'junlve_description',
    target: '<b>锁定技</b>，当你受到或造成1点伤害后，你获得一个“军略”标记。',
  },
  {
    source: 'cuike_description',
    target:
      '出牌阶段开始时，若“军略”数量为奇数，你可以对一名角色造成1点伤害；若“军略”数量为偶数，你可以横置一名角色并弃置其区域里的一张牌。若“军略”数量超过7个，你可以移去全部“军略”标记并对所有其他角色造成1点伤害。',
  },
  {
    source: 'zhanhuo_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以移去全部“军略”标记，令至多等量的已横置角色弃置所有装备区里的牌，然后对其中一名角色造成1点火焰伤害。',
  },

  {
    source: 'duorui_description',
    target:
      '当你于出牌阶段对其他角色造成伤害后，你可以废除一个装备栏，然后选择其武将牌上的一项技能（限定技、觉醒技和主公技除外），令其于其下回合结束之前此技能无效，且你于其下回合结束或其死亡之前拥有此技能且不能发动“夺锐”。',
  },
  {
    source: 'zhiti_description',
    target:
      '<b>锁定技</b>，你攻击范围内已受伤的角色的手牌上限-1；当你使用【决斗】对你攻击范围内已受伤的角色造成伤害后，你与这些角色拼点赢后，或你受到这些角色造成的伤害后，你恢复一个装备栏。',
  },

  {
    source: 'poxi_description',
    target:
      '出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以弃置你与其共计四张花色各不相同的手牌。若你以此法弃置你的牌数为：0，你减1点体力上限；1，你结束此阶段且本回合手牌上限-1；3，你回复1点体力；4，你摸四张牌。',
  },
  {
    source: 'jieying_description',
    target:
      '回合开始时，若场上没有“营”，你获得一枚“营”标记；结束阶段开始时，你可以将“营”移至其他角色；你令有“营”的角色于其摸牌阶段多摸一张牌、使用【杀】的次数上限+1、手牌上限+1；有“营”的其他角色的结束阶段开始时，你移去其“营”，然后获得其所有手牌。',
  },

  {
    source: 'god_huishi_description',
    target:
      '出牌阶段限一次，若你的体力上限小于10，你可以判定，若结果与你此次“慧识”中的其它判定结果花色均不同，且你体力上限小于10，你可以加1点体力上限并重复此流程。最后你将所有仍在弃牌堆中的判定牌交给一名角色，若其手牌数为全场最多，你减1点体力上限。',
  },
  {
    source: 'god_tianyi_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若所有存活角色均在本局游戏内受到过伤害，你加2点体力上限并回复1点体力，令一名角色获得技能“佐幸”。',
  },
  {
    source: 'god_huishi_sec_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以选择一名角色，若其有未发动过的觉醒技，且你的体力上限不小于存活角色数，你选择其一项觉醒技，令此技能于其触发时机无视其条件发动；否则其摸四张牌。最后你减2点体力上限。',
  },
  {
    source: 'zuoxing_description',
    target:
      '准备阶段开始时，若场上有体力上限大于1的神郭嘉存活，你可以令其中一名减1点体力上限，然后你于本回合的出牌阶段限一次，你可以视为使用任意一张普通锦囊牌。',
  },

  {
    source: 'dulie_description',
    target: '<b>锁定技</b>，当你成为体力值大于你的角色使用【杀】的目标时，你判定，若结果为红桃，取消之。',
  },
  {
    source: 'powei_description',
    target:
      '<b>使命技</b>，游戏开始时，你令所有没有“围”的其他角色各获得一枚“围”标记；有“围”标记的角色的回合开始时，你可以选择一项，令你于本回合内视为处于其攻击范围内：1.弃置一张手牌，对其造成1点伤害；2.若其体力值不大于你，你获得其一张手牌。回合开始时，你令所有有“围”标记的角色将其“围”标记移至除你外的下家角色。<br><b>成功</b>：回合开始时，若场上没有“围”标记，你获得技能“神著”。<br><b>失败</b>：当你进入濒死状态时，若你的体力小于0，你将体力回复至1点，然后你移去场上的所有“围”标记，并弃置你装备区里的所有牌。',
  },
  {
    source: 'shenzhuo_description',
    target:
      '<b>锁定技</b>，当你使用非转化和非虚拟的【杀】结算结束后，你选择一项：1.摸一张牌，于本回合内使用【杀】的次数上限+1；2.摸三张牌，于本回合内不能使用【杀】。',
  },
  {
    source: 'dangmo_description',
    target: '当你于出牌阶段内首次使用【杀】声明指定目标后，你可以为此【杀】额外选择一至X名目标（X为你的体力值-1）。',
  },

  {
    source: 'yingba_description',
    target:
      '出牌阶段限一次，你可以令体力上限大于1的一名其他角色减1点体力上限并获得1枚“平定”标记，然后你减1点体力上限；你对有“平定”标记的角色使用牌无距离限制。',
  },
  {
    source: 'god_fuhai_description',
    target:
      '<b>锁定技</b>，当你使用牌时，你令目标中有“平定”标记的角色不可响应此牌；当你使用牌指定有“平定”标记的角色为目标时，你摸一张牌（每回合限两次）；当有“平定”标记的其他角色死亡时，你加等同于其“平定”标记数的体力上限，并摸等量的牌。',
  },
  {
    source: 'pinghe_description',
    target:
      '<b>锁定技</b>，你的手牌上限基值等同于你已损失的体力值；当你受到其他角色造成的伤害时，若你有手牌且体力上限大于1，防止此伤害，你减1点体力上限并将一张手牌交给一名其他角色，令伤害来源获得一枚“平定”标记。',
  },
  {
    source: 'tianzuo_description',
    target: '<b>锁定技</b>，①游戏开始时，将8张【奇正相生】加入牌堆；②【奇正相生】对你无效。',
  },
  {
    source: 'lingce_description',
    target:
      '<b>锁定技</b>，当一名角色使用非虚拟非转化的锦囊牌时，若此牌为智囊牌、“定汉”已记录的牌或【奇正相生】，你摸一张牌。',
  },
  {
    source: 'dinghan_description',
    target:
      '①当你成为未被记录的锦囊牌的目标时，你记录此牌名，然后取消之；②回合开始时，你可以在“定汉”的记录中增加或移出一种锦囊牌的牌名。',
  },
  {
    source: 'tianren_description',
    target:
      '<b>锁定技</b>，当一张基本牌或普通锦囊牌不是因使用而置入弃牌堆后，你获得1个“天任”标记，然后若“天任”标记数不小于X，你移去X个“天任”标记，加1点体力上限并摸两张牌（X为你的体力上限）。',
  },
  {
    source: 'jiufa_description',
    target:
      '当你每累计使用或打出九张不同牌名的牌后，你可以亮出牌堆顶的九张牌，然后若其中有点数相同的牌，你选择并获得其中每个重复点数的牌各一张。',
  },
  {
    source: 'pingxiang_description',
    target:
      '<b>限定技</b>，出牌阶段，若你的体力上限大于9，你可以减9点体力上限，然后你视为使用至多九张不计入次数限制的火【杀】。若如此做，你失去技能“九伐”且本局游戏内你的手牌上限等于体力上限。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$wushen:1',
    target: '取汝狗头，犹如探囊取物！',
  },
  {
    source: '$wushen:2',
    target: '还不速速领死！',
  },
  {
    source: '$wuhun:1',
    target: '拿命来！',
  },
  {
    source: '$wuhun:2',
    target: '谁来与我同去？',
  },

  {
    source: '$gongxin:1',
    target: '攻城为下，攻心为上。',
  },
  {
    source: '$gongxin:2',
    target: '我替施主把把脉。',
  },
  {
    source: '$shelie:1',
    target: '什么都略懂一点，生活更多彩一些。',
  },
  {
    source: '$shelie:2',
    target: '略懂，略懂。',
  },

  {
    source: '$qinyin:1',
    target: '（柔和的琴声）',
  },
  {
    source: '$qinyin:2',
    target: '（急促的琴声）',
  },
  {
    source: '$yeyan:1',
    target: '（燃烧声）让这熊熊业火，焚尽你的罪恶！',
  },
  {
    source: '$yeyan:2',
    target: '（燃烧声）聆听吧，这献给你的镇魂曲！',
  },

  {
    source: '$qixing:1',
    target: '祈星辰之力，佑我蜀汉！',
  },
  {
    source: '$qixing:2',
    target: '伏望天恩，誓讨汉贼！',
  },
  {
    source: '$kuangfeng:1',
    target: '风~~~起~~~！',
  },
  {
    source: '$kuangfeng:2',
    target: '万事俱备，只欠业火。',
  },
  {
    source: '$dawu:1',
    target: '此计，可保你一时平安。',
  },
  {
    source: '$dawu:2',
    target: '此非万全之策，惟惧天雷。',
  },

  {
    source: '$guixin:1',
    target: '山不厌高，海不厌深。',
  },
  {
    source: '$guixin:2',
    target: '周公吐哺，天下归心。',
  },

  {
    source: '$kuangbao:1',
    target: '哼！',
  },
  {
    source: '$kuangbao:2',
    target: '嗯~~~~',
  },
  {
    source: '$wumou:1',
    target: '不管这些了！',
  },
  {
    source: '$wumou:2',
    target: '哪个说我有勇无谋？',
  },
  {
    source: '$wuqian:1',
    target: '天王老子也保不住你！',
  },
  {
    source: '$wuqian:2',
    target: '看我神威！无坚不摧！',
  },
  {
    source: '$shenfen:1',
    target: '这，才是活生生的地狱！',
  },
  {
    source: '$shenfen:2',
    target: '凡人们，颤抖吧！这是神之怒火！',
  },

  {
    source: '$renjie:1',
    target: '忍一时，风平浪静。',
  },
  {
    source: '$renjie:2',
    target: '退一步，海阔天空。',
  },
  {
    source: '$baiyin:1',
    target: '老骥伏枥，志在千里。',
  },
  {
    source: '$baiyin:2',
    target: '烈士暮年，壮心不已。',
  },
  {
    source: '$lianpo:1',
    target: '一鼓作气，破敌制胜！',
  },
  {
    source: '$lianpo:2',
    target: '受命于天，既寿永昌！',
  },

  {
    source: '$juejing:1',
    target: '置于死地，方能后生！',
  },
  {
    source: '$juejing:2',
    target: '背水一战，不胜便死！',
  },
  {
    source: '$longhun:1',
    target: '常山赵子龙在此！',
  },
  {
    source: '$longhun:2',
    target: '能屈能伸，才是大丈夫！',
  },

  {
    source: '$longnu:1',
    target: '龙意怒火，汝皆不能逃脱！',
  },
  {
    source: '$longnu:2',
    target: '龙怒降临，岂是尔等凡人可抗！',
  },
  {
    source: '$liu_jieying:1',
    target: '结草衔环，报兄弟大恩！',
  },
  {
    source: '$liu_jieying:2',
    target: '桃园结义，营一世之交！',
  },

  {
    source: '$junlve:1',
    target: '军略绵腹，制敌千里。',
  },
  {
    source: '$junlve:2',
    target: '文韬武略兼备，方可破敌如破竹。',
  },
  {
    source: '$cuike:1',
    target: '克险摧难，军略当先。',
  },
  {
    source: '$cuike:2',
    target: '摧敌心神，克敌计谋。',
  },
  {
    source: '$zhanhuo:1',
    target: '业火映东水，吴志绽敌营。',
  },
  {
    source: '$zhanhuo:2',
    target: '绽东吴业火，烧敌军数千。',
  },

  {
    source: '$duorui:1',
    target: '夺敌军锐气，杀敌方士气！',
  },
  {
    source: '$duorui:2',
    target: '尖锐之势，吾亦可一人夺之。',
  },
  {
    source: '$zhiti:1',
    target: '江东小儿，安敢啼哭？',
  },
  {
    source: '$zhiti:2',
    target: '娃闻名止啼，孙损十万休！',
  },

  {
    source: '$poxi:1',
    target: '夜袭敌军，挫其锐气！',
  },
  {
    source: '$poxi:2',
    target: '受主知遇，袭敌不惧。',
  },
  {
    source: '$jieying:1',
    target: '裹甲衔枚，劫营如入无人之境！',
  },
  {
    source: '$jieying:2',
    target: '劫营速战，措手不及！',
  },

  {
    source: '$god_huishi:1',
    target: '聪以知远，明以察微。',
  },
  {
    source: '$god_huishi:2',
    target: '见微知著，识人心志。',
  },
  {
    source: '$god_tianyi:1',
    target: '天命靡常，惟德是辅。',
  },
  {
    source: '$god_tianyi:2',
    target: '可成吾志者，必此人也。',
  },
  {
    source: '$god_huishi_sec:1',
    target: '丧家之犬，主公实不足虑也。',
  },
  {
    source: '$god_huishi_sec:2',
    target: '时势兼备，主公复有何忧？',
  },
  {
    source: '$zuoxing:1',
    target: '以聪虑难，悉咨于上。',
  },
  {
    source: '$zuoxing:2',
    target: '奉孝不才，愿献勤心。',
  },

  {
    source: '$dulie:1',
    target: '素来言出必践，成吾信义昭彰。',
  },
  {
    source: '$dulie:2',
    target: '小信如若不成，大信将以何立？',
  },
  {
    source: '$powei:1',
    target: '弓马齐射洒热血，突破重围显英豪！',
  },
  {
    source: '$powei:2',
    target: '敌军尚有严防，有待明日再看！',
  },
  {
    source: '$powei:3',
    target: '君且城中等候，待吾探敌虚实。',
  },
  {
    source: '$dangmo:1',
    target: '魔高一尺，道高一丈！',
  },
  {
    source: '$dangmo:2',
    target: '天魔祸世，吾自荡而除之！',
  },
  {
    source: '$shenzhuo:1',
    target: '力引强弓百斤，矢出贯手着棼！',
  },
  {
    source: '$shenzhuo:2',
    target: '箭既已在弦上，吾又岂能不发！',
  },

  {
    source: '$yingba:1',
    target: '从我者可免，拒我者难容！',
  },
  {
    source: '$yingba:2',
    target: '卧榻之侧，岂容他人鼾睡！',
  },
  {
    source: '$god_fuhai:1',
    target: '翻江覆蹈海，六合定乾坤！',
  },
  {
    source: '$god_fuhai:2',
    target: '力攻平江东，威名扬天下！',
  },
  {
    source: '$pinghe:1',
    target: '不过胆小鼠辈，吾等有何惧哉？',
  },
  {
    source: '$pinghe:2',
    target: '只可得胜而返，岂能败战而归！',
  },
];

export const conversations: Word[] = [
  { source: 'qixing: please select cards to save', target: '七星：请选择需要保留为手牌的牌' },

  { source: 'liu_jieying: please choose a target to chain on', target: '结营：请选择一名角色横置' },

  {
    source: '{0}: please choose a skill to nullify and you obtain it until the end of target’s turn',
    target: '{0}：请选择一项技能，直到其下回合结束，其此技能失效，且你拥有此技能',
  },

  {
    source: '{0}: please choose and resume an equip section',
    target: '{0}：请选择一个装备栏恢复',
  },

  {
    source: '{0}: do you want to gain a max hp and judge again?',
    target: '{0}：你可以加1点体力上限并判定',
  },
  {
    source: '{0}: please choose a target to gain these cards',
    target: '{0}：请将这些牌交给一名角色',
  },

  {
    source: 'god_tianyi:please choose a target to obtain ‘Zuo Xing’',
    target: '天翊：请选择一名角色获得技能“佐幸”',
  },

  {
    source: '{0}: please choose god_huishi_sec options: {1}',
    target: '请选择 {1} 的以下一项觉醒技',
  },

  {
    source: '{0}: do you want to let God Guo Jia loses 1 max hp? Then you can use virtual trick this turn',
    target: '{0}：你可以令“神郭嘉”减1点体力上限，然后你于本回合的出牌阶段限一次，可视为使用任意普通锦囊牌',
  },
  {
    source: 'zuoxing: please choose a God Guo Jia to lose 1 max hp',
    target: '佐幸：请选择一名“神郭嘉”减1点体力上限',
  },

  {
    source: '{0}: please choose powei options: {1}',
    target: '{0}：目标角色 {1}',
  },
  { source: 'powei:dropCard', target: '弃置一张手牌，对其造成1点伤害' },
  { source: 'powei:prey', target: '获得其一张手牌' },

  {
    source: '{0}: please choose shenzhuo options',
    target: '{0}：请选择以下一项',
  },
  { source: 'shenzhuo:drawOne', target: '摸一张牌，本回合使用【杀】次数+1' },
  { source: 'shenzhuo:drawThree', target: '摸三张牌，本回合不能使用【杀】' },

  {
    source: 'pinghe: please give a handcard to another player',
    target: '冯河：请交给一名其他角色一张手牌',
  },
  {
    source: '{0} used skill {1}, which has been removed from target list of {2}',
    target: '{0} 使用了技能【{1}】，{0} 从 {2} 的目标中移除',
  },
  { source: '{0}: please choose a dinghan option', target: '{0}：请选择以下一项加入或移出定汉记录' },
  { source: '{0} shuffled 8 {1} cards into the draw stack', target: '{0} 将八张【{1}】洗入了摸牌堆' },

  { source: 'please choose one target to use fire slash', target: '请选择【火杀】的目标' },
];
