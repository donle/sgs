import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2012', target: '將2' },

  { source: 'wangyi', target: '王異' },
  { source: 'zhenlie', target: '貞烈' },
  { source: 'miji', target: '秘計' },

  { source: 'xunyou', target: '荀攸' },
  { source: 'qice', target: '奇策' },
  { source: 'zhiyu', target: '智愚' },

  { source: 'zhonghui', target: '鍾會' },
  { source: 'quanji', target: '權計' },
  { source: 'zili', target: '自立' },
  { source: 'paiyi', target: '排異' },

  { source: 'guanxingzhangbao', target: '關興張苞' },
  { source: 'fuhun', target: '父魂' },

  { source: 'liaohua', target: '廖化' },
  { source: 'dangxian', target: '當先' },
  { source: '#dangxian', target: '當先' },
  { source: 'fuli', target: '伏櫪' },

  { source: 'madai', target: '馬岱' },
  { source: 'qianxi', target: '潛襲' },
  { source: 'qianxi_red', target: '潛襲[紅色]' },
  { source: 'qianxi_black', target: '潛襲[黑色]' },

  { source: 'bulianshi', target: '步練師' },
  { source: 'anxu', target: '安恤' },
  { source: 'zhuiyi', target: '追憶' },

  { source: 'chengpu', target: '程普' },
  { source: 'lihuo', target: '癘火' },
  { source: '#lihuo', target: '癘火（增加目標）' },
  { source: '##lihuo', target: '癘火（置為醇）' },
  { source: '###lihuo', target: '癘火（失去體力）' },
  { source: 'chunlao', target: '醇醪' },

  { source: 'handang', target: '韓當' },
  { source: 'gongqi', target: '弓騎' },
  { source: 'gongqi suits: {0}', target: '弓騎[{0}]' },
  { source: 'jiefan', target: '解煩' },

  { source: 'liubiao', target: '劉表' },
  { source: 'zishou', target: '自守' },
  { source: 'zongshi', target: '宗室' },

  { source: 'decade_dangxian', target: '當先' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhenlie_description',
    target:
      '當你成為其他角色使用【殺】或普通錦囊牌的目標後，你可以失去1點體力，令此牌對你無效，然後你棄置使用者的一張牌。',
  },
  {
    source: 'miji_description',
    target: '結束階段開始時，你可以摸X張牌，然後可將等量手牌交給一名其他角色（X為你已損失的體力值）。',
  },

  {
    source: 'qice_description',
    target: '出牌階段限一次，你可以將所有手牌當任意普通錦囊牌使用。',
  },
  {
    source: 'zhiyu_description',
    target: '當你受到傷害後，你可以摸一張牌並展示所有手牌，若這些牌顏色均相同，傷害來源棄置一張手牌。',
  },

  {
    source: 'quanji_description',
    target:
      '出牌階段結束時，若你的手牌數大於體力值，或當你受到1點傷害後，你可以摸一張牌，然後將一張手牌置於你的武將牌上，稱為“權”；你的手牌上限+X（X為你的“權”數）。',
  },
  {
    source: 'zili_description',
    target: '覺醒技，準備階段開始時，若你有不少於3張“權”，你減1點體力上限，回覆1點體力或摸兩張牌，然後獲得技能“排異”。',
  },
  {
    source: 'paiyi_description',
    target: '出牌階段限一次，你可以移去一張“權”，令一名其他角色摸兩張牌，然後若其手牌數大於你，你對其造成1點傷害。',
  },

  {
    source: 'fuhun_description',
    target:
      '你可以將兩張手牌當【殺】使用或打出；當你以此法使用的【殺】於你的出牌階段內造成傷害後，你於本回合內擁有“武聖”和“咆哮”。',
  },

  {
    source: 'dangxian_description',
    target: '<b>鎖定技</b>，回合開始時，你從棄牌堆中隨機獲得一張【殺】，執行一個額外的出牌階段。',
  },
  {
    source: 'fuli_description',
    target:
      '<b>限定技</b>，當你處於瀕死狀態時，你可以將體力回覆至X點（X為存活勢力數），然後若你的體力值為全場最高，你翻面。',
  },

  {
    source: 'qianxi_description',
    target:
      '準備階段開始時，你可以摸一張牌，棄置一張牌，然後你令你距離為1的一名角色於本回合內不能使用或打出與你以此法棄置牌顏色相同的手牌。',
  },
  {
    source: 'anxu_description',
    target:
      '出牌階段限一次，你可以依次選擇兩名其他角色，令前者獲得後者的一張牌，若前者以此法獲得的牌不為裝備區裡的牌，你摸一張牌，然後你可以令二者中手牌較少的角色摸一張牌。',
  },
  {
    source: 'zhuiyi_description',
    target: '當你死亡時，你可以令除殺死你的角色外的一名其他角色摸三張牌並回復1點體力。',
  },

  {
    source: 'lihuo_description',
    target:
      '你可將普【殺】當火【殺】使用，然後若此【殺】造成傷害，你失去1點體力；你使用火【殺】可額外選擇一個目標；當你於一回合使用的第一張牌結算結束後，若此牌為【殺】，你可以將之置為“醇”。',
  },
  {
    source: 'chunlao_description',
    target:
      '結束階段開始時，若你沒有“醇”，你可以將至少一張【殺】置於你的武將牌上，稱為“醇”；當一名角色處於瀕死狀態時，你可以移去一張“醇”，視為該角色使用一張【酒】，然後若移去的“醇”為：雷【殺】，你摸兩張牌；火【殺】，你回覆1點體力。',
  },

  {
    source: 'gongqi_description',
    target:
      '出牌階段限一次，你可以棄置一張牌，令你於本回合攻擊範圍無限，且使用與以此法棄置牌花色相同的【殺】無次數限制。若你以此法棄置的是裝備牌，你可以棄置一名其他角色一張牌。',
  },
  {
    source: 'jiefan_description',
    target:
      '<b>限定技</b>，出牌階段，你可以選擇一名角色，然後令攻擊範圍內包含其的角色依次選擇一項：1.棄置一張武器牌；2.令你選擇的角色摸一張牌。若此時是遊戲的第一輪，本技能於此回合結束時視為未發動過。',
  },

  {
    source: 'zishou_description',
    target:
      '摸牌階段，你可以多摸X張牌（X為存活勢力數），然後本回合內防止你對其他角色造成的傷害；結束階段開始時，若你本回合內未對其他角色使用過牌，你可以棄置至少一張花色各不相同的手牌，然後摸等量的牌。',
  },
  {
    source: 'zongshi_description',
    target:
      '<b>鎖定技</b>，你的手牌上限+X（X為存活勢力數）；你的回合外，若你的手牌數不小於手牌上限，無色牌對你無效且你不能成為延時類錦囊牌的目標。',
  },
  {
    source: 'decade_dangxian_description',
    target:
      '<b>鎖定技</b>，回合開始時，你可以失去1點體力並隨機獲得棄牌堆裏的一張【殺】，無論你是否失去體力，你執行一個額外的出牌階段。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhenlie:1',
    target: '忠貞與國，節烈與身！',
  },
  {
    source: '$zhenliu:2',
    target: '我輩雖女流，烈膽勝鬚眉！',
  },
  {
    source: '$miji:1',
    target: '孤城臨險，需出奇計。',
  },
  {
    source: '$miji:2',
    target: '祕計九出，佐君平賊！',
  },

  {
    source: '$qice:1',
    target: '傾力爲國，算無遺策。',
  },
  {
    source: '$qice:2',
    target: '奇策在此，誰與爭鋒？',
  },
  {
    source: '$zhiyu:1',
    target: '大勇若怯，大智如愚。',
  },
  {
    source: '$zhiyu:2',
    target: '愚者既出，智者何存？',
  },

  {
    source: '$quanji:1',
    target: '備兵馴馬，以待戰機。',
  },
  {
    source: '$quanji:2',
    target: '避其鋒芒，權且忍讓。',
  },
  {
    source: '$zili:1',
    target: '金鱗，豈是池中之物！',
  },
  {
    source: '$zili:2',
    target: '千載一時，鼎足而立！',
  },
  {
    source: '$paiyi:1',
    target: '艾命不遵，死有餘辜。',
  },
  {
    source: '$paiyi:2',
    target: '非我族類，其心必異。',
  },

  {
    source: '$fuhun:1',
    target: '不雪父仇，誓不罷休！',
  },
  {
    source: '$fuhun:2',
    target: '承父遺志，橫掃叛賊！',
  },

  {
    source: '$dangxian:1',
    target: '誰言蜀漢已無大將！',
  },
  {
    source: '$dangxian:2',
    target: '老將雖白髮，寶刀刃猶',
  },
  {
    source: '$fuli:1',
    target: '未破敵軍，豈可輕易伏誅？',
  },
  {
    source: '$fuli:2',
    target: '看老夫再奮身一戰！',
  },

  {
    source: '$qianxi:1',
    target: '吾能斬魏延，亦能斬殺你！',
  },
  {
    source: '$qianxi:2',
    target: '擒賊先擒王，打蛇打七寸！',
  },

  {
    source: '$anxu:1',
    target: '和鸞雍雍，萬福攸同。',
  },
  {
    source: '$anxu:2',
    target: '君子樂胥，萬邦之屏。',
  },
  {
    source: '$zhuiyi:1',
    target: '終其永懷，戀心殷殷。',
  },
  {
    source: '$zhuiyi:2',
    target: '妾心所繫，如月之恆。',
  },

  {
    source: '$lihuo:1',
    target: '引兇戾之火，以潰敵軍！',
  },
  {
    source: '$lihuo:2',
    target: '熊熊天火，焚盡逆賊！',
  },
  {
    source: '$chunlao:1',
    target: '醇酒佳釀杯中飲，醉酒提壺力千鈞！',
  },
  {
    source: '$chunlao:2',
    target: '身披瘡痍，唯酒能醫。',
  },

  {
    source: '$gongqi:1',
    target: '馬踏飛箭，弓騎無雙！',
  },
  {
    source: '$gongqi:2',
    target: '提弓上馬，箭礪八方！',
  },
  {
    source: '$jiefan:1',
    target: '煩憂千萬，且看我一刀解之。',
  },
  {
    source: '$jiefan:2',
    target: '莫道雄兵屬北地，解煩威名天下揚。',
  },

  {
    source: '$zishou:1',
    target: '願行仁義之道，何愁人心不歸。',
  },
  {
    source: '$zishou:2',
    target: '穩據江漢，坐觀時變。',
  },
  {
    source: '$zongshi:1',
    target: '',
  },
  {
    source: '$zongshi:2',
    target: '',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw a card, then put a hand card on your general card?',
    target: '{0}：你可以摸一張牌，然後將一張手牌置為“權”',
  },
  {
    source: '{0}: please put a hand card on your general card',
    target: '{0}：請選擇一張手牌置為“權”',
  },

  { source: 'zili:drawcards', target: '摸兩張牌' },
  { source: 'zili:recover', target: '回覆1點體力' },

  {
    source: '{0}: do you want to lose 1 hp to nullify {1}, then drop a card from {2}',
    target: '{0}：你可以失去1點體力令 {1} 對你無效，然後你棄置 {2} 的一張牌',
  },

  {
    source: '{0}: do you want to give another player {1} hand card(s)?',
    target: '{0}：你可以選擇 {1} 張牌交給一名其他角色',
  },

  {
    source: '{0} triggered skill {1}, started an extra {2}',
    target: '{0} 的技能 【{1}】被觸發，開始了一個額外的 {2}',
  },

  {
    source: 'gongqi: do you want to drop one card of another player?',
    target: '弓騎：你可以棄置一名其他角色一張牌',
  },

  {
    source: '{0}: please drop a weapon, or {1} will draw a card',
    target: '{0}：請棄置一張武器牌，否則 {1} 將會摸一張牌',
  },

  {
    source: 'qianxi: please choose a target with 1 Distance(to you)',
    target: '<b>潛襲</b>：請選擇你至其距離為1的一名角色',
  },

  {
    source: '{0}: please choose a target to be the additional target of {1}',
    target: '{0}：你可以為此{1}選擇一個額外目標',
  },
  {
    source: '{0}: do you want to put {1} on your general card as Chun?',
    target: '{0}：你可以將 {1} 置為“醇”',
  },

  {
    source: '{0}: do you want to put at least one slash on your general card?',
    target: '{0}：你可以將至少一張【殺】置為“醇”',
  },

  {
    source: '{0}: do you want to remove a Chun to let {1} uses an alchol?',
    target: '{0}：你可以移去一張“醇”，視為 {1} 使用一張【酒】',
  },

  {
    source: '{0}: do you want to let {1} draw a card?',
    target: '{0}：你可以令 {1} 摸一張牌',
  },

  {
    source: '{0}: please choose a target to draw 3 cards and recover 1 hp',
    target: '{0}：你可以令一名其他角色摸三張牌並回復1點體力',
  },

  {
    source: '{0}: please choose a target except {1} to draw 3 cards and recover 1 hp',
    target: '{0}：你可以令一名除 {1} 外的其他角色摸三張牌並回復1點體力',
  },

  {
    source: '{0}: do you want to discard at least one card with different suits and draw cards?',
    target: '{0}：你可以棄置至少一張花色各不相同的手牌，然後摸等量的牌',
  },

  {
    source: '{0} triggered skill {1}, prevent the damage to {2}',
    target: '{0} 的技能 【{1}】被觸發，防止了對 {2} 造成的傷害',
  },
];
