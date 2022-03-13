import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'decade', target: '十週年' },

  { source: 'niujin', target: '牛金' },
  { source: 'cuirui', target: '摧銳' },
  { source: 'liewei', target: '裂圍' },

  { source: 'zhanghu', target: '張虎' },
  { source: 'cuijian', target: '摧堅' },
  { source: 'cuijian_I', target: '摧堅' },
  { source: 'cuijian_II', target: '摧堅' },
  { source: 'cuijian_EX', target: '摧堅' },
  { source: 'tongyuan', target: '同援' },

  { source: 'xugong', target: '許貢' },
  { source: 'biaozhao', target: '表召' },
  { source: 'yechou', target: '業仇' },
  { source: '#s_yechou_debuff', target: '業仇（失去體力）' },

  { source: 'zhangwen', target: '張溫' },
  { source: 'songshu', target: '頌蜀' },
  { source: 'sibian', target: '思辨' },

  { source: 'lijue', target: '李傕' },
  { source: 'langxi', target: '狼襲' },
  { source: 'yisuan', target: '亦算' },

  { source: 'guosi', target: '郭汜' },
  { source: 'tanbei', target: '貪狽' },
  { source: 'sidao', target: '伺盜' },

  { source: 'fanchou', target: '樊稠' },
  { source: 'xingluan', target: '興亂' },

  { source: 'zhangji', target: '張濟' },
  { source: 'lveming', target: '掠命' },
  { source: 'lveming times: {0}', target: '掠命[{0}]' },
  { source: 'tunjun', target: '屯軍' },

  { source: 'liangxing', target: '梁興' },
  { source: 'lulve', target: '擄掠' },
  { source: 'zhuixi', target: '追襲' },

  { source: 'duanwei', target: '段煨' },
  { source: 'langmie', target: '狼滅' },

  { source: 'zhangheng', target: '張橫' },
  { source: 'dangzai', target: '擋災' },
  { source: 'liangjue', target: '糧絕' },

  { source: 'panfeng', target: '潘鳳' },
  { source: 'kuangfu', target: '狂斧' },

  { source: 'xingdaorong', target: '邢道榮' },
  { source: 'xuhe', target: '虛猲' },

  { source: 'caoxing', target: '曹性' },
  { source: 'liushi', target: '流矢' },
  { source: 'liushi: {0}', target: '流矢[{0}]' },
  { source: 'zhanwan', target: '斬腕' },

  { source: 'zhaozhong', target: '趙忠' },
  { source: 'yangzhong', target: '殃衆' },
  { source: 'huangkong', target: '惶恐' },

  { source: 'hucheer', target: '胡車兒' },
  { source: 'daoji', target: '盜戟' },
  { source: 'fuzhong', target: '負重' },
  { source: 'zhong', target: '重' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'cuirui_description',
    target: '你的第一個回合開始時，你可以獲得一至X名其他角色的各一張手牌（X爲你的體力值）。',
  },
  {
    source: 'liewei_description',
    target: '每回合限X次（X爲你的體力值），當你令其他角色進入瀕死狀態時，你可以摸一張牌。',
  },

  {
    source: 'cuijian_description',
    target:
      '出牌階段限一次，你可以選擇一名有手牌的其他角色，若其手牌中；有【閃】，其將手牌裏的所有【閃】和裝備區裏的防具牌交給你，然後你交給其等量的牌；沒有【閃】，你棄置一張手牌。',
  },
  {
    source: 'cuijian_I_description',
    target:
      '出牌階段限一次，你可以選擇一名有手牌的其他角色，若其手牌中；有【閃】，其將手牌裏的所有【閃】和裝備區裏的防具牌交給你，然後你交給其等量的牌；沒有【閃】，你摸一張牌。',
  },
  {
    source: 'cuijian_II_description',
    target:
      '出牌階段限一次，你可以選擇一名有手牌的其他角色，若其手牌中；有【閃】，其將手牌裏的所有【閃】和裝備區裏的防具牌交給你，然後你交給其一張牌；沒有【閃】，你棄置一張手牌。',
  },
  {
    source: 'cuijian_EX_description',
    target:
      '出牌階段限一次，你可以選擇一名有手牌的其他角色，若其手牌中；有【閃】，其將手牌裏的所有【閃】和裝備區裏的防具牌交給你，然後你交給其一張牌；沒有【閃】，你摸一張牌。',
  },
  {
    source: 'tongyuan_description',
    target:
      '<b>鎖定技</b>，當你於回合外使用牌結算結束後，若此牌爲：【無懈可擊】，你將你的“摧堅”中的“你棄置一張手牌”修改爲“你摸一張牌”；【桃】，你將你的“摧堅”中的“你交給其等量的牌”修改爲“你交給其一張牌”。若以上兩個修改都已被觸發，則你於本局遊戲內接下來使用的【無懈可擊】不可被抵消，使用的【桃】回覆值+1。',
  },

  {
    source: 'biaozhao_description',
    target:
      '結束階段開始時，若你沒有“表”，你可以將一張牌扣置於你的武將牌上，稱爲“表”；當與你的“表”花色和點數均相同的牌進入棄牌堆後，你移去你的“表”（若進入棄牌堆的牌爲其他角色棄置，則改爲該角色獲得你的“表”），且你失去1點體力；準備階段開始時，若你有“表”，你移去你的“表”，選擇一名角色，令其回覆1點體力並將手牌摸至X張（X爲場上手牌數最多的角色的手牌數，且至多爲5）。',
  },
  {
    source: 'yechou_description',
    target:
      '當你死亡時，你可以選擇一名已損失體力值大於1的其他角色。若如此做，直到其下個回合開始前，其於每名角色的回合結束時失去1點體力。',
  },

  {
    source: 'songshu_description',
    target: '出牌階段，你可以與一名角色拼點。若你沒贏，其摸兩張牌，且本技能於此階段內失效。',
  },
  {
    source: 'sibian_description',
    target:
      '摸牌階段，你可以改爲亮出牌堆頂四張牌，你獲得其中點數最大和最小的所有牌，然後若剩餘的牌數爲2且它們的點數之差小於存活角色數，你可以將剩餘的牌交給手牌數最少的一名角色。',
  },

  {
    source: 'langxi_description',
    target: '準備階段開始時，你可以選擇一名體力值不大於你的其他角色，你對其造成0~2點隨機傷害。',
  },
  {
    source: 'yisuan_description',
    target: '每階段限一次，當你於出牌階段內使用普通錦囊牌結算結束後，你可以減1點體力上限，獲得之。',
  },

  {
    source: 'tanbei_description',
    target:
      '出牌階段限一次，你可以令一名其他角色選擇一項：1.令你隨機獲得其區域內的一張牌，然後你此階段內不能對其使用牌；2.令你此階段內對其使用牌無距離和次數限制。',
  },
  {
    source: 'sidao_description',
    target:
      '每階段限一次，當你於出牌階段內使用牌結算結束後，若此牌有包含在你於此階段內使用過的上一張牌的目標中的目標角色，你可以將一張手牌當【順手牽羊】對其中一名角色使用（目標須合法）。',
  },

  {
    source: 'xingluan_description',
    target: '每階段限一次，當你於出牌階段內使用牌結算結束後，你可以從牌堆隨機獲得點數爲6的一張牌。',
  },

  {
    source: 'lveming_description',
    target:
      '出牌階段限一次，你可以令裝備區裏牌數小於你的一名角色選擇一個點數，然後你判定，若結果點數與其所選點數：相等，你對其造成2點傷害；不等，你隨機獲得其區域裏的一張牌。',
  },
  {
    source: 'tunjun_description',
    target:
      '<b>限定技</b>，出牌階段，你可以令有空裝備欄的一名角色依次從牌堆隨機使用X張其裝備區內沒有的副類別的裝備牌（X爲你本局遊戲發動過“掠命”的次數）。',
  },

  {
    source: 'lulve_description',
    target:
      '出牌階段開始時，你可以令有手牌且手牌數小於你的一名角色選擇一項：1.將所有手牌交給你，然後你翻面；2.翻面，然後視爲對你使用一張【殺】。',
  },
  {
    source: 'zhuixi_description',
    target: '<b>鎖定技</b>，當你對一名角色造成傷害時，或一名角色對你造成傷害時，若其武將牌正面朝向與你不同，此傷害+1。',
  },

  {
    source: 'langmie_description',
    target:
      '其他角色的出牌階段結束時，若其於此階段內使用過至少兩張同類別的牌，你可以摸一張牌；其他角色的結束階段開始時，若其於本回合內造成過的傷害值不少於2點，你可以棄置一張牌，對其造成1點傷害。',
  },

  {
    source: 'dangzai_description',
    target: '出牌階段開始時，你可以將一名其他角色判定區裏的一張牌移至你的判定區。',
  },
  {
    source: 'liangjue_description',
    target: '<b>鎖定技</b>，當黑色牌進入或離開你的判定區或裝備區後，若你的體力值大於1，你失去1點體力，然後摸兩張牌。',
  },

  {
    source: 'kuangfu_description',
    target:
      '出牌階段限一次，你可以棄置一名角色裝備區裏的一張牌，然後視爲使用一張無距離限制的【殺】（不計入次數限制）。若你以此法棄置的牌爲：你的牌，且此【殺】造成過傷害，你摸兩張牌；其他角色的牌，且此【殺】未造成過傷害，你棄置兩張手牌。',
  },

  {
    source: 'xuhe_description',
    target:
      '出牌階段開始時，你可以減1點體力上限，然後棄置距離1以內的所有角色各一張牌或令這些角色各摸一張牌；出牌階段結束時，若你的體力上限爲全場最少，你加1點體力上限。',
  },

  {
    source: 'liushi_description',
    target:
      '出牌階段，你可以將一張紅桃牌置於牌堆頂，然後視爲使用一張無距離限制的【殺】（不計入次數限制）。當此【殺】造成傷害後，受傷角色的手牌上限-1。',
  },
  {
    source: 'zhanwan_description',
    target:
      '<b>鎖定技</b>，受到“流矢”效果影響的角色的棄牌階段結束時，若其於此階段內棄置過其牌，你摸等量的牌，然後移除其“流矢”效果。',
  },

  {
    source: 'yangzhong_description',
    target:
      '當你造成傷害後，你可以棄置兩張牌，令受傷角色失去1點體力；當你受到傷害後，傷害來源可以棄置兩張牌，令你失去1點體力。',
  },
  {
    source: 'huangkong_description',
    target: '<b>鎖定技</b>，當你於回合外成爲【殺】或傷害類錦囊牌的唯一目標後，若你沒有手牌，你摸兩張牌。',
  },

  {
    source: 'daoji_description',
    target:
      '當其他角色使用其於本局遊戲內使用過的第一張武器牌時，你可以選擇一項：1.獲得此武器牌；2.其本回合不能使用或打出【殺】。',
  },
  {
    source: 'fuzhong_description',
    target:
      '<b>鎖定技</b>，當你於回合外獲得牌後，你獲得1枚“重”標記；若你的“重”標記數不小於：1，你的手牌上限+1；2，你計算與其他角色的距離-1；3，摸牌階段多摸一張牌；4，回合開始時，你對一名其他角色造成1點傷害，然後移去你的所有“重”。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$cuirui:1',
    target: '摧折銳氣，未戰先衰。',
  },
  {
    source: '$cuirui:2',
    target: '挫其銳氣，折其旌旗。',
  },
  {
    source: '$liewei:1',
    target: '都給我交出來！',
  },
  {
    source: '$liewei:2',
    target: '還有點用，暫且饒你一命。',
  },

  {
    source: '$cuijian:1',
    target: '所當皆披靡，破堅若無人！',
  },
  {
    source: '$cuijian:2',
    target: '一槍定頑敵，一騎破堅城！',
  },
  {
    source: '$tongyuan:1',
    target: '樂將軍何在？隨我共援上方谷！',
  },
  {
    source: '$tongyuan:2',
    target: '袍澤有難，豈有坐視之理？',
  },

  {
    source: '$biaozhao:1',
    target: '此人有禍患之相，望丞相慎之。',
  },
  {
    source: '$biaozhao:2',
    target: '孫策宜加貴寵，須召還京邑。',
  },
  {
    source: '$yechou:1',
    target: '會有人替我報仇的！',
  },
  {
    source: '$yechou:2',
    target: '我的門客，是不會放過你的！',
  },

  {
    source: '$songshu:1',
    target: '稱頌蜀漢，以表誠心。',
  },
  {
    source: '$songshu:2',
    target: '吳蜀兩和，方可安穩。',
  },
  {
    source: '$sibian:1',
    target: '才藻俊茂，辨思如湧。',
  },
  {
    source: '$sibian:2',
    target: '弘雅之素，英秀之德。',
  },

  {
    source: '$langxi:1',
    target: '襲奪之勢，如狼噬骨！',
  },
  {
    source: '$langxi:2',
    target: '引吾至此，怎能不襲掠之？',
  },
  {
    source: '$yisuan:1',
    target: '吾亦能善算謀劃！',
  },
  {
    source: '$yisuan:2',
    target: '算計人心，我也可略施一二。',
  },

  {
    source: '$tanbei:1',
    target: '此機，我怎麼會錯失？',
  },
  {
    source: '$tanbei:2',
    target: '你的東西，現在是我的了！',
  }, 
  {
    source: '$sidao:1',
    target: '連發伺動，順手可得。',
  },
  {
    source: '$sidao:2',
    target: '伺機而動，此地可竊。',
  },

  {
    source: '$xingluan:1',
    target: '大興兵爭，長安當亂！',
  },
  {
    source: '$xingluan:2',
    target: '勇猛興軍，亂世當立！',
  },

  {
    source: '$lveming:1',
    target: '劫命掠財，毫不費力。',
  },
  {
    source: '$lveming:2',
    target: '人財，皆掠之。嘿嘿！',
  }, 
  {
    source: '$tunjun:1',
    target: '得封侯爵，屯軍弘農。',
  },
  {
    source: '$tunjun:2',
    target: '屯軍弘農，養精蓄銳。',
  },

  {
    source: '$lulve:1',
    target: '趁火打劫，乘威擄掠。',
  },
  {
    source: '$lulve:2',
    target: '天下大亂，擄掠以自保。',
  },
  {
    source: '$zhuixi:1',
    target: '得勢追襲，勝望在握！',
  },
  {
    source: '$zhuixi:2',
    target: '諸將得令，追而襲之！',
  },

  {
    source: '$langmie:1',
    target: '羣狼四起，滅其以威衆！',
  },
  {
    source: '$langmie:2',
    target: '貪狼強力，寡義而趨利。',
  },

  {
    source: '$dangzai:1',
    target: '此處有我，休得放肆！',
  },
  {
    source: '$dangzai:2',
    target: '退後，讓我來！',
  },
  {
    source: '$liangjue:1',
    target: '行軍者，切不可無糧。',
  },
  {
    source: '$liangjue:2',
    target: '糧盡援絕，需另謀出路。',
  },

  {
    source: '$liushi:1',
    target: '就你叫夏侯惇？',
  },
  {
    source: '$liushi:2',
    target: '兀那賊將，且喫我一箭！',
  },
  {
    source: '$zhanwan:1',
    target: '郝萌！爾敢造反不成？',
  },
  {
    source: '$zhanwan:2',
    target: '健兒護主，奸逆斷腕！',
  },

  {
    source: '$kuangfu:1',
    target: '大斧到處，片甲不留！',
  },
  {
    source: '$kuangfu:2',
    target: '你可接得住我一斧？',
  },

  {
    source: '$xuhe:1',
    target: '說出吾名，嚇汝一跳！',
  },
  {
    source: '$xuhe:2',
    target: '我乃是零陵上將軍！',
  },

  {
    source: '$yangzhong:1',
    target: '宦禍所起，池魚所終。',
  },
  {
    source: '$yangzhong:2',
    target: '竊權利己，弄禍殃衆。',
  },
  {
    source: '$huangkong:1',
    target: '滿腹忠心，如履薄冰！',
  },
  {
    source: '$huangkong:2',
    target: '咱家乃皇帝之母，能有什麼壞心思？',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
    target: '{0}；你可以對體力值不大於你的一名其他角色造成0~2點隨機傷害',
  },

  {
    source: '{0}: do you want to lose a max hp to gain {1}?',
    target: '{0}；你可以減1點體力上限以獲得 {1}',
  },

  {
    source: '{0}: do you want to gain a card with card number 6 from draw stack?',
    target: '{0}；你可以從牌堆隨機獲得點數爲6的一張牌',
  },

  {
    source: '{0}: please choose lveming options',
    target: '{0}；請選擇一個點數',
  },

  {
    source: '{0}: please choose tanbei options: {1}',
    target:
      '{0}；請選擇一項：1.令 {1} 隨機獲得你區域內的一張牌，然後其本回合不能對你使用牌；2.令 {1} 本回合對你用牌無限制',
  },
  { source: 'tanbei:prey', target: '令其獲得牌' },
  { source: 'tanbei:unlimited', target: '令其對你用牌無限制' },

  {
    source: '{0}: do you want to use a card as ShunShouQianYang to one of them?',
    target: '{0}；你可以將一張手牌當【順手牽羊】對其中一名角色使用（目標須合法）',
  },

  {
    source: '{0}: do you want to choose a lulve target to use this skill?',
    target: '{0}；你可以選擇手牌數少於你的一名角色，對其發動“擄掠”',
  },
  {
    source: '{0}: please choose lulve options: {1}',
    target: '{0}；請選擇一項：1.交給 {1} 所有手牌，其翻面；2.你翻面，視爲對 {1} 使用一張【殺】',
  },
  { source: 'lulve:prey', target: '交給其手牌' },
  { source: 'lulve:turnOver', target: '你翻面' },

  {
    source: '{0}: please choose a target to use a virtual slash to him',
    target: '{0}；請爲此【殺】選擇目標',
  },

  {
    source: '{0}: please choose xuhe options: {1}',
    target: '{0}；你可以棄置 {1} 各一張牌，或令這些角色各摸一張牌',
  },
  { source: 'xuhe:draw', target: '摸牌' },
  { source: 'xuhe:discard', target: '棄置牌' },

  {
    source: '{0}: do you want to discard 2 cards to let {1} lose 1 hp?',
    target: '{0}；你可以棄置兩張牌，令 {1} 失去1點體力',
  },

  {
    source: '{0}: you need to give a handcard to {1}, otherwise you cannot response the card {1} use',
    target: '{0}；你可以交給 {1} 一張牌，否則你本回合不能響應 {1} 使用的牌',
  },

  {
    source: '{0}: please choose daoji options: {1} {2}',
    target: '{0}；你可以獲得 {1} ，或令 {2} 本回合不能使用或打出【殺】',
  },
  { source: 'daoji:prey', target: '獲得此武器' },
  { source: 'daoji:block', target: '其不能出殺' },

  {
    source: 'fuzhong: please choose another player to deal 1 damage',
    target: '負重：請選擇一名其他角色，對其造成1點傷害',
  },

  {
    source: '{0}: do you want to choose at most {1} targets to prey cards?',
    target: '{0}；你可以獲得至多 {1} 名其他角色各一張牌',
  },

  {
    source: '{0}: do you want to display 4 cards from the top of draw stack?',
    target: '{0}；你可以改爲亮出牌堆頂四張牌，獲得其中點數最大和最小的所有牌',
  },
  {
    source: '{0}: do you want to choose a target to give him {1}',
    target: '{0}；你可以將 {1} 交給手牌數最少的一名角色',
  },

  {
    source: '{0}: do you want to put a card on your general card as ‘Biao’?',
    target: '{0}；你可以將一張牌置爲“表”',
  },
  {
    source: 'biaozhao: please choose a target to let him recover 1 hp, and then he draws {1} cards',
    target: '表召：請選擇一名角色，令其回覆1點體力，將手牌摸至 {1} 張',
  },

  {
    source: '{0}: do you want to choose a yechou target to use this skill?',
    target: '你可以對已損失體力值大於1的一名其他角色發動【{0}】',
  },
];
