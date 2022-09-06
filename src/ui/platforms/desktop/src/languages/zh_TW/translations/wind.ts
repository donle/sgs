import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'xiahouyuan', target: '夏侯淵' },
  { source: 'shensu', target: '神速' },
  { source: 'shebian', target: '設變' },

  { source: 'caoren', target: '曹仁' },
  { source: 'jushou', target: '據守' },
  { source: 'jiewei', target: '解圍' },
  { source: '#jiewei', target: '解圍' },

  { source: 'huangzhong', target: '黃忠' },
  { source: 'liegong', target: '烈弓' },
  { source: '#liegong', target: '烈弓' },

  { source: 'weiyan', target: '魏延' },
  { source: 'kuanggu', target: '狂骨' },
  { source: 'qimou', target: '奇謀' },

  { source: 'xiaoqiao', target: '小喬' },
  { source: 'tianxiang', target: '天香' },
  { source: 'hongyan', target: '紅顏' },
  { source: '#hongyan', target: '紅顏' },
  { source: 'piaoling', target: '飄零' },

  { source: 'zhoutai', target: '周泰' },
  { source: 'buqu', target: '不屈' },
  { source: 'fenji', target: '奮激' },

  { source: 'zhangjiao', target: '張角' },
  { source: 'leiji', target: '雷擊' },
  { source: '#leiji', target: '雷擊' },
  { source: 'guidao', target: '鬼道' },
  { source: 'huangtian', target: '黃天' },
  { source: '~huangtian', target: '黃天' },

  { source: 'yuji', target: '于吉' },
  { source: 'guhuo', target: '蠱惑' },
  { source: 'chanyuan', target: '纏怨' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shensu_description',
    target:
      '你可以做出如下選擇：1.跳過判定階段和摸牌階段；2.跳過出牌階段並棄置一張裝備牌；3.跳過棄牌階段並翻面。你每選擇一項，便視為你使用一張無距離限制的【殺】。',
  },
  { source: 'shebian_description', target: '當你翻面後，你可以移動場上一張裝備牌。' },
  {
    source: 'jushou_description',
    target: '結束階段開始時，你可以翻面並摸四張牌，然後選擇一項：1.棄置一張非裝備牌；2.使用一張裝備牌。',
  },
  {
    source: 'jiewei_description',
    target:
      '你可以將裝備區裡的牌當【無懈可擊】使用；當你的武將牌從背面翻至正面時，你可以棄置一張牌，然後移動場上的一張牌。',
  },
  {
    source: 'liegong_description',
    target:
      '你使用【殺】可以選擇距離不大於此【殺】點數的角色為目標；當你使用【殺】指定目標後，你可以根據下列條件執行相應的效果：1.其手牌數不大於你的手牌數，此【殺】不可被【閃】響應；2.其體力值不小於你的體力值，此【殺】傷害+1。',
  },
  {
    source: 'kuanggu_description',
    target:
      '當你對一名角色造成1點傷害後，若你與其的距離於其因受到此傷害而扣減體力前不大於1，你可以回覆1點體力或摸一張牌。',
  },
  {
    source: 'qimou_description',
    target:
      '<b>限定技</b>，出牌階段，你可以失去至少1點體力並摸X張牌，然後直到回合結束，你計算與其他角色的距離-X，且你使用【殺】的次數上限+X（X為你以此法失去的體力值）。',
  },
  {
    source: 'tianxiang_description',
    target:
      '當你受到傷害時，你可以棄置一張紅桃牌，防止此傷害並選擇一名其他角色，然後你選擇一項：1.令其受到1點傷害，然後摸X張牌（X為其已損失體力值且至多為5）；2.令其失去1點體力，然後其獲得你棄置的牌。',
  },
  {
    source: 'hongyan_description',
    target:
      '<b>鎖定技</b>，你的黑桃牌或你的黑桃判定牌的花色視為紅桃；若你的裝備區裡有紅桃牌，你的手牌上限等於X（X為你的體力上限）。',
  },
  {
    source: 'piaoling_description',
    target:
      '結束階段開始時，你可以判定，若結果為紅桃，你選擇一項：1.將判定牌交給一名角色，若其為你，你棄置一張牌；2.將判定牌置於牌堆頂。',
  },
  {
    source: 'buqu_description',
    target:
      '<b>鎖定技</b>，當你處於瀕死狀態時，你將牌堆頂一張牌置於你的武將牌上，稱為"創"，若此牌的點數與你武將牌上已有的"創"點數均不同，則你將體力回覆至1點。若出現相同點數則將此牌置入棄牌堆。若你的武將牌上有"創"，則你的手牌上限與"創"的數量相等。',
  },
  {
    source: 'fenji_description',
    target: '當一名角色因另一名角色的棄置或獲得而失去手牌後，你可以失去1點體力。若如此做，失去手牌的角色摸兩張牌。',
  },
  {
    source: 'leiji_description',
    target:
      '當你使用或打出【閃】或【閃電】時，你可以進行判定；當你的判定牌生效後，若判定結果為：黑桃，你可以選擇一名其他角色，對其造成2點雷電傷害；梅花，你回覆1點體力，然後你可以選擇一名其他角色，對其造成1點雷電傷害。',
  },
  {
    source: 'guidao_description',
    target: '當一名角色的判定牌生效前，你可以打出一張黑色牌替換之。若你打出的牌為黑桃2-9，則你摸一張牌。',
  },
  {
    source: 'huangtian_description',
    target: '<b>主公技</b>，其他群勢力角色的出牌階段限一次，其可以將一張【閃】或【閃電】交給你。',
  },
  {
    source: 'guhuo_description',
    target:
      '每回合限一次，你可以扣置一張手牌當任意一張基本牌或普通錦囊牌使用或打出。其他角色可同時進行質疑並翻開此牌：若為假則此牌作廢，且質疑者各摸一張牌；若為真，則質疑者依次棄置一張牌或失去1點體力，並獲得"纏怨"。',
  },
  {
    source: 'chanyuan_description',
    target: '<b>鎖定技</b>，你不能質疑“蠱惑”；若你的體力值小於等於1，則你的其他技能失效。',
  },
  { source: '#piaoling-select', target: '請選擇：1. 將判定牌置於牌堆頂。2. 交給一名角色' },
  { source: 'piaoling: select a player to obtain the judge card', target: '飄零：選擇一名角色獲得此判定牌' },
];

