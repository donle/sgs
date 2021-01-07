import type { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'slash', target: '杀' },
  { source: 'jink', target: '闪' },
  { source: 'peach', target: '桃' },
  { source: 'alcohol', target: '酒' },
  { source: 'qinggang', target: '青釭剑' },
  { source: 'zixing', target: '紫骍' },
  { source: 'dayuan', target: '大宛' },
  { source: 'jueying', target: '绝影' },
  { source: 'chitu', target: '赤兔' },
  { source: 'dilu', target: '的卢' },
  { source: 'zhuahuangfeidian', target: '爪黄飞电' },
  { source: 'nanmanruqing', target: '南蛮入侵' },
  { source: 'wanjianqifa', target: '万箭齐发' },
  { source: 'lightning', target: '闪电' },
  { source: 'zhugeliannu', target: '诸葛连弩' },
  { source: 'guohechaiqiao', target: '过河拆桥' },
  { source: 'shunshouqianyang', target: '顺手牵羊' },
  { source: 'wuxiekeji', target: '无懈可击' },
  { source: 'wuzhongshengyou', target: '无中生有' },
  { source: 'baguazhen', target: '八卦阵' },
  { source: 'duel', target: '决斗' },
  { source: 'lebusishu', target: '乐不思蜀' },
  { source: 'jiedaosharen', target: '借刀杀人' },
  { source: 'taoyuanjieyi', target: '桃园结义' },
  { source: 'wugufengdeng', target: '五谷丰登' },
  { source: 'guanshifu', target: '贯石斧' },
  { source: 'zhangbashemao', target: '丈八蛇矛' },
  { source: 'fangtianhuaji', target: '方天画戟' },
  { source: 'qinglongyanyuedao', target: '青龙偃月刀' },
  { source: 'qilingong', target: '麒麟弓' },
  { source: 'cixiongjian', target: '雌雄双股剑' },
  { source: 'renwangdun', target: '仁王盾' },
  { source: 'hanbingjian', target: '寒冰剑' },
  { source: 'fire_slash', target: '火杀' },
  { source: 'thunder_slash', target: '雷杀' },
  { source: 'fire_attack', target: '火攻' },
  { source: 'muniuliuma', target: '木牛流马' },
  { source: '#muniuliuma', target: '木牛流马' },
  { source: 'bingliangcunduan', target: '兵粮寸断' },
  { source: 'gudingdao', target: '古锭刀' },
  { source: 'zhuqueyushan', target: '朱雀羽扇' },
  { source: 'tengjia', target: '藤甲' },
  { source: 'baiyinshizi', target: '白银狮子' },
  { source: 'hualiu', target: '骅骝' },
  { source: 'tiesuolianhuan', target: '铁索连环' },
];

