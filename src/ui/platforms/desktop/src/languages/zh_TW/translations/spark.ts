import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'spark', target: '星火燎原' },

  { source: 'lvqian', target: '呂虔' },
  { source: 'weilu', target: '威虜' },
  { source: 'zengdao', target: '贈刀' },
  { source: 's_zengdao_buff', target: '贈刀（增加傷害）' },

  { source: 'spark_pangtong', target: '吳龐統' },
  { source: 'guolun', target: '過論' },
  { source: 'songsang', target: '送喪' },
  { source: 'zhanji', target: '展驥' },

  { source: 'panjun', target: '潘濬' },
  { source: 'guanwei', target: '觀微' },
  { source: 'gongqing', target: '公清' },

  { source: 'yanjun', target: '嚴畯' },
  { source: 'guanchao', target: '觀潮' },
  { source: '#guanchao', target: '觀潮' },
  { source: 'guanchao increase', target: '觀潮 增' },
  { source: 'guanchao decrease', target: '觀潮 減' },
  { source: 'guanchao increase: {0}', target: '觀潮 增[{0}]' },
  { source: 'guanchao decrease: {0}', target: '觀潮 減[{0}]' },
  { source: 'xunxian', target: '遜賢' },

  { source: 'zhoufang', target: '周魴' },
  { source: 'duanfa', target: '斷髮' },
  { source: 'youdi', target: '誘敵' },

  { source: 'lvdai', target: '呂岱' },
  { source: 'qinguo', target: '勤國' },

  { source: 'liuyan', target: '劉焉' },
  { source: 'tushe', target: '圖射' },
  { source: 'limu', target: '立牧' },

  { source: 'liuyao', target: '劉繇' },
  { source: 'kannan', target: '戡難' },
  { source: 'kannan damage: {0}', target: '戡難[{0}]' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'weilu_description',
    target:
      '<b>鎖定技</b>，當你受到其他角色造成的傷害後，其於你下回合的出牌階段開始時失去體力至1點，且此階段結束時回覆以此法失去的體力。',
  },
  {
    source: 'zengdao_description',
    target:
      '<b>限定技</b>，出牌階段，你可以將至少一張裝備區裡的牌置於一名其他角色的武將牌旁，稱為“刀”。若如此做，當其造成傷害時，其移去一張“刀”，令此傷害+1。',
  },

  {
    source: 'guolun_description',
    target:
      '出牌階段限一次，你可以展示一名其他角色的一張手牌，然後你可展示一張牌並與其交換雙方展示的牌，以此法交出點數較小的牌的角色摸一張牌。',
  },
  {
    source: 'songsang_description',
    target:
      '<b>限定技</b>，當其他角色死亡後，若你：已受傷，你可以回覆1點體力；未受傷，你可以加1點體力。若如此做，你獲得技能“展驥”。',
  },
  {
    source: 'zhanji_description',
    target: '<b>鎖定技</b>，當你於出牌階段不因此技能而摸牌後，你摸一張牌。',
  },

  {
    source: 'guanwei_description',
    target:
      '每回合限一次，一名角色的出牌階段結束時，若其於本回合內使用過的牌數大於1且花色均相同，你可以棄置一張牌，令其摸兩張牌，且其於此階段結束後執行一個額外的出牌階段。',
  },
  {
    source: 'gongqing_description',
    target:
      '<b>鎖定技</b>，當你受到傷害時，若傷害來源的攻擊範圍：小於3且傷害值大於1，你將傷害改為1點；大於3，此傷害+1。',
  },

  {
    source: 'guanchao_description',
    target:
      '出牌階段開始時，你可以選擇一項效果持續到本階段結束：1.當你使用牌時，若你此階段內使用過的所有牌點數均嚴格遞增，你摸一張牌；2.當你使用牌時，若你此階段內使用過的所有牌點數均嚴格遞減，你摸一張牌。',
  },
  {
    source: 'xunxian_description',
    target: '每回合限一次，當你於回合外使用或打出的牌進入棄牌堆後，你可以將這些牌交給手牌數大於你的一名角色。',
  },

  {
    source: 'duanfa_description',
    target:
      '出牌階段，若X大於0，你可以棄置一至X張黑色牌，然後摸等量的牌（X為你的體力上限減去你此階段內以此法棄置過的牌數之差）。',
  },
  {
    source: 'youdi_description',
    target:
      '結束階段開始時，你可以令一名其他角色棄置你一張手牌，若以此法棄置的牌不為【殺】，你獲得其一張牌。且若以此法棄置的牌不為黑色牌，你摸一張牌。',
  },

  {
    source: 'qinguo_description',
    target:
      '當你於回合內使用裝備牌結算結束後，你可以視為使用一張【殺】；當你失去裝備區裡的牌後，或有牌進入你的裝備區後，若你裝備區裡的牌數與你的體力值相等，且與此次移動前不相等，你回覆1點體力。',
  },

  {
    source: 'tushe_description',
    target: '當你使用非裝備牌指定第一個目標後，若你的手牌中沒有基本牌，你可以摸X張牌（X為目標數）。',
  },
  {
    source: 'limu_description',
    target:
      '出牌階段，你可以將一張方塊牌當【樂不思蜀】對自己使用，然後回覆1點體力；若你的判定區有牌，你對攻擊範圍內的角色使用牌無距離和次數限制。',
  },

  {
    source: 'kannan_description',
    target:
      '出牌階段限X次，你可以與你於此階段內未以此法拼點過的一名角色拼點，贏的角色使用的下一張【殺】傷害基數+1，若該角色為你，則你此階段不能再發動此技能。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$weilu:1',
    target: '賊人勢大，須從長計議。',
  },
  {
    source: '$weilu:2',
    target: '時機未到，先行撤退。',
  },
  {
    source: '$zengdao:1',
    target: '有功賞之，有過罰之。',
  },
  {
    source: '$zengdao:2',
    target: '治軍之道，功過分明。',
  },

  {
    source: '$guolun:1',
    target: '品過是非，討評好壞。',
  },
  {
    source: '$guolun:2',
    target: '若有天下太平時，必討四海之內才。',
  },
  {
    source: '$songsang:1',
    target: '送喪至東吳，使命已完。',
  },
  {
    source: '$songsang:2',
    target: '送喪雖至，吾與孝則得相交。',
  },
  {
    source: '$zhanji:1',
    target: '功曹之恩，吾必有展驥之機。',
  },
  {
    source: '$zhanji:2',
    target: '展吾驥足，施吾羽翅。',
  },

  {
    source: '$guanwei:1',
    target: '今日宴請諸位，有要事相商。',
  },
  {
    source: '$guanwei:2',
    target: '天下未定，請主公以大局爲重。',
  },
  {
    source: '$gongqing:1',
    target: '爾輩何故與降虜交善！',
  },
  {
    source: '$gongqing:2',
    target: '豪將在外，增兵必成禍患啊！',
  },

  {
    source: '$guanchao:1',
    target: '朝夕之間，可知所進退。',
  },
  {
    source: '$guanchao:2',
    target: '月盈，潮起晨暮也；月虧，潮起日半也。',
  },
  {
    source: '$xunxian:1',
    target: '督軍之才，子明強於我甚多。',
  },
  {
    source: '$xunxian:2',
    target: '此間重任，公卿可擔之。',
  },

  {
    source: '$duanfa:1',
    target: '東吳已容不下我，願降以保周全。',
  },
  {
    source: '$duanfa:2',
    target: '箋書七條，足以表我歸降之心。',
  },
  {
    source: '$youdi:1',
    target: '身體髮膚，受之父母。',
  },
  {
    source: '$youdi:2',
    target: '今斷髮以明志，尚不可證吾之心意！',
  },

  {
    source: '$qinguo:1',
    target: '爲國勤事，體素精勤。',
  },
  {
    source: '$qinguo:2',
    target: '忠勤爲國，通達治體。',
  },

  {
    source: '$tushe:1',
    target: '非英傑不圖？吾既謀之且射畢。',
  },
  {
    source: '$tushe:2',
    target: '漢室衰微，朝綱禍亂，必圖後福。',
  },
  {
    source: '$limu:1',
    target: '米賊作亂，吾必爲益州自保。',
  },
  {
    source: '$limu:2',
    target: '廢史立牧，可得一方安定。',
  },

  {
    source: '$kannan:1',
    target: '俊才之傑，材匪戡難。',
  },
  {
    source: '$kannan:2',
    target: '戡，克也，難，攻之。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please remove a ‘Dao’',
    target: '{0}：請選擇一張“刀”移去',
  },

  {
    source: '{0}: you can show a hand card and exchange this card for {1}',
    target: '{0}：你可以展示一張牌並交換 {1}',
  },

  {
    source: '{0}: do you want to drop a card to let {1} draw 2 cards and gain an extra play phase?',
    target: '{0}：你可以棄置一張牌，令 {1} 摸兩張牌並執行一個額外的出牌階段',
  },

  {
    source: 'guanchao: please choose one option',
    target: '觀潮：請選擇你此階段內須滿足的點數形式。',
  },
  { source: 'guanchao:increase', target: '遞增' },
  { source: 'guanchao:decrease', target: '遞減' },

  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以將 {1} 交給手牌數大於你的一名角色',
  },
  {
    source: '{0}: do you want to give {1} cards to another player?',
    target: '{0}：你可以將 {1} 等牌交給手牌數大於你的一名角色',
  },

  {
    source: '{0}: do you want to choose another player to let him drop a hand card from you?',
    target: '{0}：你可以令一名其他角色棄置你一張手牌',
  },
  {
    source: '{0}: do you want to give {1} to another player with the number of hand cards more than you?',
    target: '{0}: 將【{1}】交給一名手牌比你多的其他角色',
  },
  {
    source: '{0}: do you want to give {1} cards to another player with the number of hand cards more than you?',
    target: '{0}: 將 {1} 張牌交給一名手牌比你多的其他角色',
  },
];
