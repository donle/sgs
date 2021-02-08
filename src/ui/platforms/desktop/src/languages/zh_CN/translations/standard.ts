import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'caocao', target: '曹操' },
  { source: 'hujia', target: '护驾' },
  { source: 'jianxiong', target: '奸雄' },

  { source: 'simayi', target: '司马懿' },
  { source: 'fankui', target: '反馈' },
  { source: 'guicai', target: '鬼才' },

  { source: 'xiahoudun', target: '夏侯惇' },
  { source: 'ganglie', target: '刚烈' },
  { source: 'qingjian', target: '清俭' },

  { source: 'zhangliao', target: '张辽' },
  { source: 'tuxi', target: '突袭' },

  { source: 'xuchu', target: '许褚' },
  { source: 'luoyi', target: '裸衣' },
  { source: '#luoyi', target: '裸衣' },

  { source: 'guojia', target: '郭嘉' },
  { source: 'tiandu', target: '天妒' },
  { source: 'yiji', target: '遗计' },
  { source: '#yiji', target: '遗计' },

  { source: 'zhenji', target: '甄姬' },
  { source: 'luoshen', target: '洛神' },
  { source: '#luoshen', target: '洛神' },
  { source: 'qingguo', target: '倾国' },

  { source: 'lidian', target: '李典' },
  { source: 'xunxun', target: '恂恂' },
  { source: 'wangxi', target: '忘隙' },

  { source: 'caozhang', target: '曹彰' },
  { source: 'jiangchi', target: '将驰' },

  { source: 'liubei', target: '刘备' },
  { source: 'rende', target: '仁德' },
  { source: 'jijiang', target: '激将' },
  { source: '#jijiang', target: '激将' },

  { source: 'guanyu', target: '关羽' },
  { source: 'wusheng', target: '武圣' },
  { source: 'yijue', target: '义绝' },
  { source: '#yijue', target: '义绝' },

  { source: 'zhangfei', target: '张飞' },
  { source: 'paoxiao', target: '咆哮' },
  { source: 'tishen', target: '替身' },

  { source: 'zhugeliang', target: '诸葛亮' },
  { source: 'guanxing', target: '观星' },
  { source: 'kongcheng', target: '空城' },

  { source: 'zhaoyun', target: '赵云' },
  { source: 'longdan', target: '龙胆' },
  { source: 'yajiao', target: '涯角' },

  { source: 'machao', target: '马超' },
  { source: 'mashu', target: '马术' },
  { source: 'tieji', target: '铁骑' },

  { source: 'huangyueying', target: '黄月英' },
  { source: 'jizhi', target: '集智' },
  { source: '#jizhi', target: '集智' },
  { source: 'qicai', target: '奇才' },

  { source: 'yiji_c', target: '伊籍' },
  { source: 'jijie', target: '机捷' },
  { source: 'jiyuan', target: '急援' },

  { source: 'jiexushu', target: '界徐庶' },
  { source: 'zhuhai', target: '诛害' },
  { source: 'qianxin', target: '潜心' },
  { source: 'jianyan', target: '荐言' },

  { source: 'sunquan', target: '孙权' },
  { source: 'zhiheng', target: '制衡' },
  { source: 'jiuyuan', target: '救援' },

  { source: 'ganning', target: '甘宁' },
  { source: 'qixi', target: '奇袭' },
  { source: 'fenwei', target: '奋威' },

  { source: 'lvmeng', target: '吕蒙' },
  { source: 'qinxue', target: '勤学' },
  { source: 'keji', target: '克己' },
  { source: 'botu', target: '博图' },

  { source: 'huanggai', target: '黄盖' },
  { source: 'kurou', target: '苦肉' },
  { source: 'zhaxiang', target: '诈降' },

  { source: 'zhouyu', target: '周瑜' },
  { source: 'yingzi', target: '英姿' },
  { source: 'fanjian', target: '反间' },

  { source: 'daqiao', target: '大乔' },
  { source: 'guose', target: '国色' },
  { source: 'liuli', target: '流离' },

  { source: 'luxun', target: '陆逊' },
  { source: 'qianxun', target: '谦逊' },
  { source: 'lianying', target: '连营' },

  { source: 'sunshangxiang', target: '孙尚香' },
  { source: 'jieyin', target: '结姻' },
  { source: 'xiaoji', target: '枭姬' },

  { source: 'huatuo', target: '华佗' },
  { source: 'jijiu', target: '急救' },
  { source: 'qingnang', target: '青囊' },

  { source: 'lvbu', target: '吕布' },
  { source: 'wushuang', target: '无双' },
  { source: 'liyu', target: '利驭' },

  { source: 'diaochan', target: '貂蝉' },
  { source: 'lijian', target: '离间' },
  { source: 'biyue', target: '闭月' },

  { source: 'huaxiong', target: '华雄' },
  { source: 'yaowu', target: '耀武' },

  { source: 'yuanshu', target: '袁术' },
  { source: 'wangzun', target: '妄尊' },
  { source: 'tongji', target: '同疾' },

  { source: 'gongsunzan', target: '公孙瓒' },
  { source: 'qiaomeng', target: '趫猛' },
  { source: 'yicong', target: '义从' },
];

