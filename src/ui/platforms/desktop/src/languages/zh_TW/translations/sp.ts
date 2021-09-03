import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'maliang', target: '馬良' },
  { source: 'zishu', target: '自書' },
  { source: 'yingyuan', target: '應援' },

  { source: 'zhouqun', target: '周群' },
  { source: 'tiansuan', target: '天算' },
  { source: 'tiansuan:upup', target: '上上籤' },
  { source: 'tiansuan:up', target: '上籤' },
  { source: 'tiansuan:mid', target: '中籤' },
  { source: 'tiansuan:down', target: '下籤' },
  { source: 'tiansuan:downdown', target: '下下籤' },

  { source: 'dongyun', target: '董允' },
  { source: 'bingzheng', target: '秉正' },
  { source: 'sheyan', target: '舍宴' },

  { source: 'shamoke', target: '沙摩柯' },
  { source: 'jili', target: '蒺藜' },

  { source: 'sp_zhaoyun', target: '群趙雲' },
  { source: 'std_longdan', target: '龍膽' },
  { source: 'chongzhen', target: '衝陣' },

  { source: 'quyi', target: '麴義' },
  { source: 'fuji', target: '伏騎' },
  { source: 'jiaozi', target: '驕恣' },

  { source: 'liuqi', target: '劉琦' },
  { source: 'wenji', target: '問計' },
  { source: 'tunjiang', target: '屯江' },

  { source: 'zhangling', target: '張陵' },
  { source: 'huji', target: '虎騎' },
  { source: 'shoufu', target: '授符' },

  { source: 'wutugu', target: '兀突骨' },
  { source: 'ranshang', target: '燃殤' },
  { source: 'hanyong', target: '悍勇' },

  { source: 'sp_diaochan', target: '貂蟬' },
  { source: 'lihun', target: '離魂' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zishu_description',
    target:
      '<b>鎖定技</b>，當你獲得牌後，若此時是你的：回合內且這些牌不因此技能而獲得，你摸一張牌；回合外，本回合結束時，你將這些牌中仍在你手牌中的牌置入棄牌堆。',
  },
  {
    source: 'yingyuan_description',
    target: '當你於回合內使用基本牌或普通錦囊牌結算結束後，你可以將此牌交給一名其他角色（每種牌名每回合限一次）。',
  },

  {
    source: 'tiansuan_description',
    target:
      '每輪限一次，出牌階段，你可以隨機抽取一個“命運籤”（抽籤開始前，你可以多放入一根想要的“命運籤”），然後選擇一名角色獲得此籤對應的效果直到你的下個回合開始。若為：上上籤，你觀看其手牌並獲得其區域內的一張牌；上籤，你獲得其區域內的一張牌。<br>上上籤：當你受到傷害時，防止之。<br>上籤：當你受到傷害時，傷害值減至1點；當你受到傷害後，你摸X張牌（X為傷害值）。<br>中籤：當你受到傷害時，將此傷害改為火焰傷害，將傷害值減至1點。<br>下籤：當你受到傷害時，此傷害+1。<br>下下籤：當你受到傷害時，此傷害+1；你不能使用【桃】和【酒】。',
  },

  {
    source: 'bingzheng_description',
    target:
      '出牌階段結束時，你可以令體力值與手牌數不相等的一名角色摸一張牌或棄置一張手牌，然後若其手牌數與體力值相等，你摸一張牌，且你可將一張牌交給該角色。',
  },
  {
    source: 'sheyan_description',
    target: '當你成為錦囊牌的目標時，你可以為此牌增加或減少一個目標（目標數至少為1）。',
  },

  {
    source: 'jili_description',
    target: '當你於一回合內使用或打出第X張牌時，你可以摸X張牌（X為你的攻擊範圍）。',
  },

  {
    source: 'std_longdan_description',
    target: '你可以將【殺】當【閃】，【閃】當【殺】使用或打出。',
  },
  {
    source: 'chongzhen_description',
    target: '當你發動“龍膽”後，你可以獲得對方的一張手牌。',
  },

  {
    source: 'fuji_description',
    target: '<b>鎖定技</b>，距離至你為1的角色不能響應你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '<b>鎖定技</b>，當你造成或受到傷害時，若你的手牌數為全場唯一最多，此傷害+1。',
  },

  {
    source: 'wenji_description',
    target:
      '出牌階段開始時，你可以令一名其他角色交給你一張牌。若如此做，你於本回合內使用與該牌同名的牌不能被其他角色響應。',
  },
  {
    source: 'tunjiang_description',
    target:
      '結束階段開始時，若你於此回合內未使用牌指定過其他角色為目標，且未跳過本回合的出牌階段，你可以摸X張牌（X為存活勢力數）。',
  },

  {
    source: 'huji_description',
    target:
      '<b>鎖定技</b>，你計算與其他角色的距離-1；當你於回合外受到傷害後，你判定，若為紅色，則視為你對傷害來源使用一張無距離限制的【殺】。',
  },
  {
    source: 'shoufu_description',
    target:
      '出牌階段限一次，你可以摸一張牌，然後將一張手牌置於一名沒有“籙”的其他角色的武將牌旁：其不能使用或打出與其“籙”類別相同的牌；當其受到傷害後，或於棄牌階段內棄置至少兩張牌後，移去其“籙”。',
  },

  {
    source: 'ranshang_description',
    target:
      '<b>鎖定技</b>，當你受到火焰傷害後，你獲得等同於傷害值數量的“燃”標記；結束階段開始時，你失去X點體力（X為你的“燃”標記數），然後若你的“燃”標記數大於2，你減2點體力上限並摸兩張牌。',
  },
  {
    source: 'hanyong_description',
    target:
      '當你使用黑桃普通【殺】、【南蠻入侵】或【萬箭齊發】時，若你已受傷，你可令此牌的傷害基數+1，然後若你的體力值大於當前輪數，你獲得1枚“燃”標記。',
  },

  {
    source: 'lihun_description',
    target:
      '出牌階段限一次，你可以棄置一張牌並翻面，然後獲得一名男性其他角色的所有手牌。出牌階段結束時，你將X張牌交給該角色（X爲其體力值）。'
  }
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以將 {1} 交給一名其他角色',
  },

  {
    source: '{0}: do you want to prey {1} a hand card?',
    target: '{0}：你可以獲得 {1} 的一張手牌',
  },

  {
    source: '{0}: you can let anothor player give you a card',
    target: '{0}：你可以令一名有牌的其他角色交給你一張牌',
  },
  {
    source: '{0}: you need to give a card to {1}',
    target: '{0}：請選擇一張牌交給 {1}',
  },

  {
    source: '{0}: do you want to add a stick?',
    target: '{0}：你可以額外加入以下一根“命運籤”',
  },
  {
    source: '{0}: the result is {1}, please choose a target',
    target: '{0}：抽籤結果是 {1}，請選擇一名角色獲得此籤的效果',
  },

  {
    source: '{0}: do you want to choose a target to let him draw a card or drop a hand card?',
    target: '{0}：你可以選擇手牌數不等於體力值的一名角色，令其摸一張牌或棄置一張牌',
  },
  {
    source: '{0}: please choose bingzheng options: {1}',
    target: '{0}：你可以令 {1} 摸一張牌或棄置一張手牌',
  },
  { source: 'bingzheng:draw', target: '令其摸牌' },
  { source: 'bingzheng:drop', target: '令其棄牌' },
  {
    source: '{0}: please drop a hand card',
    target: '{0}：請棄置一張手牌',
  },
  {
    source: '{0}: you can to give a card to {1}',
    target: '{0}：你可以交給 {1} 一張牌',
  },

  {
    source: '{0}: please choose sheyan options: {1}',
    target: '{0}：你可以為 {1} 增加或減少一個目標',
  },
  { source: 'sheyan:add', target: '增加目標' },
  { source: 'sheyan:reduce', target: '減少目標' },
  {
    source: 'sheyan: please select a player to append to card targets',
    target: '舍宴：請選擇一名角色成為此牌的額外目標',
  },
  {
    source: 'sheyan: please select a target to remove',
    target: '舍宴：請選擇一名目標角色，取消其目標',
  },

  {
    source: '{0}: please choose a hand card and choose a target who has no ‘Lu’?',
    target: '{0}：請選擇一張手牌和一名沒有“籙”的其他角色，將此牌置為其“籙”',
  },

  {
    source: 'lihun target: {0}',
    target: '離魂 {0}',
  },
  {
    source: 'lihun: please give the targets some cards',
    target: '離魂：請交給目標角色等同於其體力值張牌',
  },
];
