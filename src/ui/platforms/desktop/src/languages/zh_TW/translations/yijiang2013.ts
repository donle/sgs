import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2013', target: '將3' },

  { source: 'caochong', target: '曹衝' },
  { source: 'fuhuanghou', target: '伏皇后' },
  { source: 'guanping', target: '關平' },
  { source: 'guohuai', target: '郭淮' },
  { source: 'jianyong', target: '簡雍' },
  { source: 'liru', target: '李儒' },
  { source: 'liufeng', target: '劉封' },
  { source: 'manchong', target: '滿寵' },
  { source: 'panzhangmazhong', target: '潘璋馬忠' },
  { source: 'yufan', target: '虞翻' },
  { source: 'zhuran', target: '朱然' },

  { source: 'chengxiang', target: '稱象' },
  { source: 'renxin', target: '仁心' },
  { source: 'zhuikong', target: '惴恐' },
  { source: 'qiuyuan', target: '求援' },
  { source: 'longyin', target: '龍吟' },
  { source: 'jingce', target: '精策' },
  { source: 'qiaoshuo', target: '巧說' },
  { source: 'j3_zongshi', target: '縱適' },
  { source: 'juece', target: '絕策' },
  { source: 'mieji', target: '滅計' },
  { source: 'fencheng', target: '焚城' },
  { source: 'xiansi', target: '陷嗣' },
  { source: '~xiansi', target: '陷嗣' },
  { source: 'junxing', target: '峻刑' },
  { source: 'yuce', target: '御策' },
  { source: 'duodao', target: '奪刀' },
  { source: 'anjian', target: '暗箭' },
  { source: 'zongxuan', target: '縱玄' },
  { source: '#zongxuan', target: '縱玄' },
  { source: 'zhiyan', target: '直言' },
  { source: 'danshou', target: '膽守' },
  { source: '#danshou', target: '膽守' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'chengxiang_description',
    target: '當你受到傷害後，你可以亮出牌堆頂四張牌，然後你獲得其中至少一張點數和不大於13的牌。',
  },
  {
    source: 'renxin_description',
    target: '當一名其他角色受到傷害時，若其體力值為1，你可以棄置一張裝備牌並翻面，然後防止此傷害。',
  },
  {
    source: 'zhuikong_description',
    target:
      '其他角色的準備階段開始時時，若你已受傷，你可以與其拼點，若你：贏，其本回合內使用牌不能指定其他角色為目標；沒贏，其至你的距離於本回合內視為1。',
  },
  {
    source: 'qiuyuan_description',
    target:
      '當你成為【殺】的目標時，你可以選擇不為使用者和此【殺】目標的一名其他角色，其選擇一項：1.交給你一張【閃】；2.成為此【殺】的目標。',
  },
  {
    source: 'longyin_description',
    target:
      '當一名角色於其出牌階段內使用【殺】時，你可以棄置一張牌，令此【殺】不計入次數限制，然後若此【殺】為紅色，你摸一張牌。',
  },
  {
    source: 'jingce_description',
    target:
      '出牌階段，你每使用一種花色的手牌，你本回合手牌上限+1；出牌階段結束時，你可摸X張牌（X是你本回合使用過牌的型別）。',
  },
  {
    source: 'qiaoshuo_description',
    target:
      '出牌階段，你可以與一名角色拼點。若你：贏，你此階段內使用的下一張基本或普通錦囊牌可多或少選一個目標；沒贏，結束此階段且你的錦囊牌於本回合內不計入手牌上限。',
  },
  { source: 'j3_zongshi_description', target: '當你的拼點結果確定後，若你贏/沒贏，你可以獲得其/你的拼點牌。' },
  { source: 'juece_description', target: '結束階段開始時，你可以對本回合失去過牌的一名其他角色造成1點傷害。' },
  {
    source: 'mieji_description',
    target:
      '出牌階段限一次，你可以將一張黑色錦囊牌置於牌堆頂，並令有手牌的一名其他角色選擇一項：1.交給你一張錦囊牌；2.依次棄置兩張非錦囊牌。',
  },
  {
    source: 'fencheng_description',
    target:
      '<b>限定技</b>，出牌階段，你可以令所有其他角色依次選擇一項：1.棄置至少X張牌（若有上一名角色且其選擇棄置牌，X為其棄置牌數+1，否則X為1）；2.受到你造成的2點火焰傷害。',
  },
  {
    source: 'xiansi_description',
    target:
      '準備階段開始時，你可以選擇一至兩名有牌的其他角色，你依次將這些角色的一張牌置於你的武將牌上，稱為“逆”；當其他角色需要對你使用【殺】時，其可以移去你的兩張“逆”，視為對你使用一張【殺】。',
  },
  {
    source: 'junxing_description',
    target:
      '出牌階段限一次，你可以棄置至少一張手牌並選擇一名其他角色，令其選擇一項：1.棄置等量的牌並失去1點體力；2.翻面並摸等量的牌。',
  },
  {
    source: 'yuce_description',
    target:
      '當你受到傷害後，你可以展示一張手牌，然後傷害來源選擇一項：1.棄置與此牌類別不同的一張手牌；2.令你回覆1點體力。',
  },
  {
    source: 'duodao_description',
    target: '當你成為其他角色使用【殺】的目標後，你可以棄置一張牌，然後獲得其裝備區裡的武器牌。',
  },
  {
    source: 'anjian_description',
    target:
      '<b>鎖定技</b>，當你使用【殺】指定目標後，若你不在其攻擊範圍內，此【殺】無視其防具且對其傷害+1，若該角色因此【殺】進入瀕死狀態，其不能使用【桃】直到此瀕死結算結束。',
  },
  { source: 'zongxuan_description', target: '當你的牌因棄置而進入棄牌堆後，你可以將其中至少一張牌置於牌堆頂。' },
  {
    source: 'zhiyan_description',
    target: '結束階段開始時，你可以令一名其他角色摸一張牌並展示之，若此牌為裝備牌，其使用之，然後回覆1點體力。',
  },
  {
    source: 'danshou_description',
    target:
      '每回合限一次，當你成為基本牌或錦囊牌的目標後，你可以摸X張牌（X為你本回合內成為基本牌或錦囊牌目標的次數）；一名角色的結束階段開始時，若你於此回合未以此法摸牌，你可以棄置與其手牌數相等數量的牌（若其沒有手牌，則跳過此步驟），對其造成1點傷害。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'mieji:trick',
    target: '交給其一張錦囊牌',
  },
  {
    source: 'mieji:drop',
    target: '棄置兩張非錦囊牌',
  },
  {
    source: '{0}: drop {1} cards or turn over',
    target: '{0}：棄置{1}張牌並失去一點體力，或翻面並摸{1}張牌',
  },

  {
    source: '{0}: please choose a card to put it on the top of the draw pile',
    target: '{0}：請選擇一張牌，將其置於牌堆頂',
  },

  {
    source: '{0}: do you want to put at least one of these cards on the top of the draw pile?',
    target: '{0}：你可以將棄牌中至少一張牌以任意順序置於牌堆頂',
  },

  {
    source: '{0}: do you want to choose a target to draw a card?',
    target: '{0}：你可以令一名角色摸一張牌並展示之',
  },
  {
    source: 'please choose: fencheng-options',
    target:
      '請選擇：1.棄置至少X張牌（X為上一名角色且其選擇棄置牌，X為其棄置牌數+1，否則為1）；2.受到其造成的2點火焰傷害',
  },
  {
    source: 'qiaoshuo_win',
    target: '巧說[贏]',
  },
  {
    source: 'qiaoshuo_lose',
    target: '巧說[沒贏]',
  },
  {
    source: 'qiaoshuo: add',
    target: '新增目標',
  },
  {
    source: 'qiaoshuo: reduce',
    target: '減少目標',
  },
  {
    source: 'qiaoshuo: please select',
    target: '巧說：請選擇一項操作',
  },
  {
    source: 'qiaoshuo: please select a player to reduce from card targets',
    target: '請選擇一名角色從卡牌目標中移除',
  },
  {
    source: 'qiaoshuo: please select a player to append to card targets',
    target: '請選擇一名角色將其新增至卡牌目標中',
  },
  {
    source: "{1} is removed from target list of {2} by {0}'s skill {3}",
    target: '{0}使用了技能{3}，將{1}從{2}的目標中移除',
  },
  {
    source: "{1} is appended to target list of {2} by {0}'s skill {3}",
    target: '{0}使用了技能{3}，將{1}新增至{2}的目標中',
  },
  {
    source: '{0}: do you want to drop {1} card(s) to deal 1 damage to {2} ?',
    target: '{0}：你可以棄置 {1} 張牌對 {2} 造成1點傷害',
  },
  {
    source: '{0}: do you want to deal 1 damage to {1} ?',
    target: '{0}：你可以對 {1} 造成1點傷害',
  },
  {
    source: '{0}: you need to give a jink to {1}',
    target: '{0}：請交給{1}一張【閃】，否則成為你將【殺】的目標之一',
  },
  {
    source: 'please choose a trick card to pass to {0}',
    target: '請交給{0}一張錦囊牌',
  },
];
