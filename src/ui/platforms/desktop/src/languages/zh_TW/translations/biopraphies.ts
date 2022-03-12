import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'biographies', target: '武將列傳' },

  { source: 'caosong', target: '曹嵩' },
  { source: 'lilu', target: '禮賂' },
  { source: 'lilu count: {0}', target: '禮賂[{0}]' },
  { source: 'yizheng', target: '翊正' },

  { source: 'xushao', target: '許劭' },
  { source: 'pingjian', target: '評薦' },
  { source: '#pingjian', target: '評薦' },

  { source: 'wangrong', target: '王榮' },
  { source: 'minsi', target: '敏思' },
  { source: 'jijing', target: '吉境' },
  { source: 'zhuide', target: '追德' },

  { source: 'dingyuan', target: '丁原' },
  { source: 'cixiao', target: '慈孝' },
  { source: 'cixiao:yizi', target: '義子' },
  { source: 'xianshuai', target: '先率' },
  { source: 'panshi', target: '叛弒' },

  { source: 'dongcheng', target: '董承' },
  { source: 'xuezhao', target: '血詔' },

  { source: 'qiuliju', target: '丘力居' },
  { source: 'koulve', target: '寇略' },
  { source: 'suiren', target: '隨認' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'lilu_description',
    target:
      '摸牌階段，你可以改爲將手牌摸至體力上限（最多摸至五張，且無法摸牌也可發動），然後你將至少一張手牌交給一名其他角色。若你此次交出的牌數大於你上次以此法交出的牌數，你加1點體力上限並回復1點體力。',
  },
  {
    source: 'yizheng_description',
    target:
      '結束階段開始時，你可以選擇一名其他角色。若如此做，直到你的下個回合開始，當其造成傷害或回覆體力時，若其體力上限小於你，你減1點體力上限，令此傷害值或回覆值+1。',
  },

  {
    source: 'pingjian_description',
    target:
      '出牌階段限一次，結束階段開始時或當你受到傷害後，你可以觀看三個可於當前時機發動的技能，你選擇其中一個技能並可發動該技能（每個技能限發動一次）。',
  },

  {
    source: 'minsi_description',
    target:
      '出牌階段限一次，你可以棄置至少一張點數和爲13的牌，然後摸兩倍數量的牌。你以此法摸的：紅色牌於本回合不計入手牌上限；黑色牌於本回合無距離限制。',
  },
  {
    source: 'jijing_description',
    target: '當你受到傷害後，你可以判定，然後若你棄置至少一張點數和爲判定結果點數的牌，你回覆1點體力。',
  },
  {
    source: 'zhuide_description',
    target: '當你死亡時，你可以令一名其他角色獲得牌堆裏牌名各不相同的四張基本牌。',
  },

  {
    source: 'cixiao_description',
    target:
      '準備階段開始時，你可以選擇一名沒有“義子”的其他角色（若場上有“義子”標記，你須先棄置一張牌），移去場上所有的“義子”標記，其獲得1枚“義子”標記。有“義子”標記的角色視爲擁有“叛弒”。',
  },
  {
    source: 'xianshuai_description',
    target:
      '<b>鎖定技，</b>當一名角色造成傷害後，若此傷害時本輪內造成過的第一次傷害，你摸一張牌，然後若傷害來源爲你，你對受傷角色造成1點傷害。',
  },
  {
    source: 'panshi_description',
    target:
      '<b>鎖定技</b>，準備階段開始時，你將一張手牌交給一名擁有技能“慈孝”的其他角色；當你於出牌階段內使用【殺】對擁有技能“慈孝”的角色造成傷害時，此傷害+1且你結束此階段。',
  },

  {
    source: 'xuezhao_description',
    target:
      '出牌階段限一次，你可以棄置一張手牌，並令一至X名其他角色（X爲你的體力值）依次選擇是否交給你一張牌，若其：交給你牌，其摸一張牌且你本回合使用【殺】的次數上限+1；未交給你牌，其本回合不能響應你使用的牌。',
  },

  {
    source: 'koulve_description',
    target:
      '當你於出牌階段內對其他角色造成傷害後，你可以展示其一張手牌。若此牌爲【殺】或傷害類錦囊牌，你獲得之。若此牌爲紅色，你減1點體力上限（若你未受傷則改爲失去1點體力），然後摸兩張牌。',
  },
  {
    source: 'suiren_description',
    target:
      '當你死亡時，你可以將你手牌中所有的【殺】和傷害類錦囊牌交給一名其他角色。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$lilu:1',
    target: '微薄之禮，聊表敬意。',
  },
  {
    source: '$lilu:2',
    target: '亂獄滋豐，以禮賂之。',
  },
  {
    source: '$yizheng:1',
    target: '玉樹盈階，望子成龍。',
  },
  {
    source: '$yizheng:2',
    target: '擇善者，翊贊季興。',
  },

  {
    source: '$pingjian:1',
    target: '識人讀心，評鑑推達。',
  },
  {
    source: '$pingjian:2',
    target: '月旦雅評，試論天下。',
  }, 

  {
    source: '$minsi:1',
    target: '能書會計，心思靈巧。',
  },
  {
    source: '$minsi:2',
    target: '才情兼備，選入掖庭。',
  },
  {
    source: '$jijing:1',
    target: '吉夢賜福，順應天命。',
  },
  {
    source: '$jijing:2',
    target: '夢之指引，必爲吉運。',
  },
  {
    source: '$zhuide:1',
    target: '思美人，兩情悅。',
  },
  {
    source: '$zhuide:2',
    target: '花香蝶戀，君德妾慕。',
  }, 

  {
    source: '$cixiao:1',
    target: '吾兒奉先，天下無敵！',
  },
  {
    source: '$cixiao:2',
    target: '父慈子孝，義理爲先！',
  },
  {
    source: '$xianshuai:1',
    target: '九州齊喑，首義囑吾！',
  },
  {
    source: '$xianshuai:2',
    target: '雄兵一擊，則天下大白！',
  },

  {
    source: '$xuezhao:1',
    target: '奉旨行事，莫敢不從！',
  },
  {
    source: '$xuezhao:2',
    target: '衣帶密詔，當誅曹公！',
  },

  {
    source: '$daoji:1',
    target: '典韋勇猛，盜戟可除。',
  },
  {
    source: '$daoji:2',
    target: '你的就是我的。',
  },
  {
    source: '$fuzhong:1',
    target: '身負重任，絕無懈怠！',
  },
  {
    source: '$fuzhong:2',
    target: '勇冠其軍，負重前行！',
  },
  
  {
    source: '$koulve:1',
    target: '兵強馬壯，時出寇略！',
  },
  {
    source: '$koulve:2',
    target: '飢則寇略，飽則棄餘。',
  },
  {
    source: '$suiren:1',
    target: '就交給你了。',
  },
  {
    source: '$suiren:2',
    target: '我的財富，收好。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw {1} card(s) instead of drawing cards by rule?',
    target: '{0}：你可以放棄摸牌，改爲摸 {1} 張牌',
  },
  {
    source: '{0}: do you want to give up to draw cards by rule?',
    target: '{0}：你可以放棄摸牌',
  },
  {
    source: 'lilu: please give a handcard to another player',
    target: '禮賂：請將至少一張手牌交給一名其他角色',
  },

  {
    source: '{0}: do you want to choose a target?',
    target: '{0}：你可以選擇一名其他角色',
  },

  {
    source: '{0}: please choose pingjian options',
    target: '{0}：請選擇一項技能，然後你可發動所選技能',
  },

  {
    source: '{0}: do you want to drop cards with sum of {1} Card Number to recover 1 hp?',
    target: '{0}：你可以棄置至少一張點數和爲 {1} 的牌來回復1點體力',
  },

  {
    source: '{0}: do you want to let another player draw 4 defferent basic cards?',
    target: '{0}：你可以令一名其他角色獲得牌堆裏四張牌名各不相同的基本牌',
  },

  {
    source: '{0}: do you want to discard a card and choose another player to be your new son?',
    target: '{0}：你可以棄一張牌，將“義子”標記轉移給另一名其他角色',
  },
  {
    source: '{0}: do you want to choose another player to be your son?',
    target: '{0}：你可以令一名其他角色獲得“義子”標記',
  },

  {
    source: 'panshi: please choose one hand card and one target',
    target: '叛弒：請選擇一張手牌，交給其中一名角色',
  },
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：請將一張手牌交給 {1}',
  },

  {
    source: '{0}: do you want to display a card from {1}’s hand?',
    target: '{0}：你可以展示 {1} 的一張手牌',
  },

  {
    source: '{0}: do you want to choose a another player to give him all the damage cards in your hand?',
    target: '{0}：你可以將手牌中所有的【殺】和傷害類錦囊牌交給一名其他角色',
  },
];