export const skillAudios: Word[] = [
  {
    source: '$shensu:1',
    target: '奔軼絕塵，不留蹤影！',
  },
  {
    source: '$shensu:2',
    target: '健步如飛，破敵不備！',
  },
  {
    source: '$shebian:1',
    target: '設變力戰，虜敵千萬！',
  },
  {
    source: '$shebian:2',
    target: '隨機應變，臨機設變。',
  },

  {
    source: '$jushou:1',
    target: '堅守此地，不退半步。',
  },
  {
    source: '$jushou:2',
    target: '兵精糧足，守土一方。',
  },
  {
    source: '$jiewei:1',
    target: '化守爲攻，出奇制勝！',
  },
  {
    source: '$jiewei:2',
    target: '堅壁清野，以挫敵銳！',
  },

  {
    source: '$liegong:1',
    target: '弓不離手，自有轉機。',
  },
  {
    source: '$liegong:2',
    target: '箭陣開道，所向無敵！',
  },

  {
    source: '$kuanggu:1',
    target: '反骨狂傲，彰顯本色！',
  },
  {
    source: '$kuanggu:2',
    target: '只有戰場，能讓我感到興奮。',
  },
  {
    source: '$qimou:1',
    target: '爲了勝利，可以出其不意。',
  },
  {
    source: '$qimou:2',
    target: '勇戰不如奇謀。',
  },

  {
    source: '$tianxiang:1',
    target: '碧玉閨秀，只可遠觀。',
  },
  {
    source: '$tianxiang:2',
    target: '你豈會懂我的美麗？',
  },
  {
    source: '$hongyan:1',
    target: '紅顏嬌花好，折花門前盼。',
  },
  {
    source: '$hongyan:2',
    target: '我的容貌，讓你心動了嗎？',
  },
  {
    source: '$piaoling:1',
    target: '清風拂君，落花飄零。',
  },
  {
    source: '$piaoling:2',
    target: '花自飄零水自流。',
  },

  {
    source: '$buqu:1',
    target: '戰如熊虎，不惜屈命。',
  },
  {
    source: '$buqu:2',
    target: '哼，這點小傷算什麼！',
  },
  {
    source: '$fenji:1',
    target: '百戰之身，奮勇趨前！',
  },
  {
    source: '$fenji:2',
    target: '兩肋插刀，願付此軀！',
  },

  {
    source: '$guhuo:1',
    target: '這牌，猜對了嗎？',
  },
  {
    source: '$guhuo:2',
    target: '真真假假，虛實難測。',
  },

  {
    source: '$leiji:1',
    target: '疾雷迅電，不可趨避！',
  },
  {
    source: '$leiji:2',
    target: '雷霆之誅，滅軍毀城！',
  },
  {
    source: '$guidao:1',
    target: '鬼道運行，由我把控！',
  },
  {
    source: '$guidao:2',
    target: '汝之命運，吾來改之！',
  },
  {
    source: '$huangtian:1',
    target: '黃天法力，萬軍可滅！',
  },
  {
    source: '$huangtian:2',
    target: '天書庇佑，黃巾可興！',
  },
];
export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose a target to deal {1} damage?',
    target: '{0}: 請選擇一名其它角色，對其造成{1}點雷電傷害',
  },

  {
    source: '{0}: please choose a hand card, if it’s equipment, use it, otherwise drop it',
    target: '{0}: 請選擇一張手牌，如果為裝備牌，則使用之，否則棄置此牌',
  },
];
