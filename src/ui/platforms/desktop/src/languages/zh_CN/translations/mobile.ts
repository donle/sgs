import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'mobile', target: '手杀专属' },

  { source: 'zhuling', target: '朱灵' },
  { source: 'zhanyi', target: '战意' },
  { source: 'zhanyi: {0}', target: '战意[{0}]' },
  { source: '#zhanyi', target: '战意（目标弃牌）' },
  { source: '~side_zhanyi_s', target: '战意' },

  { source: 'simazhao', target: '司马昭' },
  { source: 'daigong', target: '怠攻' },
  { source: 'zhaoxin', target: '昭心' },

  { source: 'wangyuanji', target: '王元姬' },
  { source: 'qianchong', target: '谦冲' },
  { source: '#qianchong', target: '谦冲' },
  { source: 'shangjian', target: '尚俭' },

  { source: 'jiakui', target: '贾逵' },
  { source: 'zhongzuo', target: '忠佐' },
  { source: 'wanlan', target: '挽澜' },

  { source: 'simashi', target: '司马师' },
  { source: 'baiyi', target: '败移' },
  { source: 'jinglve', target: '景略' },
  { source: 'sishi: {0} {1}', target: '死士[{0}{1}]' },
  { source: 'shanli', target: '擅立' },

  { source: 'yanghuiyu', target: '羊徽瑜' },
  { source: 'hongyi', target: '弘仪' },
  { source: '#s_hongyi_debuff', target: '弘仪（判定）' },
  { source: 'quanfeng', target: '劝封' },

  { source: 'maojie', target: '毛玠' },
  { source: 'bingqing', target: '秉清' },
  { source: 'yingfeng', target: '迎奉' },
  { source: 'feng', target: '奉' },

  { source: 'lifeng', target: '李丰' },
  { source: 'tunchu', target: '屯储' },
  { source: 'shuliang', target: '输粮' },

  { source: 'dengzhi', target: '邓芝' },
  { source: 'jimeng', target: '急盟' },
  { source: 'shuaiyan', target: '率言' },

  { source: 'mobile_furong', target: '傅肜' },
  { source: 'xuewei', target: '血卫' },
  { source: 'liechi', target: '烈斥' },

  { source: 'hujinding', target: '胡金定' },
  { source: 'renshi', target: '仁释' },
  { source: 'wuyuan', target: '武缘' },
  { source: 'huaizi', target: '怀子' },

  { source: 'fuqian', target: '傅佥' },
  { source: 'poxiang', target: '破降' },
  { source: 'jueyong', target: '绝勇' },

  { source: 'lingcao', target: '凌操' },
  { source: 'dujin', target: '独进' },

  { source: 'sunru', target: '孙茹' },
  { source: 'yingjian', target: '影箭' },
  { source: 'shixin', target: '释衅' },

  { source: 'liuzan', target: '留赞' },
  { source: 'fenyin', target: '奋音' },

  { source: 'yangbiao', target: '杨彪' },
  { source: 'zhaohan', target: '昭汉' },
  { source: 'rangjie', target: '让节' },
  { source: 'mobile_yizheng', target: '义争' },

  { source: 'qunsufei', target: '群苏飞' },
  { source: 'zhengjian', target: '诤荐' },
  { source: 'zhengjian count: {0}', target: '诤荐[{0}]' },
  { source: 'gaoyuan', target: '告援' },

  { source: 'xing_ganning', target: '星甘宁' },
  { source: 'jinfan', target: '锦帆' },
  { source: 'sheque', target: '射却' },

  { source: 'gongsunkang', target: '公孙康' },
  { source: 'juliao', target: '据辽' },
  { source: 'taomie', target: '讨灭' },

  { source: 'mayuanyi', target: '马元义' },
  { source: 'jibing', target: '集兵' },
  { source: 'wangjing', target: '往京' },
  { source: 'moucuan', target: '谋篡' },
  { source: 'binghuo', target: '兵祸' },

  { source: 'yanpu', target: '阎圃' },
  { source: 'huantu', target: '缓图' },
  { source: '#huantu', target: '缓图（选择）' },
  { source: 'bihuo', target: '避祸' },
  { source: 'bihuo distance: {0}', target: '避祸+{0}' },

  { source: 'xing_huangzhong', target: '星黄忠' },
  { source: 'shidi', target: '势敌' },
  { source: 'xing_yishi', target: '义释' },
  { source: 'qishe', target: '骑射' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhanyi_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌，然后失去1点体力。若你以此法弃置的牌为：基本牌，你于此阶段内可将一张基本牌当任意基本牌使用，且使用的下一张基本牌的伤害基值或回复值+1；锦囊牌，你摸三张牌，且你于此阶段内使用普通锦囊牌不可被【无懈可击】响应；装备牌，当你于此阶段内使用【杀】指定唯一目标后，其须弃置两张牌，然后你获得其中一张牌。',
  },
  {
    source: 'side_zhanyi_s_description',
    target: '你可以将一张基本牌当任意基本牌使用。',
  },

  {
    source: 'daigong_description',
    target:
      '每回合限一次，当你受到伤害时，你可以展示所有手牌并令伤害来源选择一项：1.交给你一张与你展示的所有牌花色均不同的牌；2.防止此伤害。',
  },
  {
    source: 'zhaoxin_description',
    target:
      '出牌阶段限一次，若X大于0，你可以将一至X张牌置于你的武将牌上，称为“望”，然后摸等量的牌（X为3减去你的“望”数之差）；你或在你攻击范围内的角色的摸牌阶段结束时，其可以获得你的一张“望”，然后你可以对其造成1点伤害。',
  },

  {
    source: 'qianchong_description',
    target:
      '<b>锁定技</b>，若你装备区里有牌且均为：红色牌，你视为拥有技能“明哲”；黑色牌，你视为拥有技能“帷幕”。出牌阶段开始时，若你的装备区里的没有牌，或装备区里的牌颜色不同，你选择一种类别，于本回合内使用此类别的牌无距离和次数限制。',
  },
  {
    source: 'shangjian_description',
    target: '一名角色的结束阶段开始时，若X不大于你的体力值，你可以摸X张牌（X为你于本回合内失去过的牌数）。',
  },

  {
    source: 'zhongzuo_description',
    target:
      '一名角色的结束阶段开始时，若你于此回合内造成或受到过伤害，你可以令一名角色摸两张牌，然后若其已受伤，你摸一张牌。',
  },
  {
    source: 'wanlan_description',
    target:
      '<b>限定技</b>，当一名角色进入濒死状态时，若其体力不大于0，你可以发动此技能，弃置所有手牌，并令其将体力回复至1点，然后你于此濒死结算结束后对当前回合角色造成1点伤害。',
  },

  {
    source: 'baiyi_description',
    target: '<b>限定技</b>，出牌阶段，若你已受伤，你可以令两名其他角色交换座次。',
  },
  {
    source: 'jinglve_description',
    target:
      '出牌阶段限一次，若场上没有“死士”牌，你可以观看一名其他角色的手牌，并选择其中一张标记为“死士”牌。若如此做，当其使用“死士”牌时，你取消此牌的所有目标；当“死士”牌不因使用而进入弃牌堆后，或其回合结束时“死士”牌仍在其区域内，你获得之。',
  },
  {
    source: 'shanli_description',
    target:
      '<b>觉醒技</b>，准备阶段开始时，若你已发动过“败移”，且对至少两名角色发动过“景略”，你减1点体力上限，令一名角色获得由你选择的一项主公技（三选一）。',
  },

  {
    source: 'hongyi_description',
    target:
      '出牌阶段限一次，你可以选择一名其他角色，直到你的下个回合开始前，当该角色造成伤害时，其判定，若结果为：红色，受伤角色摸一张牌；黑色，此伤害-1。',
  },
  {
    source: 'quanfeng_description',
    target:
      '<b>限定技</b>，当其他角色死亡后，你可以失去技能“弘仪”，然后你加1点体力上限并回复1点体力，获得该角色武将牌上的所有技能；当你处于濒死状态时，你可以加2点体力上限，然后回复4点体力。',
  },

  {
    source: 'bingqing_description',
    target:
      '当你于出牌阶段内首次使用一种花色的牌结算结束后，根据你于此阶段内使用过已结算结束的牌的花色数，你可以执行对应效果：两种，令一名角色摸两张牌；三种，弃置一名角色区域里的一张牌；四种，对一名其他角色造成1点伤害。',
  },

  {
    source: 'tunchu_description',
    target:
      '摸牌阶段，若你没有“粮”，你可以多摸两张牌，然后你可以将至少一张手牌置于你的武将牌上，称为“粮”；若你有“粮”，你不能使用【杀】。',
  },
  {
    source: 'shuliang_description',
    target: '一名角色的结束阶段开始时，若其手牌数小于其体力值，你可以移去一张“粮”，令其摸两张牌。',
  },

  {
    source: 'xuewei_description',
    target:
      '准备阶段开始时，你可以选择一名其他角色（仅对你可见）。当该角色于此时至你的下个回合开始期间受到第一次伤害时，你防止此伤害，受到同伤害来源的等量伤害（伤害来源死亡则改为无伤害来源），然后你对伤害来源造成等量的同属性伤害。',
  },
  {
    source: 'liechi_description',
    target: '<b>锁定技</b>，当你进入濒死状态时，若有令你进入濒死状态的角色，其弃置一张手牌。',
  },

  {
    source: 'jimeng_description',
    target: '出牌阶段开始时，你可以获得一名其他角色的一张牌，然后交给其X张牌（X为你的体力值）。',
  },
  {
    source: 'shuaiyan_description',
    target: '弃牌阶段开始时，若你的手牌数大于1，你可以展示所有手牌，令一名其他角色交给你一张牌。',
  },

  {
    source: 'renshi_description',
    target: '<b>锁定技</b>，当你受到【杀】造成的伤害时，若你已受伤，你防止此伤害并获得此【杀】。',
  },
  {
    source: 'wuyuan_description',
    target:
      '出牌阶段限一次，你可以将一张【杀】交给一名其他角色，然后你回复1点体力，其摸一张牌（若此【杀】为红色，改为摸两张牌）。若此【杀】为属性【杀】，你回复1点体力。',
  },
  {
    source: 'huaizi_description',
    target: '<b>锁定技</b>，你的手牌上限基值等同于你的体力上限。',
  },

  {
    source: 'poxiang_description',
    target:
      '出牌阶段限一次，你可以将一张牌交给一名其他角色，然后你摸三张牌（这些牌于本回合内不计入你的手牌上限），移去你的所有“绝”并失去1点体力。',
  },
  {
    source: 'jueyong_description',
    target:
      '<b>锁定技</b>，当你成为不因“绝勇”而使用的非虚拟且非转化的牌（【桃】和【酒】除外）的唯一目标时，若你的“绝”数小于你的体力值，取消之，然后你将此牌置于你的武将牌上，称为“绝”；结束阶段开始时，若你有“绝”，则按“绝”的置入顺序依次由原使用者对你使用此“绝”（若原使用者已阵亡，则改为移去此“绝”）。',
  },

  {
    source: 'dujin_description',
    target: '摸牌阶段，你可以多摸X+1张牌（X为你装备区里牌数的一半，向下取整）。',
  },

  {
    source: 'yingjian_description',
    target: '准备阶段开始时，你可以视为使用一张无距离限制的【杀】。',
  },
  {
    source: 'shixin_description',
    target: '<b>锁定技</b>，当你受到火焰伤害时，防止之。',
  },

  {
    source: 'fenyin_description',
    target: '当你于出牌阶段内使用牌时，若此牌的颜色与你于此阶段内使用过的上一张牌颜色不同，你可以摸一张牌。',
  },

  {
    source: 'zhaohan_description',
    target:
      '<b>锁定技</b>，准备阶段开始时，若你本局游戏内发动过本技能的次数：不大于3，你加1点体力上限并回复1点体力；大于3且小于7，你减1点体力上限。',
  },
  {
    source: 'rangjie_description',
    target:
      '当你受到1点伤害后，你可以选择一项：1.移动场上一张牌；2.随机获得牌堆里一张你指定类别的牌。选择完成后，你摸一张牌。',
  },
  {
    source: 'mobile_yizheng_description',
    target:
      '出牌阶段限一次，你可以与体力值不大于你的一名角色拼点。若你：赢，其跳过其下个摸牌阶段；没赢，你减1点体力上限。',
  },

  {
    source: 'jinfan_description',
    target:
      '弃牌阶段开始时，你可以将至少一张花色各不相同，且与你的所有“铃”花色均不相同的手牌置于你的武将牌上，称为“铃”；你的“铃”可以如手牌般使用或打出；当你的一张“铃”移至其他区域后，你随机获得牌堆里一张花色相同的牌。',
  },
  {
    source: 'sheque_description',
    target: '其他角色的准备阶段开始时，若其装备区里有牌，你可以对其使用一张无视防具的【杀】。',
  },

  {
    source: 'zhengjian_description',
    target:
      '<b>锁定技</b>，结束阶段开始时，你令一名其他角色获得“荐”标记，你的下个回合开始时，你摸X张牌并移去其“荐”（X为其获得此标记后使用或打出过的牌数，至多为其体力上限且不超过5）。',
  },
  {
    source: 'gaoyuan_description',
    target:
      '当你成为【杀】的目标时，你可以弃置一张牌，并将目标转移给一名不为此【杀】使用者且不为目标的有“荐”标记的角色。',
  },

  {
    source: 'juliao_description',
    target: '<b>锁定技</b>，其他角色计算与你的距离+X（X为存活势力数-1）。',
  },
  {
    source: 'taomie_description',
    target:
      '当你对其他角色造成伤害后，或其他角色对你造成伤害后，若其没有“讨灭”标记，你可以发动本技能，移去场上所有“讨灭”标记，令其获得一枚“讨灭”标记；你视为在有“讨灭”标记的其他角色的攻击范围内；当你对有“讨灭”标记的角色造成伤害时，你选择一项：1.令此伤害+1；2.获得其区域内的一张牌；3.依次执行前两项，然后于此伤害流程结算结束后移去其“讨灭”标记。',
  },

  {
    source: 'jibing_description',
    target:
      '摸牌阶段，若你的“兵”少于X张（X为存活势力数），你可以将牌堆顶两张牌置于你的武将牌上，称为“兵”；你可将一张“兵”当【杀】或【闪】使用或打出。',
  },
  {
    source: 'wangjing_description',
    target: '<b>锁定技</b>，当你发动“集兵”使用或打出牌时，若对方是场上体力值最高的角色，你摸一张牌。',
  },
  {
    source: 'moucuan_description',
    target: '<b>觉醒技</b>，准备阶段开始时，若你有至少X张“兵”（X为存活势力数），你减1点体力上限，然后获得技能“兵祸”。',
  },
  {
    source: 'binghuo_description',
    target:
      '一名角色的结束阶段开始时，若你于本回合内发动“集兵”使用或打出过“兵”，你可以令一名角色判定，若结果为黑色，你对其造成1点雷电伤害。',
  },

  {
    source: 'huantu_description',
    target:
      '每轮限一次，你攻击范围内的一名角色的摸牌阶段开始前，你可以交给其一张牌，跳过此阶段。若如此做，于其本回合的下个结束阶段开始时，你选择一项：1.令其回复1点体力并摸两张牌；2.摸三张牌并交给其两张手牌。',
  },
  {
    source: 'bihuo_description',
    target:
      '<b>限定技</b>，当一名角色脱离濒死状态后，你可以令其摸三张牌，且其他角色于本轮内计算与其的距离+X（X为存活角色数）。',
  },

  {
    source: 'shidi_description',
    target:
      '<b>转换技</b>，<b>锁定技</b>，准备阶段开始时，转换为阳；结束阶段开始时，转换为阴；阳：你计算与其他角色的距离-1，你使用的黑色【杀】不可被响应。阴：其他角色计算与你的距离+1，你不可响应其他角色对你使用的红色【杀】。',
  },
  {
    source: 'xing_yishi_description',
    target: '当你对其他角色造成伤害时，你可以令此伤害-1，然后你获得其装备区里的一张牌。',
  },
  {
    source: 'qishe_description',
    target: '你可以将一张装备牌当【酒】使用；你的手牌上限+X（X为你装备区里的牌数）。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$daigong:1',
    target: '不急，只等敌军士气渐怠。',
  },
  {
    source: '$daigong:2',
    target: '敌谋吾已尽料，可以长策縻之。',
  },
  {
    source: '$zhaoxin:1',
    target: '吾心昭昭，何惧天下之口？',
  },
  {
    source: '$zhaoxin:2',
    target: '公此行欲何为，吾自有量度。',
  },

  {
    source: '$zhongzuo:1',
    target: '历经磨难，不改祖国之志！',
  },
  {
    source: '$zhongzuo:2',
    target: '建立功业，惟愿天下早定。',
  },
  {
    source: '$wanlan:1',
    target: '挽狂澜于既倒，扶大厦于将倾！',
  },
  {
    source: '$wanlan:2',
    target: '深受国恩，今日便是报偿之时！',
  },

  {
    source: '$baiyi:1',
    target: '吾不听公休之言，以致需行此策。',
  },
  {
    source: '$baiyi:2',
    target: '诸将无过，且按吾之略再图破敌。',
  },
  {
    source: '$jinglve:1',
    target: '安待良机，自有舍生报吾之时。',
  },
  {
    source: '$jinglve:2',
    target: '察局备健，以保诸事不虞。',
  },
  {
    source: '$shanli:1',
    target: '荡尘涤污，重整河山，便在今日！',
  },
  {
    source: '$shanli:2',
    target: '效伊尹霍光，以反天下清明！',
  },

  {
    source: '$tunchu:1',
    target: '屯粮事大，暂不与尔等计较。',
  },
  {
    source: '$tunchu:2',
    target: '屯粮待战，莫动刀枪。',
  },
  {
    source: '$shuliang:1',
    target: '将军弛劳，酒肉慰劳。',
  },
  {
    source: '$shuliang:2',
    target: '将军，牌来了！',
  },

  {
    source: '$jimeng:1',
    target: '今日之言，皆是为保两国无虞。',
  },
  {
    source: '$jimeng:2',
    target: '天下之势已如水火，还望重修盟好。',
  },
  {
    source: '$shuaiyan:1',
    target: '并魏之日，想来便是两国征战之时。',
  },
  {
    source: '$shuaiyan:2',
    target: '在下所言，至诚至率！',
  },

  {
    source: '$xuewei:1',
    target: '吾主之尊，岂容尔等贼寇近前？',
  },
  {
    source: '$xuewei:2',
    target: '血佑忠魂，身卫英主。',
  },
  {
    source: '$liechi:1',
    target: '吾受汉帝恩，岂容吴贼辱？',
  },
  {
    source: '$liechi:2',
    target: '汉将有死无降，怎会如吴狗一般？',
  },

  {
    source: '$dujin:1',
    target: '带兵十万，不如老夫夺甲一件！',
  },
  {
    source: '$dujin:2',
    target: '轻舟独进，破敌先锋！',
  },

  {
    source: '$yingjian:1',
    target: '翩翩一云端，仿若桃花仙。',
  },
  {
    source: '$yingjian:2',
    target: '没牌，又有何不可能的？',
  },
  {
    source: '$shixin:1',
    target: '释怀之戾气，化君之不悦。',
  },
  {
    source: '$shixin:2',
    target: '星星之火，安能伤我？',
  },

  {
    source: '$zhaohan:1',
    target: '天道昭昭，再兴，如光武，亦可期。',
  },
  {
    source: '$zhaohan:2',
    target: '汉祚将终，我又岂能无憾？',
  },
  {
    source: '$rangjie:1',
    target: '公既执掌权柄，又何必令君臣遭乱？',
  },
  {
    source: '$rangjie:2',
    target: '公虽权倾朝野，亦当遵圣上之意。',
  },
  {
    source: '$mobile_yizheng:1',
    target: '一人劫天子，一人制公卿，此可行邪？',
  },
  {
    source: '$mobile_yizheng:2',
    target: '诸君举事，当上顺天心，奈何如是！',
  },

  {
    source: '$jinfan:1',
    target: '扬锦帆，劫四方，快意逍遥！',
  },
  {
    source: '$jinfan:2',
    target: '铃声所至之处，再无安宁！',
  },
  {
    source: '$sheque:1',
    target: '看我此箭，取那轻舟冒进之人性命！',
  },
  {
    source: '$sheque:2',
    target: '纵有劲甲良盾，也难挡我神射之威！',
  },

  {
    source: '$taomie:1',
    target: '犯我辽东疆界，必遭后报！',
  },
  {
    source: '$taomie:2',
    target: '韩濊之乱，再无可生之机。',
  },
  {
    source: '$taomie:3',
    target: '颅且远行万里，要席何用？',
  },

  {
    source: '$zhengnan:1',
    target: '末将愿承父志，随丞相出征。',
  },
  {
    source: '$zhengnan:2',
    target: '此番南征，必平父愿。',
  },
  {
    source: '$dangxian.guansuo:1',
    target: '各位将军，且让小辈先行出战。',
  },
  {
    source: '$wusheng.guansuo:1',
    target: '逆贼！可识得关氏之勇？',
  },
  {
    source: '$zhiman.guansuo:1',
    target: '蛮夷可抚，不可剿。',
  },

  {
    source: '$poxiang:1',
    target: '王瓘既然假降，吾等可将计就计。',
  },
  {
    source: '$poxiang:2',
    target: '各位将军，且让小辈先行出战。',
  },
  {
    source: '$jueyong:1',
    target: '敌围何惧，有死而已！',
  },
  {
    source: '$jueyong:2',
    target: '身陷敌阵，战而弥勇！',
  },

  {
    source: '$renshi:1',
    target: '巾帼于乱世，只能飘零如尘。',
  },
  {
    source: '$renshi:2',
    target: '还望您可以手下留情。',
  },
  {
    source: '$wuyuan:1',
    target: '夫君，此次出征，还望您记挂妾身。',
  },
  {
    source: '$wuyuan:2',
    target: '云长，一定要平安归来啊。',
  },

  {
    source: '$fenyin:1',
    target: '披发亢歌，至死不休！',
  },
  {
    source: '$fenyin:2',
    target: '力不竭，战不止！',
  },

  {
    source: '$bingqing:1',
    target: '常怀圣言，以是自励。',
  },
  {
    source: '$bingqing:2',
    target: '身受贵宠，不忘初心。',
  },

  {
    source: '$jibing:1',
    target: '集荆、扬精兵，而后共举大义！。',
  },
  {
    source: '$jibing:2',
    target: '教众快快集合，不可误了大事。',
  },
  {
    source: '$wangjing:1',
    target: '联络朝中中常侍，共抗朝廷不义师！',
  },
  {
    source: '$wangjing:2',
    target: '往来京城，与众常侍密谋举事。',
  },
  {
    source: '$moucuan:1',
    target: '汉失民心，天赐良机！',
  },
  {
    source: '$moucuan:2',
    target: '天下正主，正是大贤良师！',
  },

  {
    source: '$zhengjian:1',
    target: '此人有雄猛逸才，还请明公观之。',
  },
  {
    source: '$zhengjian:2',
    target: '若明公得此人才，定当如虎添翼。',
  },
  {
    source: '$gaoyuan:1',
    target: '烦请告知兴霸，请他务必相助！',
  },
  {
    source: '$gaoyuan:2',
    target: '如今事急，唯有兴霸可救！',
  },

  {
    source: '$qianchong:1',
    target: '细行筹划，只盼能助夫君一臂之力。',
  },
  {
    source: '$shangjian:1',
    target: '如今乱世，当秉俭行之节。',
  },
  {
    source: '$shangjian:2',
    target: '百姓尚处寒饥之困，吾等不可奢费财力。',
  },

  {
    source: '$shidi:1',
    target: '诈败以射之，其必死矣！',
  },
  {
    source: '$shidi:2',
    target: '呃啊，中其拖刀计矣！',
  },
  {
    source: '$xing_yishi:1',
    target: '昨日释忠之恩，今吾虚射以报。',
  },
  {
    source: '$xing_yishi:2',
    target: '君刀不砍头颅，吾剑只射盔缨。',
  },
  {
    source: '$qishe:1',
    target: '诱敌之计已成，吾且拈弓搭箭。',
  },
  {
    source: '$qishe:2',
    target: '关羽即至吊桥，既已控弦，如何是好！',
  },

  {
    source: '$hongyi:1',
    target: '克明礼教，约束不端之行。',
  },
  {
    source: '$hongyi:2',
    target: '训成弘操，以扬正明之德。',
  },
  {
    source: '$quanfeng:1',
    target: '媛容德懿，应追谥之。',
  },
  {
    source: '$quanfeng:2',
    target: '景怀之号，方配得上前人之德。',
  },

  {
    source: '$huantu:1',
    target: '今群雄蜂起，主公宜外收内敛，勿为祸先。',
  },
  {
    source: '$huantu:2',
    target: '昔陈胜之事，足为今日之师，望主公熟虑。',
  },
  {
    source: '$bihuo:1',
    target: '公以败兵之身投之，功轻且恐难保身也。',
  },
  {
    source: '$bihuo:2',
    target: '公不若附之他人与相拒，然后委质，功必多。',
  },

  {
    source: '$zhanyi:1',
    target: '战，可以破敌。意，可以守御。',
  },
  {
    source: '$zhanyi:2',
    target: '以战养战，视敌而战。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to put at least 1 hand card on your general card as ‘liang’?',
    target: '{0}；你可以将至少一张手牌置为“粮”',
  },

  {
    source: '{0}: do you want to remove a ‘liang’ to let {1} draws 2 cards?',
    target: '{0}；你可以移去一张“粮”，令 {1} 摸两张牌',
  },

  {
    source: '{0}: you need to give a card to {1}, otherwise the damage to {1} will be terminated',
    target: '{0}；请交给 {1} 一张可选牌，否则将防止对 {1} 的伤害',
  },

  {
    source: '{0}: you can choose a card to gain. If you do this, {1} can deal 1 damage to you',
    target: '{0}；你可以获得其中一张牌。若如此做，{1} 可以对你造成1点伤害',
  },

  {
    source: '{0}: do you want to use a slash to {1} (this slash ignores armors)?',
    target: '{0}；你可以对 {1} 使用一张无视防具的【杀】',
  },

  {
    source: '{0}: do you want to choose a target to draw 2 cards? If he is wounded, you draw 1 card',
    target: '{0}；你可以令一名角色摸两张牌，若其已受伤，你摸一张牌',
  },

  {
    source:
      '{0}: do you want to use this skill, discard all your hand cards, then let {1} recover to 1 hp, and deal 1 damage to current player?',
    target: '{0}；你可以发动本技能，弃置所有手牌，令 {1} 回复体力至1点，然后对当前回合角色造成1点伤害',
  },

  {
    source: 'jimeng {0}: do you want to prey a card from another player?',
    target: '{0}；你可以获得一名其他角色一张牌，然后交给其等同于你体力值数量的牌',
  },
  {
    source: '{0}: please give {1} {2} card(s)',
    target: '{0}；请交给 {1} {2} 张牌',
  },

  {
    source: '{0}: do you want to display all your hand cards to let another player give you a card?',
    target: '{0}；你可以展示所有手牌，令一名其他角色交给你一张牌',
  },
  {
    source: '{0}: please give {1} a card',
    target: '{0}；请交给 {1} 一张牌',
  },

  {
    source: '{0}: do you want to choose a Xue Wei target?',
    target: '{0}；请选择一名其他角色作为“血卫”的目标',
  },

  {
    source: '{0}: please choose taomie options: {1}',
    target: '{0}；请选择令此对 {1} 造成的伤害+1，或获得其 {1} 区域内的一张牌',
  },
  { source: 'taomie:damage', target: '伤害+1' },
  { source: 'taomie:prey', target: '获得其牌' },
  { source: 'taomie:both', target: '执行前两项并移去其标记' },

  {
    source: '{0}: please choose rangjie options',
    target: '{0}；请选择以下一项',
  },
  { source: 'rangjie:move', target: '移动场上一张牌' },
  { source: 'rangjie:gain', target: '随机获得指定类别的牌' },
  {
    source: 'rangjie: please move a card on the game board',
    target: '让节：请移动场上一张牌',
  },

  {
    source: 'shanli: please choose a target to gain a lord skill',
    target: '擅立：请选择一名角色获得一项由你选择的主公技（三选一）',
  },
  {
    source: '{0}: please choose shanli options: {1}',
    target: '{0}：请选择以下一项主公技，令 {1} 获得',
  },

  {
    source: 'zhengjian: please choose a target to gain ‘Jian’',
    target: '诤荐：请选择一名其他角色获得“荐”标记',
  },

  {
    source: '{0}: do you want to discard a card to transfer the target of slash?',
    target: '{0}：你可以弃置一张牌将此【杀】转移给一名有“荐”标记的其他角色',
  },

  {
    source: '{0}: do you want to discard a card from the area of a player?',
    target: '{0}：你可以弃置一名角色区域内的一张牌',
  },

  {
    source: '{0}: do you want to put 2 cards from the top of draw stack on your general card as ‘Bing’?',
    target: '{0}：你可以将牌堆顶两张牌置于你的武将牌上，称为“兵”',
  },

  {
    source:
      '{0}: do you want to choose a target to judge, and if the result’s color is black, you deal 1 thunder damage to the target?',
    target: '{0}：你可以令一名角色进行判定，若结果为黑色，你对其造成1点雷电伤害',
  },

  {
    source: '{0}: do you want to prevent the damage to {1} to prey a card from his/her equip area?',
    target: '{0}：你可以防止对 {1} 造成的伤害，获得其装备区里的一张牌',
  },

  {
    source: '{0}: do you want to lose skill ‘Hong Yi’ to gain {1}’s skills?',
    target: '{0}：你可以失去“弘仪”，获得 {1} 的所有技能，然后你加1点体力上限并回复1点体力',
  },
  {
    source: '{0}: do you want to gain 2 max hp and recover 4 hp?',
    target: '{0}：你可以加2点体力上限并回复4点体力',
  },

  {
    source: '{0}: do you want to give {1} a card to skip his/her draw phase?',
    target: '{0}：你可以交给 {1} 一张牌，跳过其摸牌阶段',
  },
  {
    source: '{0}: please choose huantu options: {1}',
    target: '{0}：请选择以下一项，目标为 {1}',
  },
  { source: 'huantu:give', target: '令其回复1点体力并摸两张牌' },
  { source: 'huantu:recover', target: '你摸三张牌然后交给其两张手牌' },

  {
    source: 'zhanyi: please choose one of these cards to gain',
    target: '战意：请选择其中一张牌获得',
  },
  {
    source: '{0}: please choose 2 hand cards to give them to {1}',
    target: '{0}: 请选择两张手牌交给 {1}',
  },
  {
    source: '{0}: please choose qianchong options: {1}',
    target: '{0}: 请选择: {1}',
  },
];
