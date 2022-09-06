import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2015', target: '將5' },

  { source: 'caorui', target: '曹叡' },
  { source: 'huituo', target: '恢拓' },
  { source: 'mingjian', target: '明鑑' },
  { source: 'jian', target: '鑑' },
  { source: 'xingshuai', target: '興衰' },

  { source: 'caoxiu', target: '曹休' },
  { source: 'qianju', target: '千駒' },
  { source: 'qingxi', target: '傾襲' },

  { source: 'zhongyao', target: '鍾繇' },
  { source: 'huomo', target: '活墨' },
  { source: 'zuoding', target: '佐定' },

  { source: 'liuchen', target: '劉諶' },
  { source: 'zhanjue', target: '戰絕' },
  { source: 'qinwang', target: '勤王' },

  { source: 'xiahoushi', target: '夏侯氏' },
  { source: 'qiaoshi', target: '樵拾' },
  { source: 'yanyu', target: '燕語' },

  { source: 'zhangni', target: '張嶷' },
  { source: 'wurong', target: '憮戎' },
  { source: 'shizhi', target: '矢志' },

  { source: 'quancong', target: '全琮' },
  { source: 'yaoming', target: '邀名' },

  { source: 'sunxiu', target: '孫休' },
  { source: 'yanzhu', target: '宴誅' },
  { source: 'yanzhu points: {0}', target: '宴誅[{0}]' },
  { source: 'yanzhu_ex', target: '宴誅' },
  { source: '#s_yanzhu_debuff', target: '宴誅（額外受傷）' },
  { source: 'xingxue', target: '興學' },
  { source: 'xingxue_ex', target: '興學' },
  { source: 'zhaofu', target: '詔縛' },

  { source: 'zhuzhi', target: '朱治' },
  { source: 'anguo', target: '安國' },

  { source: 'guotupangji', target: '郭圖逢紀' },
  { source: 'jigong', target: '急攻' },
  { source: 'jigong damage: {0}', target: '急攻[{0}]' },
  { source: '##jigong', target: '急攻（回覆體力）' },
  { source: 'shifei', target: '飾非' },

  { source: 'gongsunyuan', target: '公孫淵' },
  { source: 'huaiyi', target: '懷異' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'huituo_description',
    target: '當你受到傷害後，你可以令一名角色判定，若結果爲：紅色，其回覆1點體力；黑色，其摸X張牌（X爲傷害值）。',
  },
  {
    source: 'mingjian_description',
    target:
      '出牌階段限一次，你可以將所有手牌交給一名其他角色。若如此做，其於其下個回合內使用【殺】的次數上限和手牌上限+1。',
  },
  {
    source: 'xingshuai_description',
    target:
      '<b>主公技</b>，<b>限定技</b>，當你進入瀕死狀態時，若你的體力值不大於0，你可以令其他魏勢力角色依次選擇是否令你回覆1點體力。此瀕死結算結束後，所有以此法令你回覆體力的角色各受到1點傷害。',
  },

  {
    source: 'qianju_description',
    target: '<b>鎖定技</b>，你計算與其他角色的距離-X（X爲你已損失的體力值）。',
  },
  {
    source: 'qingxi_description',
    target:
      '當你使用【殺】或【決鬥】指定目標後，你可以令其選擇一項：1.棄置X張手牌（X爲你攻擊範圍內的角色數且至多爲2，若你的裝備區裏有武器牌，則改爲至多爲4），然後棄置你裝備區裏的武器牌；2.令此牌對其傷害基數+1且你判定，若結果爲紅色，其不能響應此牌。',
  },

  {
    source: 'huomo_description',
    target:
      '當你需要使用基本牌時（你本回合使用過的基本牌除外），你可以將一張黑色非基本牌置於牌堆頂，視爲使用此基本牌。',
  },
  {
    source: 'zuoding_description',
    target:
      '當其他角色於其出牌階段內使用黑桃牌指定第一個目標後，若沒有角色於此階段內受到過傷害，你可以令一名目標角色摸一張牌。',
  },

  {
    source: 'zhanjue_description',
    target:
      '出牌階段，你可以將所有手牌當【決鬥】使用，然後你摸一張牌，且受到過此牌傷害的角色各摸一張牌。若你以此法於一階段內獲得過至少兩張牌，本技能於此階段內失效。',
  },
  {
    source: 'yanyu_description',
    target:
      '出牌階段限一次，你可以重鑄一張【殺】；出牌階段結束時，若你於此階段內重鑄過至少兩張【殺】，你可令一名男性角色摸兩張牌。',
  },

  {
    source: 'qiaoshi_description',
    target:
      '其他角色的結束階段開始時，若其手牌數與你相等，你可以與其各摸一張牌，然後若以此法摸的兩張牌花色相同，你可重複此流程。',
  },
  {
    source: 'yanyu_description',
    target:
      '出牌階段，你可以重鑄一張【殺】；出牌階段結束時，若X大於0，你可令一名男性角色摸X張牌（X為你於此階段內重鑄過【殺】的數量，且至多為3）。',
  },

  {
    source: 'wurong_description',
    target:
      '出牌階段限一次，你可以令你與一名其他角色同時展示一張手牌，若你展示的：爲【殺】且其展示的不爲【閃】，你對其造成1點傷害；不爲【殺】且其展示的爲【閃】，你獲得其一張牌。',
  },
  {
    source: 'shizhi_description',
    target:
      '<b>鎖定技</b>，若你的體力值爲1，你的【閃】均視爲【殺】；當你使用以此法視爲的【殺】造成傷害後，你回覆1點體力。',
  },

  {
    source: 'yaoming_description',
    target:
      '每回合每項限一次，當你造成或受到傷害後，你可以選擇一項：1.令手牌數小於你的一名角色摸一張牌；2.棄置手牌數大於你的一名角色的一張手牌；3.選擇手牌數與你相等的一名角色，其可棄置一至兩張牌，然後摸等量的牌。',
  },

  {
    source: 'yanzhu_description',
    target:
      '出牌階段限一次，你可以令一名有牌的其他角色選擇一項：1.棄置一張牌，且其於其下個回合開始前受到的下一次傷害+1；2.令你獲得其裝備區裏的所有牌，然後修改你的本技能和“興學”。',
  },
  {
    source: 'yanzhu_ex_description',
    target: '出牌階段限一次，你可以令一名其他角色於其下個回合開始前受到的下一次傷害+1。',
  },
  {
    source: 'xingxue_description',
    target:
      '結束階段開始時，你可以令一至X名角色各摸一張牌，然後其中手牌數大於體力值的角色分別將一張牌置於牌堆頂（X爲你的體力值）。',
  },
  {
    source: 'xingxue_ex_description',
    target:
      '結束階段開始時，你可以令一至X名角色各摸一張牌，然後其中手牌數大於體力值的角色分別將一張牌置於牌堆頂（X爲你的體力上限）。',
  },
  {
    source: 'zhaofu_description',
    target: '<b>主公技</b>，<b>鎖定技</b>，你距離爲1的角色視爲在其他吳勢力角色的攻擊範圍內。',
  },

  {
    source: 'anguo_description',
    target:
      '出牌階段限一次，你可以選擇一名其他角色，若其爲手牌數最少的角色，其摸一張牌。若其爲體力值最少的角色，其回覆1點體力。若其爲裝備區裏牌數最少的角色，其從牌堆裏隨機使用一張裝備牌。最後若其有未執行的效果且你滿足條件，你依次執行對應效果。',
  },

  {
    source: 'huaiyi_description',
    target:
      '出牌階段限一次，你可以展示所有手牌，若其中：所有牌顏色相同，你摸一張牌，且本技能於此階段內改爲“出牌階段限兩次”；有顏色不同的牌，你選擇一種顏色，棄置你手牌中該顏色的所有牌，然後你獲得一至多X名其他角色各一張牌，若你以此法獲得的牌數不少於兩張，你失去1點體力。',
  },

  {
    source: 'jigong_description',
    target:
      '出牌階段開始時，你可以摸一至三張牌，令你本回合內手牌上限爲X（X爲你此階段內造成過的傷害值）。若如此做，本回合你的下個棄牌階段開始時，若X不小於你此次摸的牌數，你回覆1點體力。',
  },
  {
    source: 'shifei_description',
    target:
      '當你需要使用或打出【閃】時，你可以令當前回合角色摸一張牌，然後若其不爲手牌數唯一最多的角色，你可以棄置手牌數最多的一名角色的一張牌，視爲使用或打出【閃】。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$huituo:1',
    target: '大展宏圖，就在今日！',
  },
  {
    source: '$huituo:2',
    target: '富我大魏，揚我國威！',
  },
  {
    source: '$mingjian:1',
    target: '你我推心置腹，豈能相負！',
  },
  {
    source: '$mingjian:2',
    target: '孰忠孰奸，朕尚能明辨！',
  },
  {
    source: '$xingshuai:1',
    target: '百年興衰，皆由人，不由天！',
  },
  {
    source: '$xingshuai:2',
    target: '聚羣臣而加勳，隆天子之氣運！',
  },

  {
    source: '$qingxi:1',
    target: '虎豹騎傾巢而動，安有不勝之理！',
  },
  {
    source: '$qingxi:2',
    target: '任爾等固若金湯，虎豹騎可破之！',
  },

  {
    source: '$huomo:1',
    target: '筆墨寫春秋，揮毫退萬敵！',
  },
  {
    source: '$huomo:2',
    target: '妙筆在手，研墨在心。',
  },
  {
    source: '$zuoding:1',
    target: '只有忠心，沒有謀略，是不夠的。',
  },
  {
    source: '$zuoding:2',
    target: '承君恩寵，報效國家！',
  },

  {
    source: '$zhanjue:1',
    target: '成敗再此一舉，殺！',
  },
  {
    source: '$zhanjue:2',
    target: '此刻唯有死戰，安能言降！',
  },
  {
    source: '$qinwang:1',
    target: '大廈傾危，誰堪棟樑？',
  },
  {
    source: '$qinwang:2',
    target: '國有危難，哪位將軍請戰？',
  },

  {
    source: '$qiaoshi:1',
    target: '暖風細雨，心有靈犀。',
  },
  {
    source: '$qiaoshi:2',
    target: '樵採城郭外，忽見郎君來。',
  },
  {
    source: '$yanyu:1',
    target: '邊功未成，還請郎君努力。',
  },
  {
    source: '$yanyu:2',
    target: '郎君有意傾心訴，妾身心中相思埋。',
  },

  {
    source: '$wurong:1',
    target: '策略以入算，果烈以立威！',
  },
  {
    source: '$wurong:2',
    target: '詐與和親，不攻可得！',
  },

  {
    source: '$yaoming:1',
    target: '養威持重，不營小利。',
  },
  {
    source: '$yaoming:2',
    target: '則天而行，作功邀名。',
  },

  {
    source: '$yanzhu:1',
    target: '觥籌交錯，殺人於無形！',
  },
  {
    source: '$yanzhu:2',
    target: '子烈設宴，意在汝項上人頭！',
  },
  {
    source: '$xingxue:1',
    target: '案古置學官，以敦王化，以隆風俗。',
  },
  {
    source: '$xingxue:2',
    target: '志善好學，未來可期。',
  },

  {
    source: '$anguo:1',
    target: '安邦定國，臣子分內之事。',
  },
  {
    source: '$anguo:2',
    target: '止干戈，休戰事。',
  },

  {
    source: '$huaiyi:1',
    target: '曹劉可王，孤亦可王！',
  },
  {
    source: '$huaiyi:2',
    target: '漢失其鹿，天下豪傑當共逐之！',
  },

  {
    source: '$jigong:1',
    target: '此時不戰，更待何時？',
  },
  {
    source: '$jigong:2',
    target: '箭在弦上，不得不發！',
  },
  {
    source: '$shifei:1',
    target: '若依吾計而行，許昌旦夕可破。',
  },
  {
    source: '$shifei:2',
    target: '先鋒怯戰，非謀策之過。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source:
      '{0}: do you want to choose a target to judge? if the result is red, he recover, otherwise he draw {1} cards',
    target: '{0}：你可以令一名角色判定，若結果為：紅色，其回覆1點體力；黑色，其摸 {1} 張牌',
  },

  {
    source: '{0}: do you want to let other Wei generals to choose whether let you recover 1 hp?',
    target: '{0}：你可以令所有其他魏勢力角色依次選擇是否令你回覆1點體力',
  },
  {
    source: '{0}: do you want to let {1} recover 1 hp, then you will take 1 damage?',
    target: '{0}：你可以令 {1} 回覆1點體力，且會在其此次瀕死狀態結束後受到1點無來源傷害',
  },

  {
    source: '{0}: do you want to use this skill to {1} ?',
    target: '{0}：你可以對 {1} 發動本技能',
  },
  {
    source: '{0}: please drop {1} card(s), or {2} will deal 1 more damage to you',
    target: '{0}：請棄置 {1} 張手牌，否則 {2} 對你的傷害基數將會+1，且有一定概率不能響應',
  },

  {
    source: '{0}: do you want to draw a card with {1} ?',
    target: '{0}：你可以與 {1} 各摸一張牌',
  },

  {
    source: '{0}: do you want to choose a male character to draw card(s)?',
    target: '{0}：你可以令一名男性角色摸牌',
  },

  {
    source: '{0}: please choose jigong options',
    target: '{0}：你可以摸一至三張牌',
  },
  { source: 'jigong:draw1', target: '摸一張牌' },
  { source: 'jigong:draw2', target: '摸兩張牌' },
  { source: 'jigong:draw3', target: '摸三張牌' },
  { source: '{0} placed card {1} on the top of draw stack', target: '{0} 將 {1} 置於了牌堆頂 ' },

  {
    source: 'zuoding: do you want to choose a target to draw a card?',
    target: '佐定：你可以令其中一名角色摸一張牌',
  },

  {
    source: '{0}: please choose a hand card to display',
    target: '{0}：請選擇一張手牌展示',
  },

  {
    source: 'do you want choose a target to use YaoMing?',
    target: '你可以選擇一名角色發動“邀名”',
  },
  {
    source: '{0}: you can discard at most 2 cards, and then draw the same amount of cards',
    target: '{0}：你可以棄置一至兩張牌，然後摸等量的牌',
  },

  {
    source: '{0}: please choose a color and discard all hand cards with that color',
    target: '{0}：請選擇一種顏色，並棄置手牌中所有此顏色的牌',
  },
  { source: 'huaiyi:black', target: '黑色' },
  { source: 'huaiyi:red', target: '紅色' },
  {
    source: '{0}: do you want to choose {1} targets to prey a card from each of them?',
    target: '{0}：請選擇至多 {1} 名其他角色，獲得這些角色各一張牌',
  },

  {
    source: '{0}: do you want to let {1} draw a card?',
    target: '{0}：你可以令 {1} 摸一張牌',
  },
  {
    source: 'shifei: do you want to choose a target to drop 1 card by you? and you will use/response a virtual Jink',
    target: '飾非：你可以棄置其中一名角色一張牌，視為你使用或打出一張【閃】',
  },
];
