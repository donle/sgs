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
    target:
      '你可以将一张黑桃手牌当【酒】使用；你使用【酒】无次数限制；你使用【酒】【杀】造成伤害后，本回合内你的“崩坏”无效。',
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
    target:
      '<b>主公技</b>，当其他群势力角色造成一点伤害后，其可以令你进行判定，若结果为黑桃，你获得此判定牌并回复1点体力。',
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
  { source: 'yinghun:option-one', target: '摸一弃X' },
  { source: 'yinghun:option-two', target: '摸X弃一' },
  { source: 'benghuai:hp', target: '失去1点体力' },
  { source: 'benghuai:maxhp', target: '减1点体力上限' },
  { source: 'xingshang:recover', target: '回复1点体力' },
  { source: 'xingshang:pickup', target: '获得阵亡角色的所有牌' },
  { source: 'zaiqi:draw', target: '摸一张牌' },
  { source: 'zaiqi:recover', target: '令孟获回复1点体力' },
];
