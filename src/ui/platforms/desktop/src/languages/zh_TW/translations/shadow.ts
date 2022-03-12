import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'shadow', target: '陰' },

  { source: 'wangji', target: '王基' },
  { source: 'qizhi', target: '奇制' },
  { source: 'qizhi times: {0}', target: '奇制[{0}]' },
  { source: 'jinqu', target: '進趨' },

  { source: 'kuaiyuekuailiang', target: '蒯越蒯良' },
  { source: 'jianxiang', target: '薦降' },
  { source: 'shenshi', target: '審時' },
  { source: '#shenshi', target: '審時' },

  { source: 'yanyan', target: '嚴顏' },
  { source: 'juzhan', target: '拒戰' },
  { source: '#juzhan', target: '拒戰' },

  { source: 'wangping', target: '王平' },
  { source: 'feijun', target: '飛軍' },
  { source: 'binglve', target: '兵略' },

  { source: 'luji', target: '陸績' },
  { source: 'huaiju', target: '懷橘' },
  { source: 'orange', target: '橘' },
  { source: 'weili', target: '遺禮' },
  { source: 'zhenglun', target: '整論' },

  { source: 'sunliang', target: '孫亮' },
  { source: 'kuizhu', target: '潰誅' },
  { source: 'chezheng', target: '掣政' },
  { source: 'lijun', target: '立軍' },

  { source: 'xuyou', target: '許攸' },
  { source: 'chenglve', target: '成略' },
  { source: 'chenglve suits: {0}', target: '成略[{0}]' },
  { source: 'shicai', target: '恃才' },
  { source: 'cunmu', target: '寸目' },

  { source: 'luzhi', target: '盧植' },
  { source: 'mingren', target: '明任' },
  { source: '#mingren', target: '明任' },
  { source: 'zhenliang', target: '貞良' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qizhi_description',
    target: '當你使用基本牌或錦囊牌指定第一個目標後，你可以棄置一名不為此牌目標的角色一張牌，然後其摸一張牌。',
  },
  {
    source: 'jinqu_description',
    target: '結束階段開始時，你可以摸兩張牌，然後將手牌保留至X張（X為你本回合發動過“奇制”的次數）。',
  },

  {
    source: 'jianxiang_description',
    target: '當你成為其他角色使用牌的目標後，你可以令一名手牌數最少的角色摸一張牌。',
  },
  {
    source: 'shenshi_description',
    target:
      '<b>轉換技</b>，陽：出牌階段限一次，你可以將一張牌交給一名除你外手牌數最多的角色，對其造成1點傷害，然後若其死亡，則你可令一名角色將手牌摸至四張；陰：當你受到傷害後，你可以觀看傷害來源的手牌，然後你將一張牌交給該角色，此回合結束時，若此牌仍在其手牌或裝備區內，你將手牌摸至四張。',
  },

  {
    source: 'juzhan_description',
    target:
      '<b>轉換技</b>，陽：當你成為其他角色使用【殺】的目標後，你可以與其各摸一張牌，然後其於此回合內不能對你使用牌；陰；當你使用【殺】指定第一個目標後，你可以獲得目標中一名角色的一張牌，然後你於此回合內不能對其使用牌。',
  },

  {
    source: 'feijun_description',
    target:
      '出牌階段限一次，你可以棄置一張牌，然後可以選擇一項：1.令一名手牌數多於你角色交給你一張牌；2.令一名裝備區內牌數多於你的角色棄置一張裝備牌。',
  },
  {
    source: 'binglve_description',
    target: '<b>鎖定技</b>，當你發動“飛軍”後，若此次“飛軍”的目標於此前未成為過你發動“飛軍”的目標，你摸兩張牌。',
  },

  {
    source: 'huaiju_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你獲得3枚“橘”標記；有“橘”的角色於其摸牌階段多摸一張牌；當有“橘”的角色受到傷害時，防止此傷害。',
  },
  {
    source: 'weili_description',
    target: '出牌階段開始時，你可以選擇一名其他角色，並移去一枚“橘”或失去1點體力，令其獲得一枚“橘”。',
  },
  {
    source: 'zhenglun_description',
    target: '摸牌階段，你可以改為獲得一枚“橘”。',
  },

  {
    source: 'kuizhu_description',
    target:
      '棄牌階段結束時，你可以選擇一項：1.令一至X名角色各摸一張牌；2.對至少一名體力值之和為X的角色各造成1點傷害，若選擇了不少於兩名角色，你失去1點體力（X為你此階段內棄置過的你的牌數）。',
  },
  {
    source: 'chezheng_description',
    target:
      '<b>鎖定技</b>，你不能對攻擊範圍內不包含你的其他角色使用牌；出牌階段結束時，若你於此階段內使用過的牌數小於這些角色，你棄置其中一名角色一張牌。',
  },
  {
    source: 'lijun_description',
    target:
      '<b>主公技</b>，其他吳勢力角色於其出牌階段使用【殺】結算結束後，其可以將此【殺】交給你，然後你可令其摸一張牌。',
  },

  {
    source: 'chenglve_description',
    target:
      '<b>轉換技</b>，出牌階段限一次，陽：你可以摸一張牌，然後棄置兩張手牌；陰：你可以摸兩張牌，然後棄置一張手牌。若如此做，你於此階段內使用與你以此法棄置牌花色相同的牌無距離和次數限制。',
  },
  {
    source: 'shicai_description',
    target: '當你於一回合首次使用一種類別的非延時類牌結算結束後，你可以將此牌置於牌堆頂，然後摸一張牌。',
  },
  {
    source: 'cunmu_description',
    target: '<b>鎖定技</b>，當你摸牌時，改為從牌堆底摸牌。',
  },

  {
    source: 'mingren_description',
    target:
      '遊戲開始時，你摸兩張牌，然後將一張手牌置於你的武將牌上，稱為“任”；結束階段開始時，你可以用一張手牌交換“任”。',
  },
  {
    source: 'zhenliang_description',
    target:
      '<b>轉換技</b>，陽：出牌階段限一次，你可以選擇你攻擊範圍內的一名角色，並棄置與你的“任”顏色相同的一張牌，對其造成1點傷害；陰：當你於回合外使用或打出牌結算結束後，你可以令一名角色摸一張牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$qizhi:1',
    target: '吾意不在此地，已遣別部出發。',
  },
  {
    source: '$qizhi:2',
    target: '聲東擊西，敵寇一網成擒！',
  },
  {
    source: '$jinqu:1',
    target: '建上昶水城，以逼夏口。',
  },
  {
    source: '$jinqu:2',
    target: '通川聚糧，伐吳之業，當步步爲營。',
  },

  {
    source: '$jianxiang:1',
    target: '得遇曹公，吾之幸也。',
  },
  {
    source: '$jianxiang:2',
    target: '曹公得荊不喜，喜得吾二人足矣。',
  },
  {
    source: '$shenshi:1',
    target: '數語之言，審時度勢。',
  },
  {
    source: '$shenshi:2',
    target: '深中足智，鑑時審情。',
  },

  {
    source: '$juzhan:1',
    target: '砍頭便砍頭，何爲怒邪？',
  },
  {
    source: '$juzhan:2',
    target: '我州但有斷頭將軍，無降將軍也！',
  },

  {
    source: '$feijun:1',
    target: '無當飛軍，伐叛亂，鎮蠻夷。',
  },
  {
    source: '$feijun:2',
    target: '山地崎嶇，也擋不住飛軍破勢！',
  },
  {
    source: '$binglve:1',
    target: '兵略者，明戰勝攻取之數，形機之勢，詐譎之變。',
  },
  {
    source: '$binglve:2',
    target: '奇略兵速，敵未能料之。',
  },

  {
    source: '$huaiju:1',
    target: '情深舐犢，懷擢藏橘。',
  },
  {
    source: '$huaiju:2',
    target: '袖中懷綠桔，遺母報乳哺。',
  },
  {
    source: '$weili:1',
    target: '違失禮儀，則懼非議。',
  },
  {
    source: '$weili:2',
    target: '行遺禮之舉，於不敬王者。',
  },
  {
    source: '$zhenglun:1',
    target: '整論四海未泰，修文德以平。',
  },
  {
    source: '$zhenglun:2',
    target: '今論者不務道德懷取之術，而惟尚武，竊所未安。',
  },

  {
    source: '$kuizhu:1',
    target: '子通專恣，必謀而誅之。',
  },
  {
    source: '$kuizhu:2',
    target: '孫綝久專，不可久忍，必潰誅！',
  },
  {
    source: '$chezheng:1',
    target: '風馳電掣，政權不怠。',
  },
  {
    source: '$chezheng:2',
    target: '唉，簾屏掣政，實爲艱事。',
  },
  {
    source: '$lijun:1',
    target: '立於朝堂，定於軍心。',
  },
  {
    source: '$lijun:2',
    target: '君，立於朝堂；軍，側於四方。',
  },

  {
    source: '$chenglve:1',
    target: '成略在胸，良計速出。',
  },
  {
    source: '$chenglve:2',
    target: '吾有良略在懷，必爲阿瞞所需。',
  },
  {
    source: '$shicai:1',
    target: '吾才滿腹，袁本初竟不從之！',
  },
  {
    source: '$shicai:2',
    target: '阿瞞有我良計，取冀州便是易如反掌。',
  },
  {
    source: '$cunmu:1',
    target: '哼，目光所及，短寸之間。',
  },
  {
    source: '$cunmu:2',
    target: '狹目之見，只能窺底。',
  },

  {
    source: '$mingren:1',
    target: '得義真所救，吾任之必盡瘁以報。',
  },
  {
    source: '$mingren:2',
    target: '吾之任，君之明舉。',
  },
  {
    source: '$zhenliang:1',
    target: '風霜以別草木之性，危亂而見貞良之節。',
  },
  {
    source: '$zhenliang:2',
    target: '貞節賢良，吾之本心。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to drop 1 hand card of another player, and this player will draw a card?',
    target: '{0}：你可以棄置非目標角色的一張牌，然後其摸一張牌',
  },

  {
    source: '{0}: do you want to draw 2 cards, then keep {1} hand cards?',
    target: '{0}：你可以摸兩張牌，然後將手牌保留至 {1} 張',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：請棄置 {1} 張牌',
  },

  {
    source: '{0}: do you want to choose a jianxiang target to draw a card?',
    target: '{0}：你可以令手牌數最少的一名角色摸一張牌',
  },

  {
    source: 'shenshi: do you want to choose a target to draw cards?',
    target: '審時：你可以令一名角色將手牌摸至四張',
  },
  {
    source: '{0}: do you want to view {1}’s hand cards?',
    target: '{0}：你可以觀看 {1} 的手牌',
  },

  {
    source: '{0}: do you want to draw a card with {1} , then he cannot use card to you this round?',
    target: '{0}：你可以與 {1} 各摸一張牌，然後其於本回合內不能對你使用牌',
  },
  {
    source: '{0}: do you want to choose a target to prey a card from him, then you cannot use card to him this round?',
    target: '{0}：你可以獲得其中一名目標角色一張牌，然後你於本回合內不能對其使用牌',
  },

  {
    source: 'feijun: please choose a target',
    target: '飛軍：請選擇一名其他角色',
  },
  {
    source: '{0}: please choose feijun options: {1}',
    target: '{0}：請選擇一項令 {1} 執行',
  },
  {
    source: 'feijun:hand',
    target: '交給你一張手牌',
  },
  {
    source: 'feijun:equip',
    target: '棄置一張裝備牌',
  },
  {
    source: '{0}: please drop a equip card',
    target: '{0}：請棄置一張裝備牌',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 orange?',
    target: '{0}：你可以選擇一名其他角色',
  },
  {
    source: 'weili:loseHp',
    target: '失去1點體力',
  },
  {
    source: 'weili:loseOrange',
    target: '移去一枚“橘”',
  },
  {
    source: '{0}: please choose weili options: {1}',
    target: '{0}：請選擇以下一項，令 {1} 獲得一枚“橘”',
  },

  {
    source: '{0}: please choose kuizhu options: {1}',
    target: '{0}：你可以令你至多 {1} 名角色各摸一張牌，或對至少一名體力值之和為 {1} 的角色各造成1點傷害',
  },
  { source: 'kuizhu:draw', target: '摸牌' },
  { source: 'kuizhu:damage', target: '傷害' },
  {
    source: '{0}: do you want to choose at most {1} targets to draw a card each?',
    target: '{0}：你可以令至多 {1} 名角色各摸一張牌',
  },
  {
    source: '{0}: do you want to choose a targets with {1} hp to deal 1 damage to each target?',
    target: '{0}：你可以對至少一名體力值之和為 {1} 的角色各造成1點傷害',
  },

  {
    source: 'chezheng: please choose a target to drop a card from him?',
    target: '掣政：請選擇其中一名角色，棄置其一張牌',
  },

  {
    source: '{0}: do you want to give {1} to {2}?',
    target: '{0}：你是否要將 {1} 交給 {2}',
  },
  {
    source: '{0}: do you want to let {1} draws a card?',
    target: '{0}：你是否要令 {1} 摸一張牌',
  },

  {
    source: '{0}: do you want to skip draw card phase to gain 1 orange?',
    target: '{0}：你可以跳過摸牌階段來獲得一枚“橘”',
  },

  {
    source: '{0}: do you want to put {1} on the top of draw stack, then draw a card?',
    target: '{0}：你可以將 {1} 置於牌堆頂，然後摸一張牌',
  },

  {
    source: '{0}: please put a hand card on your general card as ‘Ren’',
    target: '{0}：請將一張手牌置於你的武將牌上，稱為“任”',
  },
  {
    source: '{0}: do you want to exchange a hand card with a ‘Ren’?',
    target: '{0}：你可以用一張手牌交換“任”',
  },

  {
    source: '{0}: do you want to choose a target to draw a card?',
    target: '{0}：你可以令一名角色摸一張牌',
  },
];
