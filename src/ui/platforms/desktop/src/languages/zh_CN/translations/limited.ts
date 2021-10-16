import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'limited', target: '限定' },

  { source: 'chenlin', target: '陈琳' },
  { source: 'bifa', target: '笔伐' },
  { source: 'songci', target: '颂词' },
  { source: '#songci', target: '颂词（摸牌）' },

  { source: 'caochun', target: '曹纯' },
  { source: 'shanjia', target: '缮甲' },
  { source: 'shanjia count: {0}', target: '缮甲[{0}]' },

  { source: 'jianggan', target: '蒋干' },
  { source: 'weicheng', target: '伪诚' },
  { source: 'daoshu', target: '盗书' },

  { source: 'wangshuang', target: '王双' },
  { source: 'zhuilie', target: '追猎' },

  { source: 'caoshuang', target: '曹爽' },
  { source: 'tuogu', target: '托孤' },
  { source: 'shanzhuan', target: '擅专' },

  { source: 'ruanyu', target: '阮瑀' },
  { source: 'xingzuo', target: '兴作' },
  { source: '#xingzuo', target: '兴作（换牌）' },
  { source: 'miaoxian', target: '妙弦' },

  { source: 'guansuo', target: '关索' },
  { source: 'zhengnan', target: '征南' },
  { source: 'xiefang', target: '撷芳' },

  { source: 'zhugeguo', target: '诸葛果' },
  { source: 'qirang', target: '祈禳' },
  { source: 'yuhua', target: '羽化' },

  { source: 'baosanniang', target: '鲍三娘' },
  { source: 'wuniang', target: '武娘' },
  { source: 'xushen', target: '许身' },
  { source: '#xushen', target: '许身（变关索）' },
  { source: 'zhennan', target: '镇南' },

  { source: 'guozhao', target: '郭照' },
  { source: 'pianchong', target: '偏宠' },
  { source: 'pianchong: {0}', target: '偏宠[{0}]' },
  { source: 'pianchong: {0} {1}', target: '偏宠[{0}{1}]' },
  { source: 'zunwei', target: '尊位' },

  { source: 'gexuan', target: '葛玄' },
  { source: 'lianhua', target: '炼化' },
  { source: 'danxue', target: '丹血' },
  { source: 'zhafu', target: '札符' },

  { source: 'new_liuzan', target: '留赞' },
  { source: 'new_fenyin', target: '奋音' },
  { source: 'liji', target: '力激' },
  { source: 'liji times: {0} {1}', target: '力激[{0}|+{1}]' },

  { source: 'panshu', target: '潘淑' },
  { source: 'weiyi', target: '威仪' },
  { source: 'jinzhi', target: '锦织' },

  { source: 'xurong', target: '徐荣' },
  { source: 'xionghuo', target: '凶镬' },
  { source: 'baoli', target: '暴戾' },
  { source: 'shajue', target: '杀绝' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shanjia_description',
    target:
      '出牌阶段开始时，你可以摸三张牌，然后弃置三张牌（本局游戏内你每不因使用而失去一张装备牌，便少弃置一张牌）。若你未以此法弃置非装备牌，你可视为使用一张无距离限制的【杀】。',
  },

  {
    source: 'bifa_description',
    target:
      '结束阶段开始时，你可以将一张手牌置于没有“檄”的一名其他角色的武将牌旁，称为“檄”。该角色于其下个回合开始时，观看此“檄”并选择一项：1.交给你一张与此“檄”类别相同的手牌，然后获得此“檄”；2.移去此“檄”并失去1点体力。',
  },
  {
    source: 'songci_description',
    target:
      '每名角色限一次，出牌阶段，你可以选择一名角色，若其手牌数：大于体力值，其弃置两张牌；不大于体力值，其摸两张牌；弃牌阶段结束时，若你对所有存活角色均发动过本技能，你摸一张牌。',
  },

  {
    source: 'weicheng_description',
    target: '当其他角色获得你的手牌，或你交给其他角色你的手牌后，若你的手牌数小于体力值，你可以摸一张牌。',
  },
  {
    source: 'daoshu_description',
    target:
      '出牌阶段，你可以声明一种花色并获得一名其他角色的一张手牌，若此牌与你声明的花色：相同，你对其造成1点伤害；不同，你交给其一张不为你以此法获得的牌花色的手牌（若无法给出，则改为展示所有手牌），且此技能于本回合内失效。',
  },

  {
    source: 'zhuilie_description',
    target:
      '<b>锁定技</b>，你使用【杀】无距离限制；当你使用【杀】指定不在你攻击范围内的角色后，此【杀】不计入次数限制且你判定，若为武器牌或坐骑牌，你令此【杀】对其伤害基数等同于其体力值，否则你失去1点体力。',
  },

  {
    source: 'tuogu_description',
    target:
      '当其他角色死亡时，你可以令其选择其一项技能（主公技、限定技、觉醒技和隐匿技除外），你失去以此法获得的上一个技能，获得此技能。',
  },
  {
    source: 'shanzhuan_description',
    target:
      '当你对其他角色造成伤害后，若其判定区里没有牌，你可以将其一张牌置于其判定区内。若此牌不为延时类锦囊牌且为：红色牌，此牌视为【乐不思蜀】；黑色牌，此牌视为【兵粮寸断】。回合结束时，若你本回合没有造成过伤害，你可以摸一张牌。',
  },

  {
    source: 'xingzuo_description',
    target:
      '出牌阶段开始时，你可以观看牌堆底三张牌，然后你可以用至少一张手牌交换其中等量的牌。若你交换了牌，你于本回合的结束阶段开始时，令一名有手牌的角色将所有手牌与牌堆底三张牌交换，若以此法置于牌堆底的牌数大于三张，你失去1点体力。',
  },
  {
    source: 'miaoxian_description',
    target:
      '若你的手牌中仅有一张：黑色牌，你可以将此牌当任意普通锦囊牌使用（每回合限一次）；红色牌，你使用此牌时摸一张牌。',
  },

  {
    source: 'zhengnan_description',
    target:
      '每名角色限一次，当一名角色进入濒死状态时，你可以回复1点体力，然后摸一张牌并选择以下一项技能获得：“当先”、“武圣”和“制蛮”（若你已拥有这三个技能则改为摸三张牌）。',
  },
  {
    source: 'xiefang_description',
    target: '<b>锁定技</b>，你计算与其他角色的距离-X（X为存活女性角色数）。',
  },

  {
    source: 'qirang_description',
    target: '当装备牌进入你的装备区后，你可以从牌堆随机获得一张锦囊牌。若此牌为普通锦囊牌，你于本回合使用此牌指定唯一目标时，你可以为此牌增加一个额外的目标。',
  },
  {
    source: 'yuhua_description',
    target: '<b>锁定技</b>，你的非基本牌不计入手牌上限；结束阶段开始时，若你的手牌数大于体力上限，你观看牌堆顶一张牌，然后将之置于牌堆顶或牌堆底。',
  },

  {
    source: 'wuniang_description',
    target:
      '当你使用或打出【杀】时，你可以获得一名其他角色的一张牌，然后其摸一张牌，若你已发动过“许身”且场上存在“关索”，其摸一张牌。',
  },
  {
    source: 'xushen_description',
    target:
      '<b>限定技</b>，当你进入濒死状态时，若你的体力不大于0，你可以回复1点体力并获得技能“镇南”。若如此做，当你脱离此次濒死状态后，若场上没有“关索”，你可以令一名其他角色选择是否用“关索”替换其武将牌并摸三张牌。',
  },
  {
    source: 'zhennan_description',
    target: '当一名角色使用普通锦囊牌指定第一个目标后，若目标数大于1，你可以对一名其他角色造成1点伤害。',
  },

  {
    source: 'pianchong_description',
    target:
      '摸牌阶段，你可以改为随机获得牌堆里的黑色和红色牌各一张，然后选择一项获得一项效果直到你的下个回合开始：1.当你失去一张黑色牌后，你随机获得牌堆里的一张红色牌；2.当你失去一张红色牌后，你随机获得牌堆里的一张黑色牌。',
  },
  {
    source: 'zunwei_description',
    target:
      '出牌阶段限一次，你可以选择一名其他角色，并选择一项：1.将手牌数摸至与该角色相同（最多摸五张）；2.随机使用牌堆中的装备牌至与该角色相同；3.将体力回复至与该角色相同。最后移除该选项。',
  },

  {
    source: 'lianhua_description',
    target:
      '<b>锁定技</b>，当其他角色于你的回合外受到伤害后，你获得一枚“丹血”标记直到你的下个出牌阶段开始（若其阵营与你：相同，此“丹血”为红色；不同，此“丹血”为黑色。丹血的颜色对所有角色不可见）；准备阶段开始时，你根据你拥有的“丹血”的数量及颜色，从牌堆和弃牌堆中获得相应的牌各一张，以及相应的一项技能（此技能回合结束失去）：不多于3枚，【桃】和“英姿”；多于3枚且红色较多，【无中生有】和“观星”；多于3枚且黑色较多，【顺手牵羊】和“直言”；多于3枚且红黑数量相等，【杀】及【决斗】，“攻心”。',
  },
  {
    source: 'zhafu_description',
    target:
      '<b>限定技</b>，出牌阶段，你可以令一名其他角色于其下个弃牌阶段开始时，其选择其一张手牌保留，然后将其他手牌交给你。',
  },

  {
    source: 'new_fenyin_description',
    target:
      '<b>锁定技</b>，当一张牌于你的回合内进入弃牌堆后，若此牌花色与本回合内进入过弃牌堆的其他牌花色均不同，你摸一张牌。',
  },
  {
    source: 'liji_description',
    target:
      '每回合限零次，出牌阶段，你可以弃置一张牌，并对一名其他角色造成1点伤害；你的回合内，本回合进入弃牌堆的牌每达到8的倍数张时（若本回合开始时存活角色数小于5，改为4的倍数），此技能于本回合内的使用次数上限+1。',
  },

  {
    source: 'weiyi_description',
    target:
      '每名角色限一次，当一名角色受到伤害后，若其体力值：大于你，你可以令其失去1点体力；小于你，你可以令其回复1点体力；等于你，你可以令其失去或回复1点体力。',
  },
  {
    source: 'jinzhi_description',
    target:
      '当你需要使用或打出基本牌时，你可以弃置X张牌，然后摸一张牌，视为使用或打出此基本牌（X为你本轮内发动过本技能的次数+1）。',
  },

  {
    source: 'xionghuo_description',
    target:
      '游戏开始时，你获得3枚“暴戾”标记；出牌阶段，你可以将你的一枚“暴戾”标记移给没有“暴戾”标记的一名其他角色；当你对拥有“暴戾”的其他角色造成伤害时，此伤害+1；拥有“暴戾”的其他角色的出牌阶段开始时，移去其所有“暴戾”标记，且其随机执行一项：1.受到你对其造成的1点火焰伤害，其于本回合内不能对你使用【杀】；2.失去1点体力，其本回合手牌上限-1；3.令你随机获得其装备区和手牌里的各一张牌。',
  },
  {
    source: 'shajue_description',
    target:
      '<b>锁定技</b>，当其他角色进入濒死状态时，若其体力小于0，你获得一枚“暴戾”标记，然后你获得令其进入濒死状态的牌。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please drop {1} card(s), if all of them are equip card, you can use a virtual slash',
    target: '{0}: 请弃置 {1} 张牌，若弃牌中均为装备牌，则可视为使用一张无距离限制的【杀】',
  },
  {
    source: 'shanjia: do you want to use a slash?',
    target: '缮甲：你可以视为使用一张【杀】（无距离限制）',
  },

  {
    source: '{0}: please choose a card suit',
    target: '{0}: 请选择一种花色',
  },
  {
    source: '{0}: please give {1} a hand card except the card with suit {2}',
    target: '{0}: 请交给 {1} 一张非{2}手牌',
  },

  {
    source: 'the bottom of draw stack',
    target: '牌堆底的牌',
  },
  {
    source: 'xingzuo: please select cards to put on draw stack bottom',
    target: '兴作：请选择其中三张牌作为牌堆底的牌',
  },
  {
    source: '{0}: do you want to choose a target to exchange hand cards with draw stack bottom?',
    target: '{0}：你可以令一名有牌的角色将所有手牌与牌堆底三张牌交换',
  },

  {
    source: '{0}: do you want to gain a random equip card from draw stack?',
    target: '{0}：你可以从牌堆随机获得一张锦囊牌',
  },
  {
    source: '{0}: do you want to select a player to append to {1} targets?',
    target: '{0}：你可以为 {1} 增加一个额外目标',
  },

  {
    source: '{0}: please choose pianchong options',
    target: '{0}：请选择以下一项效果获得，并持续到你的下个回合开始',
  },
  { source: 'pianchong:loseBlack', target: '失去黑色牌获得红色牌' },
  { source: 'pianchong:loseRed', target: '失去红色牌获得黑色牌' },

  {
    source: '{0}: please choose zunwei options: {1}',
    target: '{0}：请选择以下一项，执行对应效果至与 {1} 数量相等',
  },
  { source: 'zunwei:hand', target: '手牌' },
  { source: 'zunwei:equip', target: '装备区牌' },
  { source: 'zunwei:recover', target: '体力值' },

  {
    source: '{0}: do you want to put a card from {1} into his judge area?',
    target: '{0}：你可以将 {1} 的一张牌置于其判定区内',
  },

  {
    source: '{0}: please choose a skill to let {1} gain it',
    target: '{0}：请选择一项技能令 {1} 获得',
  },

  {
    source: '{0}: please choose a hand card, give the other cards to {1}',
    target: '{0}：请选择一张手牌保留，将其他手牌交给 {1}',
  },

  {
    source: '{0}: please choose a skill to gain',
    target: '{0}：请选择以下一项技能获得',
  },

  {
    source: '{0}: do you want to prey a card from another player?',
    target: '{0}：你可以获得一名其他角色的一张牌，然后其摸一张牌',
  },

  {
    source: '{0}: do you want to choose another player to let him change general to Guan Suo and draw 3 cards?',
    target: '{0}：你可以令一名其他角色选择是否变为“关索”并摸三张牌',
  },
  {
    source: '{0}: do you want to change your general to Guan Suo and draw 3 cards?',
    target: '{0}：你可以变为“关索”并摸三张牌',
  },

  {
    source: '{0}: do you want to deal 1 damage to another player?',
    target: '{0}：你可以对一名其他角色造成1点伤害',
  },

  {
    source: '{0}: please choose weiyi options: {1}',
    target: '{0}：你可以选择令 {1} 失去或回复1点体力',
  },
  { source: 'weiyi:loseHp', target: '其失去体力' },
  { source: 'weiyi:recover', target: '其回复体力' },
  {
    source: '{0}: do you want to let {1} lose 1 hp?',
    target: '{0}：你可以令 {1} 失去1点体力',
  },
  {
    source: '{0}: do you want to let {1} recover 1 hp?',
    target: '{0}：你可以令 {1} 回复1点体力',
  },
];