export const skillDescriptions: Word[] = [
  { source: 'jianxiong_description', target: '当你受到伤害后，你可以获得对你造成伤害的牌并摸一张牌。' },
  {
    source: 'hujia_description',
    target:
      '<b>主公技</b>，当你需要使用或打出【闪】时，你可以令其他魏势力角色选择是否打出一张【闪】视为由你使用或打出）。',
  },
  { source: 'fankui_description', target: '当你受到1点伤害后，你可以获得伤害来源的一张牌。' },
  { source: 'guicai_description', target: '当一名角色的判定牌生效前，你可以打出一张牌代替之。' },
  {
    source: 'ganglie_description',
    target: '当你受到1点伤害后，你可以进行判定，若结果为：红色，你对伤害来源造成1点伤害；黑色，你弃置其一张牌。',
  },
  {
    source: 'qingjian_description',
    target:
      '每回合限一次，当你于摸牌阶段外获得牌后，你可以展示至少一张牌并将其交给一名其他角色，当前回合角色本回合手牌上限+X（X为你给出牌的类别数）。',
  },
  { source: 'tuxi_description', target: '摸牌阶段，你可以少摸至少一张牌并获得等量的其他角色各一张手牌。' },
  {
    source: 'luoyi_description',
    target:
      '摸牌阶段开始时，你亮出牌堆顶三张牌，然后你可以获得其中的基本牌、武器牌和【决斗】。若如此做，你放弃摸牌，且你为伤害来源的【杀】或【决斗】造成的伤害+1直到你的下回合开始。',
  },
  { source: 'tiandu_description', target: '当你的判定牌生效后，你可以获得此牌。' },
  {
    source: 'yiji_description',
    target: '当你受到1点伤害后，你可以摸两张牌，然后你可以将一至两张手牌交给一至两名其他角色。',
  },
  {
    source: 'luoshen_description',
    target:
      '准备阶段开始时，你可以进行判定，当黑色判定牌生效后，你获得之。若结果为黑色，你可以重复此流程。以此法获得的牌本回合不计入手牌上限。',
  },
  { source: 'qingguo_description', target: '你可以将一张黑色手牌当【闪】使用或打出。' },
  {
    source: 'jiangchi_description',
    target:
      '摸牌阶段结束时，你可以选择一项：1.摸一张牌，然后本回合你不能使用或打出【杀】且【杀】不计入手牌上限；2.弃置一张牌，然后本回合你使用【杀】无距离限制且可以多使用一张【杀】。',
  },
  {
    source: 'rende_description',
    target:
      '出牌阶段，你可以将至少一张手牌交给一名本阶段未获得过“仁德”牌的其他角色。当你于本阶段给出第二张“仁德”牌时，你可以视为使用一张基本牌。',
  },
  {
    source: 'xunxun_description',
    target: '摸牌阶段开始时，你可以观看牌堆顶四张牌，将其中两张牌置于牌堆顶，其余两张牌置于牌堆底。',
  },
  {
    source: 'wangxi_description',
    target: '当你对其他角色造成1点伤害或受到其他角色造成的1点伤害后，若其存活，你可以与其各摸一张牌。',
  },
  {
    source: 'jijiang_description',
    target:
      '<b>主公技</b>，当你需要使用或打出【杀】时，你可以令其他蜀势力角色选择是否打出一张【杀】（视为由你使用或打出）。',
  },
  { source: 'wusheng_description', target: '你可以将一张红色牌当【杀】使用或打出；你使用方块【杀】无距离限制。' },
  {
    source: 'yijue_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌，然后令一名其他角色展示一张手牌。若此牌为：黑色，则其本回合内非锁定技失效且不能使用或打出手牌，你对其使用的红桃【杀】伤害+1；红色，则你获得此牌，然后你可令该角色回复1点体力。',
  },
  {
    source: 'paoxiao_description',
    target:
      '<b>锁定技</b>，你使用【杀】无次数限制；若你使用的【杀】被抵消，则当你于此回合内使用【杀】造成下一次伤害时，此伤害+1。',
  },
  {
    source: 'tishen_description',
    target: '<b>限定技</b>，准备阶段开始时，你可以将体力回复至体力上限，然后摸X张牌（X为你以此法回复的体力值）。',
  },
  {
    source: 'guanxing_description',
    target:
      '准备阶段，你可以观看牌堆顶的五张牌（存活人数小于四时改为三张），然后以任意顺序放回牌堆顶或牌堆底。若你将这些牌均放至牌堆底，则结束阶段开始时你可以再发动一次“观星”。',
  },
  { source: 'kongcheng_description', target: '<b>锁定技</b>，若你没有手牌，你不能成为【杀】或【决斗】的目标。' },
  {
    source: 'longdan_description',
    target: '你可以将一张【杀】当【闪】、【闪】当【杀】、【桃】当【酒】、【酒】当【桃】使用或打出。',
  },
  {
    source: 'yajiao_description',
    target:
      '当你于回合外使用或打出手牌时，你可以展示牌堆顶一张牌，若此牌与你使用或打出的牌类别：相同，你可以将之交给一名角色；不同，你可以弃置攻击范围内含有你的一名角色区域内的一张牌。',
  },
  { source: 'mashu_description', target: '<b>锁定技</b>，你计算与其他角色的距离-1。' },
  {
    source: 'tieji_description',
    target:
      '当你使用【杀】指定目标后，你可令其本回合内非锁定技失效，然后你进行判定，除非其弃置与结果花色相同的一张牌，否则不能使用【闪】响应此【杀】。',
  },
  {
    source: 'jizhi_description',
    target: '当你使用锦囊牌时，你可以摸一张牌。若以此法摸的牌为基本牌，你可以弃置此牌令你于本回合内手牌上限+1。',
  },
  {
    source: 'qicai_description',
    target:
      '<b>锁定技</b>，你使用锦囊牌无距离限制；当你装备区里的防具或宝物牌因其他角色弃置而移动前，你防止此牌的本次移动。',
  },
  {
    source: 'zhiheng_description',
    target: '出牌阶段限一次，你可以弃置至少一张牌，然后摸等量的牌。若你以此法弃置了所有的手牌，则额外摸一张牌。',
  },
  {
    source: 'jiuyuan_description',
    target:
      '<b>主公技</b>，当其他吴势力角色使用【桃】指定其为目标时，若其体力值大于你，则该角色可以将此【桃】转移给你，然后其摸一张牌。',
  },
  { source: 'qixi_description', target: '你可以将一张黑色牌当【过河拆桥】使用。' },
  {
    source: 'fenwei_description',
    target: '<b>限定技</b>，当一张锦囊牌指定多个目标后，你可令此牌对其中至少一个目标无效。',
  },
  {
    source: 'qinxue_description',
    target:
      '<b>觉醒技</b>，准备阶段，若你的手牌数与你的体力值之差不小于3（若游戏人数不小于7则改为2），你减1点体力上限，然后获得"攻心"。',
  },
  { source: 'keji_description', target: '若你未于出牌阶段内使用或打出过【杀】，则你可以跳过弃牌阶段。' },
  {
    source: 'botu_description',
    target: '回合结束后，若你于出牌阶段内使用过四种花色的牌，则你可以获得一个额外的回合。',
  },
  { source: 'kurou_description', target: '出牌阶段限一次，你可以弃置一张牌，然后失去1点体力。' },
  {
    source: 'zhaxiang_description',
    target:
      '<b>锁定技</b>，当你失去1点体力后，你摸三张牌。若此时是你的出牌阶段，则此阶段内你使用红色【杀】无距离限制且不能被【闪】响应，且你使用【杀】的次数上限+1。',
  },
  {
    source: 'yingzi_description',
    target: '<b>锁定技</b>，摸牌阶段，你多摸一张牌；你的手牌上限等于X（X为你的体力上限）。',
  },
  {
    source: 'fanjian_description',
    target:
      '出牌阶段限一次，你可以展示一张手牌并交给一名其他角色，其选择一项：1.展示所有手牌，弃置与此牌同花色的牌；2.失去1点体力。',
  },
  {
    source: 'guose_description',
    target:
      '出牌阶段限一次，你选择一项，然后摸一张牌：1.将一张方块牌当【乐不思蜀】使用；2.弃置一张方块牌并弃置场上的一张【乐不思蜀】。',
  },
  {
    source: 'liuli_description',
    target:
      '当你成为【杀】的目标时，你可以弃置一张牌并选择你攻击范围内的一名其他角色（不能是此【杀】的使用者），然后将此【杀】转移给该角色。',
  },
  {
    source: 'qianxun_description',
    target: '当其他角色使用的锦囊牌对你生效时，若你是唯一目标，则你可以将所有手牌移出游戏直到回合结束。',
  },
  {
    source: 'lianying_description',
    target: '当你失去最后的手牌后，你可以令一至X名角色各摸一张牌（X为你失去的手牌数）。',
  },
  {
    source: 'jieyin_description',
    target:
      '出牌阶段限一次，你可以选择一名男性角色，并弃置一张手牌或将一张装备牌置入其装备区，然后你与其体力值较高的角色摸一张牌，体力值较低的角色回复1点体力。',
  },
  { source: 'xiaoji_description', target: '当你失去装备区里的一张牌后，你可以摸两张牌。' },
  { source: 'jijiu_description', target: '你的回合外，你可以将一张红色牌当【桃】使用。' },
  {
    source: 'qingnang_description',
    target:
      '出牌阶段限一次，你可以弃置一张手牌，并令一名本回合未以此法选择过的角色回复1点体力。若你弃置的牌为红色，则可以再次发动此技能。',
  },
  {
    source: 'wushuang_description',
    target:
      '<b>锁定技</b>，当你使用【杀】指定一个目标后，该角色需依次使用两张【闪】才能抵消此【杀】；当你使用【决斗】指定一个目标后，或成为一名角色使用【决斗】的目标后，该角色每次响应此【决斗】需依次打出两张【杀】。',
  },
  {
    source: 'liyu_description',
    target:
      '当你使用【杀】对一名其他角色造成伤害后，你可获得其区域里的一张牌。然后若获得的牌：不为装备牌，其摸一张牌；为装备牌，则视为你对由其指定的另一名角色使用一张【决斗】。',
  },
  {
    source: 'lijian_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌并依次选择两名男性角色，然后视为第二名男性角色对另一名男性角色使用一张【决斗】。',
  },
  { source: 'biyue_description', target: '结束阶段开始时，你可以摸一张牌。若你没有手牌，则改为摸两张牌。' },
  {
    source: 'yaowu_description',
    target: '<b>锁定技</b>，当你受到伤害时，若造成伤害的牌：为红色，伤害来源摸一张牌；不为红色，你摸一张牌。',
  },
  {
    source: 'wangzun_description',
    target: '锁定技，体力值大于你的角色的准备阶段开始时，你摸一张牌，若其为主公，改为你摸两张牌且其本回合手牌上限-1。',
  },
  {
    source: 'tongji_description',
    target:
      '当其他角色成为【杀】的目标时，若你处于其攻击范围内且你不为此牌的使用者及目标，其可以弃置一张牌，将此【杀】转移给你。',
  },
  {
    source: 'yicong_description',
    target:
      '<b>锁定技</b>，你计算与其他角色的距离-1；若你的体力值不大于2，其他角色计算与你的距离+1。',
  },
  {
    source: 'qiaomeng_description',
    target: '当你使用【杀】对一名角色造成伤害后，你可弃置其区域内的一张牌。若此牌为坐骑牌，你获得之。',
  },
  { source: 'jijie_description', target: '出牌阶段限一次，你可以观看牌堆底一张牌，然后交给一名角色。' },
  { source: 'jiyuan_description', target: '当一名角色进入濒死状态或你交给一名其他角色牌时，你可以令其摸一张牌。' },
  {
    source: 'zhuhai_description',
    target: '其他角色的结束阶段开始时，若其于此回合造成过伤害，你可以对其使用一张无距离限制的【杀】。',
  },
  {
    source: 'qianxin_description',
    target: '<b>觉醒技</b>，当你造成伤害后，若你已受伤，你减1点体力上限并获得技能“荐言”。',
  },
  {
    source: 'jianyan_description',
    target:
      '出牌阶段限一次，你可以声明一种牌的类别或颜色，然后亮出牌堆中第一张符合你声明的牌，并将之交给一名男性角色。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to discard 1 card to transfer the target of {1} to {2}',
    target: '{0}：你可以弃置一张牌将此{1}转移给 {2}',
  },

  {
    source: '{0} used skill {1}, transfer the target of {1} to {2}',
    target: '{0} 使用了技能【{1}】，将{1}的目标转移给 {2}',
  },
];