export const cardDescriptions: Word[] = [
  {
    source: 'slash_description',
    target: '出牌阶段限一次，对你攻击范围内的一名其他角色使用。你对目标角色造成1点伤害。',
  },
  {
    source: 'fire_slash_description',
    target: '出牌阶段限一次，对你攻击范围内的一名其他角色使用。你对目标角色造成1点【火属性】伤害。',
  },
  {
    source: 'thunder_slash_description',
    target: '出牌阶段限一次，对你攻击范围内的一名其他角色使用。你对目标角色造成1点【雷属性】伤害。',
  },
  {
    source: 'jink_description',
    target: '当【杀】对你生效前，对此【杀】使用。抵消目标【杀】。',
  },
  {
    source: 'peach_description',
    target:
      '<b style="color:red">出牌阶段</b>/<b style="color:green">当一名角色进入濒死状态时</b>，对已受伤的<b style="color:red">你</b>/<b style="color:green">该角色</b>使用。目标角色回复1点体力',
  },
  {
    source: 'alcohol_description',
    target: `①出牌阶段，对本回合内为以此效果使用过【酒】的你使用。目标角色于此回合内使用的下一张【杀】的伤害基数+1。<br />
      ②当你处于濒死状态时，对你使用。目标角色回复1点体力。`,
  },
  {
    source: 'bingliangcunduan_description',
    target: '出牌阶段，对你距离为1的一名其他角色使用。目标角色判定，若不为梅花，其跳过本回合的下个摸牌阶段。',
  },
  {
    source: 'guohechaiqiao_description',
    target: '出牌阶段，对区域内有牌的一名其他角色使用。你弃置目标角色区域里的一张牌。',
  },
  {
    source: 'fire_attack_description',
    target:
      '出牌阶段，对一名有手牌的角色使用。目标角色展示其一张手牌，然后你可以弃置与展示牌花色相同的一张手牌，对其造成1点火焰伤害。',
  },
  {
    source: 'muniuliuma_description',
    target:
      '出牌阶段限一次，你可将一张手牌移出游戏并扣置于【木牛流马】下，称为“辎”，若如此做，你可将装备区里的【木牛流马】置入一名其他角色的装备区；你能将“辎”如手牌般使用或打出。',
  },
  {
    source: 'jiedaosharen_description',
    target:
      '出牌阶段，对一名装备区里有武器牌的其他角色使用。目标角色需对其攻击范围内由你选择的另一名角色使用一张【杀】，否则其将装备区里的武器牌交给你。',
  },
  {
    source: 'duel_description',
    target:
      '出牌阶段，对一名其他角色使用。由目标角色开始，你与其轮流打出一张【杀】，直到一名角色未打出【杀】，然后该角色受到另一名角色造成的1点伤害。',
  },
  {
    source: 'lebusishu_description',
    target: '出牌阶段，对一名其他角色使用。目标角色判定，若不为红桃，其跳过本回合的下一个出牌阶段。',
  },
  {
    source: 'nanmanruqing_description',
    target: '出牌阶段，对所有其他角色使用。目标角色需打出一张【杀】，否则受到你造成的1点伤害。',
  },
  {
    source: 'lightning_description',
    target: '出牌阶段，对你使用。目标角色判定，若为黑桃2~9，其受到3点无来源的雷电伤害。',
  },
  {
    source: 'shunshouqianyang_description',
    target: '出牌阶段，对距离为一且区域内有牌的一名其他角色使用。你获得目标角色区域内的一张牌。',
  },
  {
    source: 'taoyuanjieyi_description',
    target: '出牌阶段，对所有角色使用。目标角色回复1点体力。',
  },
  {
    source: 'tiesuolianhuan_description',
    target: '出牌阶段，对一至两名角色使用。目标角色横置/重置其武将牌。（此牌可重铸）',
  },
  {
    source: 'wanjianqifa_description',
    target: '出牌阶段，对所有其他角色使用。目标角色需打出一张【闪】，否则其受到你造成的1点伤害。',
  },
  {
    source: 'wuxiekeji_description',
    target: '当锦囊牌对你生效前，对此锦囊牌使用。抵消目标锦囊牌。',
  },
  {
    source: 'wuzhongshengyou_description',
    target: '出牌阶段，对你使用。目标角色摸两张牌。',
  },
  {
    source: 'wugufengdeng_description',
    target: '出牌阶段，对所有角色使用。亮出牌堆顶等同于目标数的牌，目标角色依次获得其中一张牌。',
  },
  {
    source: 'cixiongjian_description',
    target: '当你使用【杀】指定目标后，若其性别与你不同，你可以令其选择一项：1.弃置一张手牌；2.令你摸一张牌。',
  },
  {
    source: 'fangtianhuaji_description',
    target: '<b>锁定技</b>，你使用对应实体牌为你所有手牌的【杀】的目标上限+2。',
  },
  {
    source: 'gudingdao_description',
    target: '<b>锁定技</b>，当你使用【杀】对目标角色造成伤害时，若其没有手牌，此伤害+1。',
  },
  {
    source: 'guanshifu_description',
    target: '当你使用的【杀】被目标角色抵消后，你可以弃置两张牌，使此【杀】依然生效。',
  },
  {
    source: 'hanbingjian_description',
    target: '当你使用【杀】对目标角色造成伤害时，若其有牌，你可以防止此伤害，然后依次弃置其两张牌。',
  },
  {
    source: 'qilingong_description',
    target: '当你使用【杀】对目标角色造成伤害时，你可以弃置其装备区里的一张坐骑牌。',
  },
  {
    source: 'qinggang_description',
    target: '<b>锁定技</b>，当你使用【杀】指定目标后，无视其防具。',
  },
  {
    source: 'qinglongyanyuedao_description',
    target: '当你使用的【杀】被目标角色抵消后，你可以对其使用一张【杀】（无距离限制）。',
  },
  {
    source: 'zhangbashemao_description',
    target: '你可以将两张手牌当【杀】使用或打出。',
  },
  {
    source: 'zhugeliannu_description',
    target: '<b>锁定技</b>，你使用【杀】无次数限制。',
  },
  {
    source: 'zhuqueyushan_description',
    target: '你可以将普【杀】当火【杀】使用。',
  },
  {
    source: 'baguazhen_description',
    target: '当你需要使用或打出【闪】时，你可以判定，若为红色，你视为使用或打出一张【闪】。',
  },
  {
    source: 'baiyinshizi_description',
    target: '当你受到伤害时，若伤害值大于1，你将伤害值改为1；当你失去装备区里的此牌后，你回复1点体力。',
  },
  {
    source: 'renwangdun_description',
    target: '<b>锁定技</b>，黑色【杀】对你无效。',
  },
  {
    source: 'tengjia_description',
    target: '<b>锁定技</b>，【南蛮入侵】、【万箭齐发】和普【杀】对你无效；当你受到火焰伤害时，此伤害+1。',
  },
  {
    source: 'tengjia_description',
    target: '<b>锁定技</b>，【南蛮入侵】、【万箭齐发】和普【杀】对你无效；当你受到火焰伤害时，此伤害+1。',
  },
  {
    source: 'zixing_description',
    target: '你计算与其他角色的距离-1。',
  },
  {
    source: 'dayuan_description',
    target: '你计算与其他角色的距离-1。',
  },
  {
    source: 'jueying_description',
    target: '其他角色计算与你的距离+1。',
  },
  {
    source: 'chitu_description',
    target: '你计算与其他角色的距离-1。',
  },
  {
    source: 'dilu_description',
    target: '其他角色计算与你的距离+1。',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: '其他角色计算与你的距离+1。',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: '其他角色计算与你的距离+1。',
  },
  {
    source: 'hualiu_description',
    target: '其他角色计算与你的距离+1。',
  },
  { source: 'do you wish to deliver muniuliuma to another player?', target: '是否将木牛流马移动至其他角色的装备区？' },
];
