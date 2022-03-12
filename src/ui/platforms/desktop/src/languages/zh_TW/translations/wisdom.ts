import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'wisdom', target: '智包' },

  { source: 'zhi_wangcan', target: '智王粲' },
  { source: 'zhi_qiai', target: '七哀' },
  { source: 'zhi_shanxi', target: '善檄' },
  { source: 'zhi_shanxi:xi', target: '檄' },

  { source: 'bianfuren', target: '卞夫人' },
  { source: 'wanwei', target: '挽危' },
  { source: 'yuejian', target: '約儉' },

  { source: 'chenzhen', target: '陳震' },
  { source: 'shameng', target: '歃盟' },

  { source: 'feiyi', target: '費禕' },
  { source: 'jianyu', target: '諫喻' },
  { source: 'jianyu target: {0}', target: '諫喻:{0}' },
  { source: 'shengxi', target: '生息' },

  { source: 'luotong', target: '駱統' },
  { source: 'qinzheng', target: '勤政' },
  { source: 'qinzheng times: {0}', target: '勤政[{0}]' },

  { source: 'zhi_xunchen', target: '智荀諶' },
  { source: 'jianzhan', target: '諫戰' },
  { source: 'duoji', target: '奪冀' },

  { source: 'zhi_duyu', target: '智杜預' },
  { source: 'wuku', target: '武庫' },
  { source: 'wuku: {0}', target: '武庫[{0}]' },
  { source: 'zhi_sanchen', target: '三陳' },
  { source: 'miewu', target: '滅吳' },

  { source: 'zhi_sunshao', target: '智孫邵' },
  { source: 'fubi', target: '輔弼' },
  { source: '#fubi', target: '輔弼' },
  { source: '##fubi', target: '輔弼' },
  { source: 'zuici', target: '罪辭' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'zhi_qiai_description',
    target: '出牌階段限一次，你可以交給一名其他角色一張非基本牌，然後其選擇一項：1.令你回覆1點體力；2.令你摸兩張牌。',
  },
  {
    source: 'zhi_shanxi_description',
    target:
      '出牌階段開始時，你可以選擇一名沒有“檄”的其他角色，移去場上所有“檄”，其獲得1枚“檄”標記；當有“檄”的角色回覆體力後，若其不處於瀕死狀態，其選擇一項：1.交給你兩張牌；2.失去1點體力。',
  },

  {
    source: 'wanwei_description',
    target:
      '每輪限一次，你可令進入瀕死狀態的其他角色，或出牌階段由你選擇的一名其他角色回覆X+1點體力，然後你失去X點體力（X為你的體力值）。',
  },
  {
    source: 'yuejian_description',
    target: '你的手牌上限等同於體力上限；當你進入瀕死狀態時，你可以棄置兩張牌，回覆1點體力。',
  },

  {
    source: 'shameng_description',
    target: '出牌階段限一次，你可以棄置兩張顏色相同的手牌，並令一名其他角色摸兩張牌，然後你摸三張牌。',
  },

  {
    source: 'jianyu_description',
    target:
      '每輪限一次，出牌階段，你可以指定兩名角色。若如此做，直到你的下個回合開始，當其中一名角色使用牌指定另一名角色為目標後，後者摸一張牌。',
  },
  {
    source: 'shengxi_description',
    target: '結束階段開始時，若你於本回合內未造成過傷害，你可以摸兩張牌。',
  },

  {
    source: 'qinzheng_description',
    target:
      '<b>鎖定技，</b>當你使用或打出牌時，根據你本局遊戲使用或打出過牌數，隨機獲得牌堆裡一張相應的牌：3的倍數，【殺】或【閃】；5的倍數，【酒】或【桃】；8的倍數，【無中生有】或【決鬥】。',
  },

  {
    source: 'jianzhan_description',
    target:
      '出牌階段限一次，你可以令一名其他角色選擇一項：1.視為對其攻擊範圍內由你選擇的一名體力值小於其的角色使用一張【殺】；2.令你摸一張牌。',
  },
  {
    source: 'duoji_description',
    target:
      '出牌階段限一次，你可以將一張牌置於一名其他角色的武將牌上，稱為“冀”；當有“冀”的角色使用裝備牌結算結束後，你獲得此牌，然後其移去一張“冀”，並摸一張牌；有“冀”的角色的回合結束時，你獲得其所有“冀”。',
  },

  {
    source: 'wuku_description',
    target: '<b>鎖定技，</b>當一名角色使用裝備牌時，若你的“武庫”標記小於3，你獲得1枚“武庫”標記。',
  },
  {
    source: 'zhi_sanchen_description',
    target: '<b>覺醒技，</b>結束階段開始時，若你有3枚“武庫”標記，你加1點體力上限，回覆1點體力，獲得技能“滅吳”。',
  },
  {
    source: 'miewu_description',
    target: '每回合限一次，你可以移去一枚“武庫”標記，並將一張牌當任意基本牌或錦囊牌使用或打出，然後你摸一張牌。',
  },
  {
    source: 'fubi_description',
    target:
      '遊戲開始時，你可以另一名其他角色獲得一枚“輔”標記。擁有“輔”標記的角色準備階段開時，你可以選擇一項：令其本回合手牌上限+3；或令其此回合使用【殺】的次數上限+1',
  },
  {
    source: 'zuici_description',
    target: '準備階段開始時或當你進入瀕死狀態時，你可以廢除一個你的裝備欄，回覆2點體力，然後你可以轉移“輔”標記',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$zhi_qiai:1',
    target: '恨我無時謀，譬諸具官臣。',
  },
  {
    source: '$zhi_qiai:2',
    target: '鞠躬中堅內，微畫無所陳。',
  },

  {
    source: '$zhi_shanxi:1',
    target: '連舫踰萬艘，帶甲千萬人。',
  },
  {
    source: '$zhi_shanxi:2',
    target: '率彼東南路，將定一舉勳。',
  },

  {
    source: '$wanwei:1',
    target: '梁沛之間，無子廉焉有今日？',
  },
  {
    source: '$wanwei:2',
    target: '汝兄弟既爲手足，何必苦苦相逼？',
  },
  {
    source: '$yuejian:1',
    target: '吾母儀天下，於節儉處當率先垂範。',
  },
  {
    source: '$yuejian:2',
    target: '取上爲貪，取下爲僞，妾則取其中者。',
  },

  {
    source: '$shameng:1',
    target: '歃血盟誓，以告神明。',
  },
  {
    source: '$shameng:2',
    target: '戮辦一心，同討魏賊。',
  },

  {
    source: '$jianyu:1',
    target: '功以才成，業由才廣，棄纔不用，非長計也。',
  },
  {
    source: '$jianyu:2',
    target: '舍此不任而防後患，是備風波而廢舟楫也。',
  },
  {
    source: '$shengxi:1',
    target: '利治小之宜，秉居靜之理。',
  },
  {
    source: '$shengxi:2',
    target: '外卻駱谷之師，內保寧緝之實。',
  },

  {
    source: '$qinzheng:1',
    target: '夫國之有民，猶水之有舟。停則以安，擾則以危。',
  },
  {
    source: '$qinzheng:2',
    target: '治疾及其未篤，除患貴其未深。',
  },

  {
    source: '$jianzhan:1',
    target: '若能迎天子以興兵討賊，大業可成。',
  },
  {
    source: '$jianzhan:2',
    target: '明公乃當世之雄，誰可匹敵？',
  },
  {
    source: '$duoji:1',
    target: '將軍若獻冀州，必安如泰山也。',
  },
  {
    source: '$duoji:2',
    target: '袁氏得冀州，必厚德將軍。',
  },

  {
    source: '$wuku:1',
    target: '損益萬樞，竭世運機。',
  },
  {
    source: '$wuku:2',
    target: '胸藏萬卷，充盈如庫。',
  },
  {
    source: '$zhi_sanchen:1',
    target: '賊計已窮，陳兵吳地，可一鼓而下也。',
  },
  {
    source: '$zhi_sanchen:2',
    target: '伐吳此舉，十有九利，惟陛下察之。',
  },
  {
    source: '$miewu:1',
    target: '傾蕩之勢已成，石城盡在眼下。',
  },
  {
    source: '$miewu:2',
    target: '吾軍勢如破竹，江東六郡唾手可得！',
  },

  /*  {
    source: '$dingyi:1',
    target: '經國序民，還需制禮定儀。',
  },
  {
    source: '$dingyi:2',
    target: '無禮而治世，欲使國泰，安可得哉？',
  },*/
  {
    source: '$fubi:1',
    target: '輔君弼主，士之所志也。',
  },
  {
    source: '$fubi:2',
    target: '獻策思計，佐定江山。',
  },
  {
    source: '$zuici:1',
    target: '既爲朝堂寧定，吾請辭便是。',
  },
  {
    source: '$zuici:2',
    target: '國事爲先，何懼清名有損。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'zhi_qiai:draw',
    target: '令其摸兩張牌。',
  },
  {
    source: 'zhi_qiai:recover',
    target: '令其回覆1點體力。',
  },
  {
    source: '{0}: please choose zhi_qiai options: {1}',
    target: '{0}：請選擇令 {1} 摸牌或回覆體力',
  },

  {
    source: '{0}: you need to give 2 cards to {1}, or you will lose 1 hp',
    target: '{0}：請交給 {1} 兩張牌，否則你將失去1點體力',
  },

  {
    source: '{0}: do you want to let {1} recover {2} hp, then you lose {3} hp?',
    target: '{0}：你可以令 {1} 回覆 {2} 點體力，然後你失去 {3} 點體力',
  },

  {
    source: '{0}: do you want to drop 2 cards to recover 1 hp?',
    target: '{0}：你可以棄置兩張牌來回復1點體力',
  },

  {
    source: '{0}: do you want to draw 2 cards?',
    target: '{0}：你可以摸兩張牌',
  },

  {
    source: '{0}: do you want to draw 2 cards?',
    target: '{0}：你可以摸兩張牌',
  },

  {
    source: 'jianzhan:draw',
    target: '令其摸一張牌',
  },
  {
    source: 'jianzhan:slash',
    target: '視為對目標使用一張【殺】',
  },
  {
    source: '{0}: please choose jianzhan options: {1} {2}',
    target: '{0}：請選擇視為對 {1} 使用一張【殺】，或令 {2} 摸一張牌',
  },
  {
    source: '{0}: please choose: {1}',
    target: '{0}：請選擇令 {1} 摸一張牌',
  },

  {
    source: '{0}: please remove a Ji',
    target: '{0}：請選擇一張“冀”移去',
  },
  {
    source: '{0}: please choose another player to transfer the "fu" mark',
    target: '{0}: 你可以將“輔”標記轉移給一名其他角色',
  },
  { source: '{0}: please choose and abort an equip section', target: '{0}: 請選擇廢除一個裝備區' },
  {
    source: '{0}: 1.owner has extra 3 cards hold limit, 2.one more time to use slash in current round',
    target: '{0}: 1. 其本回合手牌上限+3；2. 其此回合使用【殺】的次數上限+1',
  },
];
