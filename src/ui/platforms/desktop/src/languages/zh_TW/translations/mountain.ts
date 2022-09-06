import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'zhanghe', target: '張郃' },
  { source: 'qiaobian', target: '巧變' },

  { source: 'dengai', target: '鄧艾' },
  { source: 'tuntian', target: '屯田' },
  { source: 'zaoxian', target: '鑿險' },
  { source: 'jixi', target: '急襲' },

  { source: 'jiangwei', target: '姜維' },
  { source: 'tiaoxin', target: '挑釁' },
  { source: 'zhiji', target: '誌繼' },

  { source: 'liushan', target: '劉禪' },
  { source: 'xiangle', target: '享樂' },
  { source: 'fangquan', target: '放權' },
  { source: 'ruoyu', target: '若愚' },
  { source: 'sishu', target: '思蜀' },

  { source: 'sunce', target: '孫策' },
  { source: 'jiang', target: '激昂' },
  { source: 'hunzi', target: '魂姿' },
  { source: 'zhiba', target: '製霸' },
  { source: '~zhiba', target: '製霸' },

  { source: 'zhangzhaozhanghong', target: '張昭張紘' },
  { source: 'zhijian', target: '直諫' },
  { source: 'guzheng', target: '固政' },

  { source: 'zuoci', target: '左慈' },
  { source: 'huashen', target: '化身' },
  { source: 'xinsheng', target: '新生' },

  { source: 'caiwenji', target: '蔡文姬' },
  { source: 'beige', target: '悲歌' },
  { source: 'duanchang', target: '斷腸' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'tuntian_description',
    target:
      '當你於回合外失去牌後，你可以進行判定，若結果為紅桃，你獲得此判定牌，否則你將此判定牌置於你的武將牌上，稱為“田”；你與其他角色計算距離-X（X為“田”的數量）。',
  },
  {
    source: 'zaoxian_description',
    target: '<b>覺醒技</b>，準備階段開始時，若你有不少於三張“田”，你減一點體力上限並獲得“急襲”。',
  },
  { source: 'jixi_description', target: '你可以將一張“田”當【順手牽羊】使用。' },
  {
    source: 'qiaobian_description',
    target:
      '你可以棄置一張手牌並跳過一個階段（準備階段和結束階段除外），若你以此法跳過：摸牌階段，你可以獲得一至兩名其他角色的各一張手牌；出牌階段，你可以移動場上一張牌。',
  },
  {
    source: 'tiaoxin_description',
    target: '出牌階段限一次，你可以令一名其他角色選擇一項：1.對包括你在內的角色使用一張【殺】；2.令你棄置其一張牌。',
  },
  {
    source: 'zhiji_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若你冇有手牌，你選擇一項：1.摸兩張牌；2.回複1點體力，然後你減一點體力上限並獲得“觀星”。',
  },
  {
    source: 'xiangle_description',
    target: '<b>鎖定技</b>，當你成為【殺】的目標後，你令使用者選擇一項：1.棄置一張基本牌；2.此【殺】對你無效。',
  },
  {
    source: 'fangquan_description',
    target:
      '你可以跳過出牌階段，然後於此回合的棄牌階段開始時，棄置一張手牌並選擇一名其他角色，令其於此回合結束時執行一個額外的回合。',
  },
  {
    source: 'ruoyu_description',
    target:
      '<b>主公技</b>，<b>覺醒技</b>，準備階段開始時，若你為體力值最小的角色，你增加1點體力上限並回複1點體力，然後獲得“激將”和“思蜀”。',
  },
  {
    source: 'sishu_description',
    target: '出牌階段開始時，你可以令一名角色於本局遊戲中的【樂不思蜀】判定效果反轉。',
  },
  {
    source: 'jiang_description',
    target: '當你使用【決鬥】或紅色【殺】指定目標後，或成為【決鬥】或紅色【殺】的目標後，你可以摸一張牌。',
  },
  {
    source: 'hunzi_description',
    target: '<b>覺醒技</b>，準備階段開始時，若你的體力值不大於2，你減1點體力上限並獲得“英魂”和“英姿”。',
  },
  {
    source: 'zhiba_description',
    target:
      '<b>主公技</b>，其他吳勢力角色的出牌階段限一次，其可以與你拚點（若你已發動過“魂姿”，你可以拒絕此拚點），若其冇贏，你可以獲得雙方的拚點牌。',
  },
  {
    source: 'zhijian_description',
    target:
      '出牌階段，你可以將一張裝備牌置入一名其他角色的裝備區內，然後摸一張牌；當你於出牌階段使用裝備牌時，你可以摸一張牌。',
  },
  {
    source: 'guzheng_description',
    target:
      '其他角色的棄牌階段結束時，你可以將此階段中該角色因棄置而置入棄牌堆的一張手牌交給其，然後你可以獲得其餘於此階段內因棄置而置入棄牌堆的牌。',
  },
  {
    source: 'beige_description',
    target:
      '當一名角色受到【殺】造成的傷害後，你可以棄置一張牌，然後令其判定，若結果為：紅桃，其回複X點體力（X為傷害值）；方塊，其摸三張牌；梅花，傷害來源棄置兩張牌；黑桃，傷害來源翻麵。',
  },
  { source: 'duanchang_description', target: '<b>鎖定技</b>，當你死亡時，殺死你的角色失去所有技能。' },
  {
    source: 'huashen_description',
    target:
      '遊戲開始時，你隨機將武將牌堆裏的三張牌扣置於你的武將牌上，稱為“化身”，並亮出其中一張且擁有其上由你選擇的一個技能（限定技、覺醒技和主公技除外），然後你的性別及勢力視為與此“化身”相同；回合開始或回合結束時，你可以選擇一項：1.變更亮出的“化身”；2.移去一至兩張未亮出的“化身”並獲得等量新“化身”。',
  },
  { source: 'xinsheng_description', target: '當你受到1點傷害後，你可以獲得一張“化身”。' },
];

