import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2014', target: '將4' },

  { source: 'caozhen', target: '曹真' },
  { source: 'sidi', target: '司敵' },

  { source: 'hanhaoshihuan', target: '韓浩史渙' },
  { source: 'shenduan', target: '慎斷' },
  { source: 'yonglve', target: '勇略' },

  { source: 'chenqun', target: '陳羣' },
  { source: 'pindi', target: '品第' },
  { source: 'faen', target: '法恩' },

  { source: 'caoxiu', target: '曹休' },
  { source: 'qianju', target: '千駒' },
  { source: 'qingxi', target: '傾襲' },

  { source: 'wuyi', target: '吳懿' },
  { source: 'benxi', target: '奔襲' },
  { source: 'benxi times: {0}', target: '奔襲[{0}]' },

  { source: 'zhoucang', target: '周倉' },
  { source: 'zhongyong', target: '忠勇' },

  { source: 'zhangsong', target: '張松' },
  { source: 'qiangzhi', target: '強識' },
  { source: 'qiangzhi type: {0}', target: '強識[{0}]' },
  { source: 'xiantu', target: '獻圖' },

  { source: 'sunluban', target: '孫魯班' },
  { source: 'zenhui', target: '譖毀' },
  { source: 'jiaojin', target: '驕矜' },

  { source: 'zhuhuan', target: '朱桓' },
  { source: 'fenli', target: '奮勵' },
  { source: 'pingkou', target: '平寇' },

  { source: 'guyong', target: '顧雍' },
  { source: 'shenxing', target: '慎行' },
  { source: 'bingyi', target: '秉壹' },

  { source: 'yjcm_jushou', target: '沮授' },
  { source: 'jianying', target: '漸營' },
  { source: '#jianying', target: '漸營' },
  { source: 'shibei', target: '矢北' },

  { source: 'caifuren', target: '蔡夫人' },
  { source: 'qieting', target: '竊聽' },
  { source: 'xianzhou', target: '獻州' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sidi_description',
    target:
      '結束階段開始時，你可以將一張非基本牌置於你的武將牌上，稱爲“司”；其他角色的出牌階段開始時，你可以移去一張“司”，令其此階段內不能使用或打出與此“司”顏色相同的牌。若如此做，此階段結束時，若其於此階段內未使用過【殺】，你視爲對其使用一張【殺】，且若其於此階段內未使用過錦囊牌，你摸兩張牌。',
  },

  {
    source: 'shenduan_description',
    target: '當你因棄置而失去一張黑色非錦囊牌後，你可以將此牌當【兵糧寸斷】使用（無距離限制）。',
  },
  {
    source: 'yonglve_description',
    target:
      '其他角色的判定階段開始時，你可以棄置其判定區裏的一張牌，然後若該角色：在你的攻擊範圍內，你摸一張牌；不在你的攻擊範圍內，你視爲對其使用一張【殺】。',
  },

  {
    source: 'pindi_description',
    target:
      '出牌階段，你可以棄置一張本回合內你未以此法棄置過的類別的牌，並選擇本回合內你未以此法選擇過的一名其他角色，你選擇一項：1.令其棄置X張牌；2.令其摸X張牌（X爲你本回合發動過此技能的次數）。然後若其已受傷，你橫置。',
  },
  { source: 'faen_description', target: '當一名角色的武將牌翻至正面或橫置後，你可以令其摸一張牌。' },

  {
    source: 'benxi_description',
    target:
      '<b>鎖定技</b>，當你於回合內使用牌時，本回合你計算與其他角色的距離-1；你的回合內，若你與所有其他角色的距離均爲1，則當你使用【殺】或普通錦囊牌指定唯一目標時，選擇一至兩項：1.此牌目標+1；2.此牌無視防具；3.此牌不能被抵消；4.此牌造成傷害時，你摸一張牌。',
  },

  {
    source: 'zhongyong_description',
    target:
      '當你使用的【殺】結算結束後，你可以將此【殺】和此次結算中響應過此【殺】的【閃】交給除此【殺】目標外的一名其他角色，若其以此法獲得了黑色牌，其摸一張牌，且若其以此法獲得了紅色牌，其可對你攻擊範圍內的一名角色使用一張【殺】（無距離限制）。',
  },
  {
    source: 'qiangzhi_description',
    target:
      '出牌階段開始時，你可以展示一名其他角色的一張手牌，然後當你於此階段使用一張與展示牌類別相同的牌時，你可以摸一張牌。',
  },
  {
    source: 'xiantu_description',
    target:
      '其他角色的出牌階段開始時，你可以摸兩張牌，然後交給其兩張牌。若如此做，此階段結束時，若其於此階段內未殺死過角色，你失去1點體力。',
  },

  {
    source: 'zenhui_description',
    target:
      '當你於出牌階段內使用【殺】或黑色普通錦囊牌指定唯一目標時，你可以令不爲此牌目標且可成爲此牌目標的一名其他角色選擇一項：1.交給你一張牌，成爲此牌的使用者；2.成爲此牌的目標，此技能於本回合內失效。',
  },
  {
    source: 'jiaojin_description',
    target: '當你成爲男性角色使用【殺】或普通錦囊牌的目標後，你可以棄置一張裝備牌，然後該牌對你無效且你獲得此牌。',
  },
  {
    source: 'fenli_description',
    target:
      '若你的手牌數爲全場最多，你可以跳過摸牌階段；若你的體力值爲全場最多，你可以跳過出牌階段；若你的裝備區裏有牌且牌數爲全場最多，你可以跳過棄牌階段。',
  },
  {
    source: 'pingkou_description',
    target: '回合結束時，你可以對一至X名其他角色各造成1點傷害（X爲你本回合內跳過的階段數）。',
  },

  {
    source: 'shenxing_description',
    target:
      '出牌階段，若X：爲0，你可以摸一張牌；大於0，你可以棄置X張牌，然後摸一張牌（X爲你此階段內發動過本技能的次數，且至多爲2）。',
  },
  {
    source: 'bingyi_description',
    target:
      '結束階段開始時，你可以展示所有手牌，若顏色均相同，你令一至X名角色各摸一張牌（X爲你的手牌數）。若點數也均相同，你摸一張牌。',
  },
  {
    source: 'jianying_description',
    target:
      '當你於出牌階段內使用牌時，若此牌與你於此階段內使用過的上一張牌花色或點數相同，你可以摸一張牌；出牌階段限一次，你可以將一張牌當任意基本牌使用（無次數限制，且若你於此階段內使用過的上一張牌有花色，此牌花色視為與之相同）。',
  },
  {
    source: 'shibei_description',
    target: '<b>鎖定技</b>，當你受到傷害後，若此傷害為你於此回合內第一次受到的傷害，你回覆1點體力，否則你失去1點體力。',
  },

  {
    source: 'qieting_description',
    target:
      '其他角色的回合結束時，若其於本回合內未對除其外的角色造成過傷害，你可以選擇一項：1.觀看其兩張手牌，並獲得其中一張；2.將其裝備區裡的一張牌移至你的裝備區；3.摸一張牌。',
  },
  {
    source: 'xianzhou_description',
    target:
      '<b>限定技</b>，出牌階段，你可以將裝備區裡的所有牌交給一名其他角色，然後其選擇一項：1.令你回覆X點體力；2.選擇其攻擊範圍內一至X名角色，其對這些角色各造成1點傷害（X為你以此法給出的牌數）。',
  },

  {
    source: 'zhi_shanxi_description',
    target:
      '出牌階段開始時，你可以選擇一名沒有“檄”的其他角色，移去場上所有“檄”，然後該角色獲得一枚“檄”標記；當有“檄”的角色回覆體力後，若其未處於瀕死狀態，其選擇一項：1.將兩張牌交給你；2.失去1點體力。',
  },

  {
    source: 'fuji_description',
    target: '鎖定技，距離至你為1的角色不能響應你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '鎖定技，當你造成或受到傷害時，若你的手牌數為全場唯一最多，此傷害+1。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$sidi:1',
    target: '總算困住你了。',
  },
  {
    source: '$sidi:2',
    target: '你出的了手嗎！',
  },

  {
    source: '$shenduan:1',
    target: '行軍斷策，需慎之又慎！',
  },
  {
    source: '$shenduan:2',
    target: '爲將者，務當慎行謹斷。',
  },
  {
    source: '$yonglve:1',
    target: '兵勢勇健，戰勝攻取，無不如志！',
  },
  {
    source: '$yonglve:2',
    target: '雄才大略，舉無遺策，威震四海！',
  },

  {
    source: '$pindi:1',
    target: '定品尋良驥，中正探人傑。',
  },
  {
    source: '$pindi:2',
    target: '取才賦職，論能行賞。',
  },
  {
    source: '$faen:1',
    target: '法禮有度，恩威並施。',
  },
  {
    source: '$faen:2',
    target: '禮法容情，皇恩浩蕩。',
  },

  {
    source: '$benxi:1',
    target: '北伐曹魏，以弱制強！',
  },
  {
    source: '$benxi:2',
    target: '引軍漢中，以禦敵襲。',
  },

  {
    source: '$qiangzhi:1',
    target: '容我過目，即刻詠來。',
  },
  {
    source: '$qiangzhi:2',
    target: '文書強識，纔可博於運籌。',
  },
  {
    source: '$xiantu:1',
    target: '將軍莫慮，且看此圖。',
  },
  {
    source: '$xiantu:2',
    target: '吾以誠心相獻，君何躊躇不前！',
  },

  {
    source: '$zhongyong:1',
    target: '赤兔北奔，馬踏鼠膽之輩！',
  },
  {
    source: '$zhongyong:2',
    target: '青龍夜照，刀斬悖主之賊！',
  },

  {
    source: '$shenxing:1',
    target: '謀而後動，行不容差。',
  },
  {
    source: '$shenxing:2',
    target: '謀略之道，需慎之又慎。',
  },
  {
    source: '$bingyi:1',
    target: '秉持心性，心口如一。',
  },
  {
    source: '$bingyi:2',
    target: '秉忠職守，一生不事二主。',
  },

  {
    source: '$zenhui:1',
    target: '萋兮斐兮，謀欲譖人。',
  },
  {
    source: '$zenhui:2',
    target: '稍稍譖毀，萬劫不復！',
  },
  {
    source: '$jiaojin:1',
    target: '憑汝之力，何不自鑑？',
  },
  {
    source: '$jiaojin:2',
    target: '萬金之軀，豈容狎侮！',
  },

  {
    source: '$fenli:1',
    target: '以逸待勞，坐收漁利。',
  },
  {
    source: '$fenli:2',
    target: '以主制客，佔盡優勢。',
  },
  {
    source: '$pingkou:1',
    target: '對敵人仁慈，就是對自己殘忍！',
  },
  {
    source: '$pingkou:2',
    target: '反守爲攻，直搗黃龍！',
  },

  {
    source: '$jianying:1',
    target: '事須緩圖，欲速不達也。',
  },
  {
    source: '$jianying:2',
    target: '由緩至急，循循而進。',
  },
  {
    source: '$shibei:1',
    target: '命系袁氏，一心向北。',
  },
  {
    source: '$shibei:2',
    target: '矢志於北，盡忠於國！',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose pindi options: {1} {2}',
    target: '{0}：請選擇令 {1} 摸 {2} 張牌或棄置 {2} 張牌',
  },
  { source: 'pindi:draw', target: '令其摸牌' },
  { source: 'pindi:discard', target: '令其棄牌' },

  {
    source: '{0}: do you want to let {1} draw 1 card?',
    target: '{0}：你可以令 {1} 摸一張牌',
  },

  {
    source: '{0}: please choose benxi options: {1}',
    target: '{0}：你可為 {1} 選擇至多兩項增益效果',
  },
  { source: 'benxi:addTarget', target: '增加一個目標' },
  { source: 'benxi:unoffsetable', target: '不可抵消' },
  { source: 'benxi:ignoreArmor', target: '無視防具' },
  { source: 'benxi:draw', target: '造成傷害時摸一張牌' },
  {
    source: 'benxi: please select a player to append to card targets',
    target: '奔襲：請為此牌選擇一個額外的目標。',
  },

  {
    source: 'please choose less than {0} player to draw 1 crad.',
    target: '請選擇至多{0}名角色各摸一張牌。',
  },

  {
    source: '{0}: do you want to skip {1} ?',
    target: '{0}；你可以跳過 {1}',
  },

  {
    source: '{0}: do you want to choose at least {1} target(s) to deal 1 damage each?',
    target: '{0}：你可以對至多 {1} 名其他角色各造成1點傷害',
  },

  {
    source: '{0}: do you want to put a card except basic card onto your general card?',
    target: '{0}：你可以將一張非基本牌置為“司”',
  },
  {
    source: '{0}: do you want to remove a ‘Si’ to let {1} be unable to use card?',
    target: '{0}：你可以移去一張“司”，令 {1} 於此階段內不能使用或打出與此“司”顏色相同的牌',
  },

  {
    source: 'shenduan: please choose one of these cards',
    target: '慎斷：請選擇其中一張牌作為【兵糧寸斷】',
  },
  {
    source: '{0}: please choose a target for {1}',
    target: '{0}：請為 {1} 選擇目標',
  },

  {
    source: '{0}: do you want to drop a card from {1}’s judge area?',
    target: '{0}：你可以棄置 {1} 判定區裡的一張牌',
  },
  {
    source: 'yonglve: please drop one of these cards',
    target: '勇略：請選擇其中一張牌棄置',
  },

  {
    source: '{0}: do you want to draw 2 cards, then give 2 cards to {1} ?',
    target: '{0}: 你可以摸兩張牌，然後交給 {1} 兩張牌',
  },
  {
    source: '{0}: do you want to display a hand card from another player?',
    target: '{0}：你可以展示一名其他角色的一張手牌',
  },
  {
    source: '{0}: do you want to draw a card?',
    target: '{0}：你可以摸一張牌',
  },

  {
    source: 'zhongyong: do you want to choose a target to gain these cards?',
    target: '忠勇：你可以選擇不為目標的一名其他角色獲得這些牌',
  },
  {
    source: '{0}: do you want to use a slash to zhongyong {1} targets?',
    target: '{0}：你可以對 {1} 攻擊範圍內的一名角色使用一張【殺】（無距離限制）',
  },

  {
    source: '{0}: please select a player who can be the target of {1}',
    target: '{0}：請選擇可以成為 {1} 目標的一名其他角色',
  },
  {
    source: '{0}: please give a card to {1}, or you will be the new target of {2}',
    target: '{0}：請將一張牌交給 {1}，併成為 {2} 的使用者，否則你將成為 {2} 的目標',
  },

  {
    source: '{0}：do you want to discard a equip card to let {1} nullify to you and you gain it?',
    target: '{0}：你可以棄置一張裝備牌，令 {1} 對你無效且你獲得之',
  },

  {
    source: '{0}: please choose qieting options: {1}',
    target: '{0}：請選擇一項：1.將 {1} 裝備區裡的一張牌置入你的裝備區（不替換原裝備）；2.摸一張牌',
  },
  { source: 'qieting:draw', target: '摸一張牌' },
  { source: 'qieting:move', target: '移動裝備' },
  { source: 'qieting:prey', target: '观看并获得其手牌' },

  {
    source: '{0}: please choose at least {1} xianzhou {2} target(s) to deal 1 damage each?',
    target: '{0}：你可對 {2} 攻擊範圍內的至多 {1} 名角色各造成1點傷害，否則 {2} 回覆 {1} 點體力',
  },
];
