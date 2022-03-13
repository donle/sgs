import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'thunder', target: '雷' },

  { source: 'guanqiujian', target: '毌丘儉' },
  { source: 'zhengrong', target: '徵榮' },
  { source: 'hongju', target: '鴻舉' },
  { source: 'qingce', target: '清側' },

  { source: 'haozhao', target: '郝昭' },
  { source: 'zhengu', target: '鎮骨' },
  { source: 'zhengu sources: {0}', target: '鎮骨[{0}]' },

  { source: 'zhugezhan', target: '諸葛瞻' },
  { source: 'zuilun', target: '罪論' },
  { source: 'fuyin', target: '父蔭' },

  { source: 'chendao', target: '陳到' },
  { source: 'wanglie', target: '往烈' },

  { source: 'lukang', target: '陸抗' },
  { source: 'qianjie', target: '謙節' },
  { source: 'jueyan', target: '決堰' },
  { source: 'poshi', target: '破勢' },
  { source: 'huairou', target: '懷柔' },

  { source: 'zhoufei', target: '周妃' },
  { source: 'liangyin', target: '良姻' },
  { source: '#liangyin', target: '良姻' },
  { source: 'kongsheng', target: '箜聲' },

  { source: 'lei_yuanshu', target: '仲帝袁術' },
  { source: 'lei_yongsi', target: '庸肆' },
  { source: 'lei_weidi', target: '偽帝' },

  { source: 'zhangxiu', target: '張繡' },
  { source: 'congjian', target: '從諫' },
  { source: 'xiongluan', target: '雄亂' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhengrong_description',
    target:
      '當你使用【殺】或傷害類錦囊牌指定第一個目標後，你可以將一名手牌數不小於你的目標角色的一張牌置於你的武將牌上，稱為“榮”。',
  },
  {
    source: 'hongju_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若你擁有至少三張“榮”，你可以用至少一張手牌交換“榮”，無論你是否交換，你減1點體力上限，獲得技能“清側”。',
  },
  {
    source: 'qingce_description',
    target: '出牌階段，你可以選擇一張“榮”和一張手牌，你獲得此“榮”並棄置此手牌，然後你棄置場上一張牌。',
  },

  {
    source: 'zhengu_description',
    target:
      '結束階段開始時，你可以選擇一名其他角色，其將手牌摸至或棄置至與你的手牌數相同（最多摸至五張），且其於其下個回合結束時執行同樣的操作。',
  },

  {
    source: 'zuilun_description',
    target:
      '結束階段開始時，你可以觀看牌堆頂三張牌，若X：大於0，你獲得其中X張牌，然後將其餘牌以任意順序置於牌堆頂；為0，你選擇一名其他角色並與其各失去1點體力（X為你滿足以下條件的項數：1.你與本回合內造成過傷害；2.你與本回合內未棄置過牌；3.你的手牌數為全場最少）。',
  },
  {
    source: 'fuyin_description',
    target: '<b>鎖定技</b>，當你於一回合首次成為【殺】或【決鬥】的目標後，若使用者的手牌數不少於你，此牌對你無效。',
  },

  {
    source: 'wanglie_description',
    target:
      '你於出牌階段使用的第一張牌無距離限制；當你於出牌階段使用【殺】或普通錦囊牌時，你可以令此牌不可被響應，且你於此階段內不能再使用牌。',
  },

  {
    source: 'qianjie_description',
    target: '<b>鎖定技</b>，當你橫置前，你防止之；你不能成為拼點和延時類錦囊牌的目標。',
  },
  {
    source: 'jueyan_description',
    target:
      '出牌階段限一次，你可以廢除：武器欄，令你此階段可多使用三張【殺】；防具欄，摸三張牌且你本回合手牌上限+3；所有坐騎欄，令你此階段使用牌無距離限制；寶物欄，令你於此階段內擁有“集智”。',
  },
  {
    source: 'poshi_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若你的裝備欄均廢除或你的體力值為1，你減1點體力上限，然後將手牌摸至體力上限，失去技能“決堰”，獲得技能“懷柔”。',
  },
  {
    source: 'huairou_description',
    target: '出牌階段，你可以重鑄一張武器牌。',
  },

  {
    source: 'liangyin_description',
    target:
      '當有牌移出遊戲後，你可以令手牌數大於你的一名角色摸一張牌；當有牌從遊戲外進入手牌後，你可以令手牌數小於你的一名角色棄置一張牌。',
  },
  {
    source: 'kongsheng_description',
    target:
      '準備階段開始時，你可以將至少一張牌置於你的武將牌上。若如此做，此回合的結束階段開始時，若其中有你可以使用的裝備牌，你依次使用這些牌，並獲得其餘牌。',
  },

  {
    source: 'lei_yongsi_description',
    target:
      '<b>鎖定技</b>，摸牌階段，你令摸牌數改為X（X為存活勢力數）；出牌階段結束時，若你於此階段：未造成過傷害，你將手牌摸至體力上限；造成過至少2點傷害，你本回合手牌上限為你已損失的體力值。',
  },
  {
    source: 'lei_weidi_description',
    target:
      '<b>主公技</b>，棄牌階段開始時，若X大於0，你可以將一至X張手牌交給等量名其他群雄角色各一張（X為你的手牌數減去手牌上限的值）。',
  },

  {
    source: 'congjian_description',
    target:
      '當你成為普通錦囊牌的目標後，若目標數大於1，你可以將一張牌交給目標中的一名其他角色，若此牌：不為裝備牌，你摸一張牌；為裝備牌，你摸兩張牌。',
  },
  {
    source: 'xiongluan_description',
    target:
      '<b>限定技</b>，出牌階段，你可以廢除所有裝備欄和判定區，並選擇一名其他角色，你於此階段內對其使用牌無距離和次數限制，且其於此階段內不能使用或打出手牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhengrong:1',
    target: '跨海東征，家國俱榮！',
  },
  {
    source: '$zhengrong:2',
    target: '東征高句麗，保遼東安穩！',
  },
  {
    source: '$hongju:1',
    target: '一舉拿下，鴻途可得！',
  },
  {
    source: '$hongju:2',
    target: '鴻飛榮升，舉重若輕！',
  },
  {
    source: '$qingce:1',
    target: '感明帝之恩，清君側之賊！',
  },
  {
    source: '$qingce:2',
    target: '得太后手詔，清奸佞亂臣！',
  },

  {
    source: '$zhengu:1',
    target: '鎮守城池，必以骨相拼！',
  },
  {
    source: '$zhengu:2',
    target: '孔明計雖百算，卻難抵吾鎮骨千拒！',
  },

  {
    source: '$zuilun:1',
    target: '吾有三罪，未能除黃皓，制伯約，守國土。',
  },
  {
    source: '$zuilun:2',
    target: '哎，數罪當論，吾愧對先帝恩惠。',
  },
  {
    source: '$fuyin:1',
    target: '得父蔭庇，平步青雲。',
  },
  {
    source: '$fuyin:2',
    target: '吾自幼心懷父誡，方不愧父親蔭庇。',
  },

  {
    source: '$wanglie:1',
    target: '猛將之烈，統帥之所往。',
  },
  {
    source: '$wanglie:2',
    target: '與子龍忠勇相往，猛烈相合。',
  },

  {
    source: '$qianjie:1',
    target: '繼父之節，謙遜恭畢。',
  },
  {
    source: '$qianjie:2',
    target: '謙謙清廉德，節節卓爾茂。',
  },
  {
    source: '$jueyan:1',
    target: '毀堰壩之計，實爲阻晉糧道。',
  },
  {
    source: '$jueyan:2',
    target: '堰壩毀之，可令敵軍自退。',
  },
  {
    source: '$poshi:1',
    target: '破晉軍分進合擊之勢，牽晉軍主力之實！',
  },
  {
    source: '$poshi:2',
    target: '破羊祜之策，勢在必行！',
  },
  {
    source: '$huairou:1',
    target: '各保分界，無求細利。',
  },
  {
    source: '$huairou:2',
    target: '胸懷千萬，彰其德，包其柔。',
  },

  {
    source: '$liangyin:1',
    target: '結得良姻，固吳基業。',
  },
  {
    source: '$liangyin:2',
    target: '君恩之命，妾身良姻之福。',
  },
  {
    source: '$kongsheng:1',
    target: '窈窕淑女，箜篌友之。',
  },
  {
    source: '$kongsheng:2',
    target: '箜篌聲聲，琴瑟鳴鳴。',
  },

  {
    source: '$lei_yongsi:1',
    target: '傳朕旨意，諸部遵旨即可！',
  },
  {
    source: '$lei_yongsi:2',
    target: '傳國玉璽在手，朕一語便是天言！',
  },
  {
    source: '$lei_weidi:1',
    target: '朕今日雄舉淮南，明日便可一匡天下！',
  },
  {
    source: '$lei_weidi:2',
    target: '天下，即將盡歸我袁公路！',
  },

  {
    source: '$congjian:1',
    target: '哼，目光所及，短寸之間。',
  },
  {
    source: '$congjian:2',
    target: '狹目之見，只能窺底。',
  },

  {
    source: '$xiongluan:1',
    target: '雄踞宛城，雖亂世可安。',
  },
  {
    source: '$xiongluan:2',
    target: '北地梟雄，亂世不敗。',
  },
  {
    source: '$congjian:1',
    target: '聽君諫言，去危亡，保宗祀。',
  },
  {
    source: '$congjian:2',
    target: '從諫良計，可得自保。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source:
      '{0}: do you want to choose a target to draw or drop hand cards until the number of hand cards equal to you?',
    target: '{0}：你可以令一名其他角色將手牌摸至或棄置至與你的手牌數相同',
  },
  {
    source: '{0}: please drop {1} card(s)',
    target: '{0}：請棄置 {1} 張牌',
  },

  {
    source:
      '{0}: do you want to choose a target to prey a card from him, and put this card on your general card as ‘Rong’?',
    target: '{0}：你可以將一名手牌數不小於你的目標角色的一張牌置為“榮”',
  },

  {
    source: '{0}: do you want to obtain {1} card(s) from the top of draw stack?',
    target: '{0}：你可以獲得牌堆頂 {1} 張牌',
  },
  {
    source:
      '{0}: do you want to view 3 cards from the top of draw stack, then choose another player to lose 1 hp with him?',
    target: '{0}：你可以觀看牌堆頂三張牌，然後選擇一名其他角色與你失去1點體力',
  },
  {
    source: 'to obtain',
    target: '獲得的牌',
  },
  {
    source: 'zuilun: please choose another player to lose 1 hp with you',
    target: '罪論：請選擇一名其他角色與你各失去1點體力',
  },

  {
    source: '{0}: do you want to make {1} disreponsive, then you cannot use card this phase?',
    target: '{0}：你可以令 {1} 不可被響應，然後你於此階段內不能再使用牌',
  },

  {
    source: '{0}: do you want to choose a liangyin target to draw 1 card?',
    target: '{0}：你可以令一名手牌數多於你的角色摸一張牌',
  },
  {
    source: '{0}: do you want to choose a liangyin target to drop 1 card?',
    target: '{0}：你可以令一名手牌數少於你的角色棄置一張牌',
  },
  {
    source: '{0}: please drop a card',
    target: '{0}：請棄置一張牌',
  },

  {
    source: '{0}: do you want to put at least 1 card on your general card as ‘Kong’?',
    target: '{0}：你可以將至少一張牌置為“箜”',
  },
  {
    source: '{0}: please use a equip from ‘Kong’',
    target: '{0}：請選擇“箜”中的一張裝備牌使用',
  },

  {
    source: '{0}: do you want to choose a card to give it to another Qun general (can repeat {1} times)?',
    target: '{0}：你可以選擇一張手牌和一名其他群雄角色，將此牌交給他（可重複 {1} 次）',
  },

  {
    source: '{0}: do you want to give a card to another target?',
    target: '{0}：你可以將一張牌交給一名其他角色，然後摸一張牌（若交出裝備牌則改為摸兩張）',
  },
];