export const skillAudios: Word[] = [
  {
    source: '$qiaobian:1',
    target: '兵無常勢，水無常形。',
  },
  {
    source: '$qiaobian:2',
    target: '用兵之道，變化萬千。',
  },

  {
    source: '$tuntian:1',
    target: '休養生息，是爲以備不虞！',
  },
  {
    source: '$tuntian:2',
    target: '戰損難免，應以軍務減之。',
  },
  {
    source: '$zaoxian:1',
    target: '用兵以險，則戰之以勝！',
  },
  {
    source: '$zaoxian:2',
    target: '已至馬閣山，宜速進軍破蜀！',
  },
  {
    source: '$jixi:1',
    target: '攻敵之不備，斬將奪輜！',
  },
  {
    source: '$jixi:2',
    target: '奇兵正攻，敵何能爲？',
  },

  {
    source: '$tiaoxin:1',
    target: '會聞用師，觀釁而動。',
  },
  {
    source: '$tiaoxin:2',
    target: '宜乘其釁會，以挑敵將！',
  },
  {
    source: '$zhiji:1',
    target: '丞相遺志，不死不休！',
  },
  {
    source: '$zhiji:2',
    target: '大業未成，矢志不渝！',
  },
  {
    source: '$guanxing.jiangwei:1',
    target: '星象相銜，此乃吉兆。',
  },
  {
    source: '$guanxing.jiangwei:2',
    target: '星之分野，各有所屬。',
  },

  {
    source: '$xiangle:1',
    target: '誒嘿嘿嘿，還是玩耍快樂~',
  },
  {
    source: '$xiangle:2',
    target: '美好的日子，應該好好享受。',
  },
  {
    source: '$fangquan:1',
    target: '蜀漢有相父在，我可安心。',
  },
  {
    source: '$fangquan:2',
    target: '這些事情，你們安排就好。',
  },
  {
    source: '$ruoyu:1',
    target: '若愚故泰，巧騙衆人。',
  },
  {
    source: '$ruoyu:2',
    target: '愚昧者，非真傻也。',
  },
  {
    source: '$sishu:1',
    target: '蜀樂鄉土，怎不思念？',
  },
  {
    source: '$sishu:2',
    target: '思鄉心切，徘徊惶惶。',
  },

  {
    source: '$jiang:1',
    target: '我會把勝利，帶回江東！',
  },
  {
    source: '$jiang:2',
    target: '天下英雄，誰能與我一戰！',
  },
  {
    source: '$hunzi:1',
    target: '小霸王之名，響徹天下，何人不知！',
  },
  {
    source: '$hunzi:2',
    target: '江東已平，中原動盪，直取許昌！',
  },
  {
    source: '$zhiba:1',
    target: '我的霸業，纔剛剛開始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是戰是降，我皆奉陪。',
  },

  {
    source: '$zhiba:1',
    target: '我的霸業，纔剛剛開始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是戰是降，我皆奉陪。',
  },
  {
    source: '$zhiba:1',
    target: '我的霸業，纔剛剛開始。',
  },
  {
    source: '$zhiba:2',
    target: '汝是戰是降，我皆奉陪。',
  },

  {
    source: '$zhijian:1',
    target: '爲臣之道，在於直言不諱。',
  },
  {
    source: '$zhijian:2',
    target: '建言或逆耳，於國無一害。',
  },
  {
    source: '$guzheng:1',
    target: '爲君者，不可私行土木，奢廢物料。',
  },
  {
    source: '$guzheng:2',
    target: '安民固國，方可思棟。',
  },

  {
    source: '$huashen:1',
    target: '世間萬物，貧道皆可化爲其形。',
  },
  {
    source: '$huashen:2',
    target: '塵身土塑，唯魂魄難得。',
  },
  {
    source: '$xinsheng:1',
    target: '大成若缺，損亦無妨。',
  },
  {
    source: '$xinsheng:2',
    target: '大盈若衝，新神自現。',
  },

  {
    source: '$beige:1',
    target: '人多暴猛兮如虺蛇，控弦被甲兮爲驕奢。',
  },
  {
    source: '$beige:2',
    target: '兩拍張弦兮弦欲絕，志摧心折兮自悲嗟。',
  },
  {
    source: '$duanchang:1',
    target: '雁飛高兮邈難尋，空斷腸兮思愔愔。',
  },
  {
    source: '$duanchang:2',
    target: '爲天有眼兮，何不見我獨漂流？',
  },
];

export const promptDictionary: Word[] = [
  {
    source: '{0}: do you want to drop a hand card to skip {1} ?',
    target: '{0}：你可以棄置一張手牌，跳過 {1}',
  },
  {
    source: '{0}: please choose one or two targets to obtain a hand card from each of them',
    target: '{0}：你可以選擇一至兩名其他角色，獲得他們各一張手牌',
  },
  {
    source: '{0}: do you want to move a card in the battlefield?',
    target: '{0}：你可以移動場上一張牌',
  },
];
