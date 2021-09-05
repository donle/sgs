import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sp', target: 'sp' },

  { source: 'yangxiu', target: '楊修' },
  { source: 'danlao', target: '啖酪' },
  { source: 'jilei', target: '雞肋' },

  { source: 'sp_caiwenji', target: '魏蔡文姬' },
  { source: 'chenqing', target: '陳情' },
  { source: 'mozhi', target: '默識' },

  { source: 'sp_jiangwei', target: '魏姜維' },
  { source: 'kunfen', target: '困奮' },
  { source: 'kunfen_EX', target: '困奮' },
  { source: 'fengliang', target: '逢亮' },

  { source: 'sp_sunshangxiang', target: '蜀孫尚香' },
  { source: 'liangzhu', target: '良助' },
  { source: 'fanxiang', target: '返鄉' },

  { source: 'mayunlu', target: '馬雲騄' },
  { source: 'fengpo', target: '鳳魄' },

  { source: 'maliang', target: '馬良' },
  { source: 'zishu', target: '自書' },
  { source: 'yingyuan', target: '應援' },

  { source: 'mazhong', target: '馬忠' },
  { source: 'fuman', target: '撫蠻' },
  { source: '#fuman', target: '撫蠻（摸牌）' },

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

  { source: 'sunhao', target: '孫皓' },
  { source: 'canshi', target: '殘蝕' },
  { source: '#canshi', target: '殘蝕（棄牌）' },
  { source: 'chouhai', target: '仇海' },
  { source: 'guiming', target: '歸命' },

  { source: 'sp_zhaoyun', target: '群趙雲' },
  { source: 'std_longdan', target: '龍膽' },
  { source: 'chongzhen', target: '衝陣' },

  { source: 'fuwan', target: '伏完' },
  { source: 'moukui', target: '謀潰' },

  { source: 'shixie', target: '士燮' },
  { source: 'biluan', target: '避亂' },
  { source: 'distance buff: {0}', target: '距離+{0}' },
  { source: 'distance debuff: {0}', target: '距離{0}' },
  { source: 'lixia', target: '禮下' },

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

  { source: 'huangzu', target: '黃祖' },
  { source: 'wangong', target: '挽弓' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'danlao_description',
    target: '當你成為【殺】或錦囊牌的目標後，若目標數大於1，你可以摸一張牌並令此牌對你無效。',
  },
  {
    source: 'jilei_description',
    target:
      '當你受到傷害後，若有傷害來源，你可以聲明一種牌的類別，令其不能使用、打出或棄置此類別的手牌直到其下個回合開始。',
  },

  {
    source: 'kunfen_description',
    target: '<b>鎖定技</b>，結束階段開始時，你失去1點體力，然後摸兩張牌。',
  },
  {
    source: 'kunfen_EX_description',
    target:
      '結束階段開始時，你可以失去1點體力，然後摸兩張牌。',
  },
  {
    source: 'fengliang_description',
    target:
      '<b>覺醒技</b>，當你進入瀕死狀態時，若你的體力小於1，你減1點體力上限，回覆體力至2點，然後獲得技能“挑釁”，修改你的“困奮”為“結束階段開始時，你可以失去1點體力，然後摸兩張牌”。',
  },

  {
    source: 'chenqing_description',
    target: '每輪限一次，當一名角色進入瀕死狀態時，你可以令另一名其他角色摸四張牌，然後棄置四張牌，若其以此法棄置了四張牌且這些牌的花色各不相同，其視為對該瀕死角色使用一張【桃】。',
  },
  {
    source: 'mozhi_description',
    target:
      '結束階段開始時，你可以將一張手牌當你於本回合出牌階段內使用過的第一張基本或普通錦囊牌使用，然後你可以將一張手牌當第二張基本或普通錦囊牌使用。',
  },

  {
    source: 'liangzhu_description',
    target: '當一名角色於其出牌階段內回覆體力後，你可以選擇一項：1.你摸一張牌；2.令其摸兩張牌。',
  },
  {
    source: 'fanxiang_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若場上有已受傷且你發動過良助選項2令其摸牌的角色，你增加1點體力上限並回復1點體力，失去技能“良助”，獲得技能“梟姬”。',
  },

  {
    source: 'fengpo_description',
    target:
      '當你於出牌階段首次使用【殺】或【決鬥】指定唯一目標後，你可以選擇一項：1.摸X張牌；2.令此牌傷害+X（X為其手牌中的方片牌數）。',
  },

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
    source: 'fuman_description',
    target:
      '出牌階段，你可以將一張【殺】交給本回合內未成為過你發動此技能的目標的一名其他角色。當其於其下個回合結束前使用此牌時，你摸一張牌。',
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
    source: 'canshi_description',
    target:
      '摸牌階段，你可以多摸X張牌（X為已受傷的角色數）。若如此做，當你於本回合內使用【殺】或普通錦囊牌時，你棄置一張牌。',
  },
  {
    source: 'chouhai_description',
    target: '<b>鎖定技</b>，當你受到【殺】造成的傷害時，若你沒有手牌，此傷害+1。',
  },
  {
    source: 'guiming_description',
    target: '<b>主公技</b>，<b>鎖定技</b>，你的“殘蝕”中X的值增加未受傷的其他吳勢力角色數。',
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
    source: 'moukui_description',
    target: '當你使用【殺】指定目標後，你可以摸一張牌或棄置其一張牌。若如此做，當此【殺】被其抵消後，其棄置你一張牌。',
  },

  {
    source: 'biluan_description',
    target:
      '結束階段開始時，若有至你距離為1的角色，你可以棄置一張牌，令其他角色計算與你的距離+X（X為存活角色數且至多為4）。',
  },
  {
    source: 'lixia_description',
    target:
      '<b>鎖定技</b>，其他角色的結束階段開始時，若你不在其攻擊範圍內，你選擇一項：1.你摸一張牌；2.令其摸兩張牌。選擇完成後，其他角色計算與你的距離-1。',
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
      '出牌階段限一次，你可以摸一張牌，然後將一張手牌置於一名沒有“籙”的其他角色的武將牌旁：其不能使用或打出與其“籙”類別相同的牌；當其受到傷害後，或於棄牌階段內棄置至少兩張與其“籙”類別相同的牌後，移去其“籙”。',
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
      '出牌階段限一次，你可以棄置一張牌並翻面，然後獲得一名男性角色的所有手牌。出牌階段結束時，你將X張牌交給該角色（X為其體力值）。',
  },
  {
    source: 'wangong_description',
    target:
      '<b>鎖定技</b>，當你使用牌結算結束後，若此牌為：基本牌，你擁有“挽弓”狀態；非基本牌，你失去“挽弓”狀態。若你處於“挽弓”狀態，你使用【殺】無距離和次數限制、不計入次數限制，且傷害基數+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to draw a card and let {1} nullify to you?',
    target: '{0}：你可以摸一張牌，然後令 {1} 對你無效',
  },

  {
    source: '{0}: do you want to make {1} jilei until the start of his next turn?',
    target: '{0}：你可以令 {1} 不能使用、打出或棄置你聲明的一種類別的牌，直到其下個回合開始',
  },

  {
    source: '{0}: do you want to give {1} to another player?',
    target: '{0}：你可以將 {1} 交給一名其他角色',
  },

  {
    source: '{0}: do you want to prey {1} a hand card?',
    target: '{0}：你可以獲得 {1} 的一張手牌',
  },

  {
    source: '{0}: do you want to drop a card to let others calculate the distance to you increase {1}',
    target: '{0}：你可以棄置一張牌，令其他角色計算與你的距離+{1}',
  },

  {
    source: '{0}: please choose lixia options: {1}',
    target: '{0}：請選擇令你或 {1} 摸牌',
  },
  { source: 'lixia:you', target: '你摸一張牌' },
  { source: 'lixia:opponent', target: '其摸一張牌' },

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
    target: '離魂：請交給目標等同於其體力值張牌',
  },

  {
    source: '{0}: do you want to lose 1 hp to draw 2 cards?',
    target: '{0}：你可以失去1點體力，然後摸兩張牌',
  },

  {
    source: 'do you want to choose a target to use chenqing?',
    target: '你可以選擇其中一名角色發動“陳情”',
  },
  {
    source: '{0}: please discard 4 cards, if these cards have different suit between each other, you use a virtual peach to {1}?',
    target: '{0}：請棄置四張牌，若這些牌的花色均不同，你視為對 {1} 使用一張【桃】',
  },

  {
    source: '{0}: do you want to a hand card as {1} ?',
    target: '{0}：你可以將一張手牌視為 {1} 使用',
  },

  {
    source: '{0}: please choose liangzhu options: {1}',
    target: '{0}：你可以選擇一項：1.你摸一張牌；2.令 {1} 摸兩張牌',
  },
  { source: 'liangzhu:you', target: '你摸一張牌' },
  { source: 'liangzhu:opponent', target: '其摸兩張牌' },

  {
    source: '{0}: please choose fengpo options: {1} {2}',
    target: '{0}：你可以選擇一項：1.摸X張牌：2.令 {1} 對 {2} 造成的傷害+X（X為 {1} 手牌中的方片牌數）',
  },
  { source: 'fengpo:draw', target: '摸牌' },
  { source: 'fengpo:damage', target: '增加傷害' },

  {
    source: '{0}: please choose moukui options: {1}',
    target: '{0}：你可以選擇一項：1.摸一張牌：2.棄置 {1} 一張牌',
  },
  { source: 'moukui:draw', target: '摸一張牌' },
  { source: 'moukui:discard', target: '棄置其一張牌' },

  {
    source: '{0}: do you want to use a virtual slash?',
    target: '{0}：你可以視為使用一張【殺】（不計入次數限制）',
  },
];
