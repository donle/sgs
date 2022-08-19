import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'shadow', target: '阴' },

  { source: 'wangji', target: '王基' },
  { source: 'qizhi', target: '奇制' },
  { source: 'qizhi times: {0}', target: '奇制[{0}]' },
  { source: 'jinqu', target: '进趋' },

  { source: 'kuaiyuekuailiang', target: '蒯越蒯良' },
  { source: 'jianxiang', target: '荐降' },
  { source: 'shenshi', target: '审时' },
  { source: '#shenshi', target: '审时' },

  { source: 'yanyan', target: '严颜' },
  { source: 'juzhan', target: '拒战' },
  { source: '#juzhan', target: '拒战' },

  { source: 'wangping', target: '王平' },
  { source: 'feijun', target: '飞军' },
  { source: 'binglve', target: '兵略' },

  { source: 'luji', target: '陆绩' },
  { source: 'huaiju', target: '怀橘' },
  { source: 'orange', target: '橘' },
  { source: 'weili', target: '遗礼' },
  { source: 'zhenglun', target: '整论' },

  { source: 'sunliang', target: '孙亮' },
  { source: 'kuizhu', target: '溃诛' },
  { source: 'chezheng', target: '掣政' },
  { source: 'lijun', target: '立军' },

  { source: 'xuyou', target: '许攸' },
  { source: 'chenglve', target: '成略' },
  { source: 'chenglve suits: {0}', target: '成略[{0}]' },
  { source: 'shicai', target: '恃才' },
  { source: 'cunmu', target: '寸目' },

  { source: 'luzhi', target: '卢植' },
  { source: 'mingren', target: '明任' },
  { source: '#mingren', target: '明任' },
  { source: 'zhenliang', target: '贞良' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qizhi_description',
    target: '当你使用基本牌或锦囊牌指定第一个目标后，你可以弃置一名不为此牌目标的角色一张牌，然后其摸一张牌。',
  },
  {
    source: 'jinqu_description',
    target: '结束阶段开始时，你可以摸两张牌，然后将手牌保留至X张（X为你本回合发动过“奇制”的次数）。',
  },

  {
    source: 'jianxiang_description',
    target: '当你成为其他角色使用牌的目标后，你可以令一名手牌数最少的角色摸一张牌。',
  },
  {
    source: 'shenshi_description',
    target:
      '<b>转换技</b>，阳：出牌阶段限一次，你可以将一张牌交给一名除你外手牌数最多的角色，对其造成1点伤害，然后若其死亡，则你可令一名角色将手牌摸至四张；阴：当你受到伤害后，你可以观看伤害来源的手牌，然后你将一张牌交给该角色，此回合结束时，若此牌仍在其手牌或装备区内，你将手牌摸至四张。',
  },

  {
    source: 'juzhan_description',
    target:
      '<b>转换技</b>，阳：当你成为其他角色使用【杀】的目标后，你可以与其各摸一张牌，然后其于此回合内不能对你使用牌；阴；当你使用【杀】指定第一个目标后，你可以获得目标中一名角色的一张牌，然后你于此回合内不能对其使用牌。',
  },

  {
    source: 'feijun_description',
    target:
      '出牌阶段限一次，你可以弃置一张牌，然后可以选择一项：1.令一名手牌数多于你角色交给你一张牌；2.令一名装备区内牌数多于你的角色弃置一张装备牌。',
  },
  {
    source: 'binglve_description',
    target: '<b>锁定技</b>，当你发动“飞军”后，若此次“飞军”的目标于此前未成为过你发动“飞军”的目标，你摸两张牌。',
  },

  {
    source: 'huaiju_description',
    target:
      '<b>锁定技</b>，游戏开始时，你获得3枚“橘”标记；有“橘”的角色于其摸牌阶段多摸一张牌；当有“橘”的角色受到伤害时，防止此伤害。',
  },
  {
    source: 'weili_description',
    target: '出牌阶段开始时，你可以选择一名其他角色，并移去一枚“橘”或失去1点体力，令其获得一枚“橘”。',
  },
  {
    source: 'zhenglun_description',
    target: '摸牌阶段，你可以改为获得一枚“橘”。',
  },

  {
    source: 'kuizhu_description',
    target:
      '弃牌阶段结束时，你可以选择一项：1.令一至X名角色各摸一张牌；2.对至少一名体力值之和为X的角色各造成1点伤害，若选择了不少于两名角色，你失去1点体力（X为你此阶段内弃置过的你的牌数）。',
  },
  {
    source: 'chezheng_description',
    target:
      '<b>锁定技</b>，你不能对攻击范围内不包含你的其他角色使用牌；出牌阶段结束时，若你于此阶段内使用过的牌数小于这些角色，你弃置其中一名角色一张牌。',
  },
  {
    source: 'lijun_description',
    target:
      '<b>主公技</b>，其他吴势力角色于其出牌阶段使用【杀】结算结束后，其可以将此【杀】交给你，然后你可令其摸一张牌。',
  },

  {
    source: 'chenglve_description',
    target:
      '<b>转换技</b>，出牌阶段限一次，阳：你可以摸一张牌，然后弃置两张手牌；阴：你可以摸两张牌，然后弃置一张手牌。若如此做，你于此阶段内使用与你以此法弃置牌花色相同的牌无距离和次数限制。',
  },
  {
    source: 'shicai_description',
    target: '当你于一回合首次使用一种类别的非延时类牌结算结束后，你可以将此牌置于牌堆顶，然后摸一张牌。',
  },
  {
    source: 'cunmu_description',
    target: '<b>锁定技</b>，当你摸牌时，改为从牌堆底摸牌。',
  },

  {
    source: 'mingren_description',
    target:
      '游戏开始时，你摸两张牌，然后将一张手牌置于你的武将牌上，称为“任”；结束阶段开始时，你可以用一张手牌交换“任”。',
  },
  {
    source: 'zhenliang_description',
    target:
      '<b>转换技</b>，阳：出牌阶段限一次，你可以选择你攻击范围内的一名角色，并弃置与你的“任”颜色相同的一张牌，对其造成1点伤害；阴：当你于回合外使用或打出牌结算结束后，若此牌的颜色与你的“任”相同，你可以令一名角色摸一张牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$qizhi:1',
    target: '吾意不在此地，已遣别部出发。',
  },
  {
    source: '$qizhi:2',
    target: '声东击西，敌寇一网成擒！',
  },
  {
    source: '$jinqu:1',
    target: '建上昶水城，以逼夏口。',
  },
  {
    source: '$jinqu:2',
    target: '通川聚粮，伐吴之业，当步步为营。',
  },

  {
    source: '$jianxiang:1',
    target: '得遇曹公，吾之幸也。',
  },
  {
    source: '$jianxiang:2',
    target: '曹公得荆不喜，喜得吾二人足矣。',
  },
  {
    source: '$shenshi:1',
    target: '数语之言，审时度势。',
  },
  {
    source: '$shenshi:2',
    target: '深中足智，鉴时审情。',
  },

  {
    source: '$juzhan:1',
    target: '砍头便砍头，何为怒邪？',
  },
  {
    source: '$juzhan:2',
    target: '我州但有断头将军，无降将军也！',
  },

  {
    source: '$feijun:1',
    target: '无当飞军，伐叛乱，镇蛮夷。',
  },
  {
    source: '$feijun:2',
    target: '山地崎岖，也挡不住飞军破势！',
  },
  {
    source: '$binglve:1',
    target: '兵略者，明战胜攻取之数，形机之势，诈谲之变。',
  },
  {
    source: '$binglve:2',
    target: '奇略兵速，敌未能料之。',
  },

  {
    source: '$huaiju:1',
    target: '情深舐犊，怀擢藏橘。',
  },
  {
    source: '$huaiju:2',
    target: '袖中怀绿桔，遗母报乳哺。',
  },
  {
    source: '$weili:1',
    target: '违失礼仪，则惧非议。',
  },
  {
    source: '$weili:2',
    target: '行遗礼之举，于不敬王者。',
  },
  {
    source: '$zhenglun:1',
    target: '整论四海未泰，修文德以平。',
  },
  {
    source: '$zhenglun:2',
    target: '今论者不务道德怀取之术，而惟尚武，窃所未安。',
  },

  {
    source: '$kuizhu:1',
    target: '子通专恣，必谋而诛之。',
  },
  {
    source: '$kuizhu:2',
    target: '孙綝久专，不可久忍，必溃诛！',
  },
  {
    source: '$chezheng:1',
    target: '风驰电掣，政权不怠。',
  },
  {
    source: '$chezheng:2',
    target: '唉，帘屏掣政，实为艰事。',
  },
  {
    source: '$lijun:1',
    target: '立于朝堂，定于军心。',
  },
  {
    source: '$lijun:2',
    target: '君，立于朝堂；军，侧于四方。',
  },

  {
    source: '$chenglve:1',
    target: '成略在胸，良计速出。',
  },
  {
    source: '$chenglve:2',
    target: '吾有良略在怀，必为阿瞒所需。',
  },
  {
    source: '$shicai:1',
    target: '吾才满腹，袁本初竟不从之！',
  },
  {
    source: '$shicai:2',
    target: '阿瞒有我良计，取冀州便是易如反掌。',
  },
  {
    source: '$cunmu:1',
    target: '哼，目光所及，短寸之间。',
  },
  {
    source: '$cunmu:2',
    target: '狭目之见，只能窥底。',
  },

  {
    source: '$mingren:1',
    target: '得义真所救，吾任之必尽瘁以报。',
  },
  {
    source: '$mingren:2',
    target: '吾之任，君之明举。',
  },
  {
    source: '$zhenliang:1',
    target: '风霜以别草木之性，危乱而见贞良之节。',
  },
  {
    source: '$zhenliang:2',
    target: '贞节贤良，吾之本心。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to drop 1 hand card of another player, and this player will draw a card?',
    target: '{0}：你可以弃置非目标角色的一张牌，然后其摸一张牌',
  },

  {
    source: '{0}: do you want to draw 2 cards, then keep {1} hand cards?',
    target: '{0}：你可以摸两张牌，然后将手牌保留至 {1} 张',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：请弃置 {1} 张牌',
  },

  {
    source: '{0}: do you want to choose a jianxiang target to draw a card?',
    target: '{0}：你可以令手牌数最少的一名角色摸一张牌',
  },

  {
    source: 'shenshi: do you want to choose a target to draw cards?',
    target: '审时：你可以令一名角色将手牌摸至四张',
  },
  {
    source: '{0}: do you want to view {1}’s hand cards?',
    target: '{0}：你可以观看 {1} 的手牌',
  },

  {
    source: '{0}: do you want to draw a card with {1} , then he cannot use card to you this round?',
    target: '{0}：你可以与 {1} 各摸一张牌，然后其于本回合内不能对你使用牌',
  },
  {
    source: '{0}: do you want to choose a target to prey a card from him, then you cannot use card to him this round?',
    target: '{0}：你可以获得其中一名目标角色一张牌，然后你于本回合内不能对其使用牌',
  },

  {
    source: 'feijun: please choose a target',
    target: '飞军：请选择一名其他角色',
  },
  {
    source: '{0}: please choose feijun options: {1}',
    target: '{0}：请选择一项令 {1} 执行',
  },
  {
    source: 'feijun:hand',
    target: '交给你一张手牌',
  },
  {
    source: 'feijun:equip',
    target: '弃置一张装备牌',
  },
  {
    source: '{0}: please drop a equip card',
    target: '{0}：请弃置一张装备牌',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 orange?',
    target: '{0}：你可以选择一名其他角色',
  },
  {
    source: 'weili:loseHp',
    target: '失去1点体力',
  },
  {
    source: 'weili:loseOrange',
    target: '移去一枚“橘”',
  },
  {
    source: '{0}: please choose weili options: {1}',
    target: '{0}：请选择以下一项，令 {1} 获得一枚“橘”',
  },

  {
    source: '{0}: please choose kuizhu options: {1}',
    target: '{0}：你可以令至多 {1} 名角色各摸一张牌，或对至少一名体力值之和为 {1} 的角色各造成1点伤害',
  },
  { source: 'kuizhu:draw', target: '摸牌' },
  { source: 'kuizhu:damage', target: '伤害' },
  {
    source: '{0}: do you want to choose at most {1} targets to draw a card each?',
    target: '{0}：你可以令至多 {1} 名角色各摸一张牌',
  },
  {
    source: '{0}: do you want to choose a targets with {1} hp to deal 1 damage to each target?',
    target: '{0}：你可以对至少一名体力值之和为 {1} 的角色各造成1点伤害',
  },

  {
    source: 'chezheng: please choose a target to drop a card from him?',
    target: '掣政：请选择其中一名角色，弃置其一张牌',
  },

  {
    source: '{0}: do you want to give {1} to {2}?',
    target: '{0}：你是否要将 {1} 交给 {2}',
  },
  {
    source: '{0}: do you want to let {1} draws a card?',
    target: '{0}：你是否要令 {1} 摸一张牌',
  },

  {
    source: '{0}: do you want to skip draw card phase to gain 1 orange?',
    target: '{0}：你可以跳过摸牌阶段来获得一枚“橘”',
  },

  {
    source: '{0}: do you want to put {1} on the top of draw stack, then draw a card?',
    target: '{0}：你可以将 {1} 置于牌堆顶，然后摸一张牌',
  },

  {
    source: '{0}: please put a hand card on your general card as ‘Ren’',
    target: '{0}：请将一张手牌置于你的武将牌上，称为“任”',
  },
  {
    source: '{0}: do you want to exchange a hand card with a ‘Ren’?',
    target: '{0}：你可以用一张手牌交换“任”',
  },

  {
    source: '{0}: do you want to choose a target to draw a card?',
    target: '{0}：你可以令一名角色摸一张牌',
  },
];
