import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'limited', target: '限定' },

  { source: 'chenlin', target: '陳琳' },
  { source: 'bifa', target: '筆伐' },
  { source: 'songci', target: '頌詞' },
  { source: '#songci', target: '頌詞（摸牌）' },

  { source: 'caochun', target: '曹純' },
  { source: 'shanjia', target: '繕甲' },
  { source: 'shanjia count: {0}', target: '繕甲[{0}]' },

  { source: 'jianggan', target: '蔣幹' },
  { source: 'weicheng', target: '僞誠' },
  { source: 'daoshu', target: '盜書' },

  { source: 'wangshuang', target: '王雙' },
  { source: 'zhuilie', target: '追獵' },

  { source: 'caoshuang', target: '曹爽' },
  { source: 'tuogu', target: '託孤' },
  { source: 'shanzhuan', target: '擅專' },

  { source: 'ruanyu', target: '阮瑀' },
  { source: 'xingzuo', target: '興作' },
  { source: '#xingzuo', target: '興作（換牌）' },
  { source: 'miaoxian', target: '妙弦' },

  { source: 'guansuo', target: '關索' },
  { source: 'zhengnan', target: '徵南' },
  { source: 'xiefang', target: '擷芳' },

  { source: 'zhugeguo', target: '諸葛果' },
  { source: 'qirang', target: '祈禳' },
  { source: 'yuhua', target: '羽化' },

  { source: 'baosanniang', target: '鮑三娘' },
  { source: 'wuniang', target: '武娘' },
  { source: 'xushen', target: '許身' },
  { source: '#xushen', target: '許身（變關索）' },
  { source: 'zhennan', target: '鎮南' },

  { source: 'guozhao', target: '郭照' },
  { source: 'pianchong', target: '偏寵' },
  { source: 'pianchong: {0}', target: '偏寵[{0}]' },
  { source: 'pianchong: {0} {1}', target: '偏寵[{0}{1}]' },
  { source: 'zunwei', target: '尊位' },

  { source: 'gexuan', target: '葛玄' },
  { source: 'lianhua', target: '煉化' },
  { source: 'danxue', target: '丹血' },
  { source: 'zhafu', target: '札符' },

  { source: 'new_liuzan', target: '留贊' },
  { source: 'new_fenyin', target: '奮音' },
  { source: 'liji', target: '力激' },
  { source: 'liji times: {0} {1}', target: '力激[{0}|+{1}]' },

  { source: 'panshu', target: '潘淑' },
  { source: 'weiyi', target: '威儀' },
  { source: 'jinzhi', target: '錦織' },

  { source: 'xurong', target: '徐榮' },
  { source: 'xionghuo', target: '兇鑊' },
  { source: 'baoli', target: '暴戾' },
  { source: 'shajue', target: '殺絕' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'shanjia_description',
    target:
      '出牌階段開始時，你可以摸三張牌，然後棄置三張牌（本局遊戲內你每不因使用而失去一張裝備牌，便少棄置一張牌）。若你未以此法棄置非裝備牌，你可視爲使用一張無距離限制的【殺】。',
  },

  {
    source: 'bifa_description',
    target:
      '結束階段開始時，你可以將一張手牌置於沒有“檄”的一名其他角色的武將牌旁，稱爲“檄”。該角色於其下個回合開始時，觀看此“檄”並選擇一項：1.交給你一張與此“檄”類別相同的手牌，然後獲得此“檄”；2.移去此“檄”並失去1點體力。',
  },
  {
    source: 'songci_description',
    target:
      '每名角色限一次，出牌階段，你可以選擇一名角色，若其手牌數：大於體力值，其棄置兩張牌；不大於體力值，其摸兩張牌；棄牌階段結束時，若你對所有存活角色均發動過本技能，你摸一張牌。',
  },

  {
    source: 'weicheng_description',
    target: '當其他角色獲得你的手牌，或你交給其他角色你的手牌後，若你的手牌數小於體力值，你可以摸一張牌。',
  },
  {
    source: 'daoshu_description',
    target:
      '出牌階段，你可以聲明一種花色並獲得一名其他角色的一張手牌，若此牌與你聲明的花色：相同，你對其造成1點傷害；不同，你交給其一張不爲你以此法獲得的牌花色的手牌（若無法給出，則改爲展示所有手牌），且此技能於本回合內失效。',
  },

  {
    source: 'zhuilie_description',
    target:
      '<b>鎖定技</b>，你使用【殺】無距離限制；當你使用【殺】指定不在你攻擊範圍內的角色後，此【殺】不計入次數限制且你判定，若爲武器牌或坐騎牌，你令此【殺】對其傷害基數等同於其體力值，否則你失去1點體力。',
  },

  {
    source: 'tuogu_description',
    target:
      '當其他角色死亡時，你可以令其選擇其一項技能（主公技、限定技、覺醒技和隱匿技除外），你失去以此法獲得的上一個技能，獲得此技能。',
  },
  {
    source: 'shanzhuan_description',
    target:
      '當你對其他角色造成傷害後，若其判定區裏沒有牌，你可以將其一張牌置於其判定區內。若此牌不爲延時類錦囊牌且爲：紅色牌，此牌視爲【樂不思蜀】；黑色牌，此牌視爲【兵糧寸斷】。回合結束時，若你本回合沒有造成過傷害，你可以摸一張牌。',
  },

  {
    source: 'xingzuo_description',
    target:
      '出牌階段開始時，你可以觀看牌堆底三張牌，然後你可以用至少一張手牌交換其中等量的牌。若你交換了牌，你於本回合的結束階段開始時，令一名有手牌的角色將所有手牌與牌堆底三張牌交換，若以此法置於牌堆底的牌數大於三張，你失去1點體力。',
  },
  {
    source: 'miaoxian_description',
    target:
      '若你的手牌中僅有一張：黑色牌，你可以將此牌當任意普通錦囊牌使用（每回合限一次）；紅色牌，你使用此牌時摸一張牌。',
  },

  {
    source: 'zhengnan_description',
    target:
      '每名角色限一次，當一名角色進入瀕死狀態時，你可以回覆1點體力，然後摸一張牌並選擇以下一項技能獲得：“當先”、“武聖”和“制蠻”（若你已擁有這三個技能則改爲摸三張牌）。',
  },
  {
    source: 'xiefang_description',
    target: '<b>鎖定技</b>，你計算與其他角色的距離-X（X爲存活女性角色數）。',
  },

  {
    source: 'qirang_description',
    target: '當裝備牌進入你的裝備區後，你可以從牌堆隨機獲得一張錦囊牌。若此牌爲普通錦囊牌，你於本回合使用此牌指定唯一目標時，你可以爲此牌增加一個額外的目標。',
  },
  {
    source: 'yuhua_description',
    target: '<b>鎖定技</b>，你的非基本牌不計入手牌上限；結束階段開始時，若你的手牌數大於體力上限，你觀看牌堆頂一張牌，然後將之置於牌堆頂或牌堆底。',
  },

  {
    source: 'wuniang_description',
    target:
      '當你使用或打出【殺】時，你可以獲得一名其他角色的一張牌，然後其摸一張牌，若你已發動過“許身”且場上存在“關索”，其摸一張牌。',
  },
  {
    source: 'xushen_description',
    target:
      '<b>限定技</b>，當你進入瀕死狀態時，若你的體力不大於0，你可以回覆1點體力並獲得技能“鎮南”。若如此做，當你脫離此次瀕死狀態後，若場上沒有“關索”，你可以令一名其他角色選擇是否用“關索”替換其武將牌並摸三張牌。',
  },
  {
    source: 'zhennan_description',
    target: '當一名角色使用普通錦囊牌指定第一個目標後，若目標數大於1，你可以對一名其他角色造成1點傷害。',
  },

  {
    source: 'pianchong_description',
    target:
      '摸牌階段，你可以改爲隨機獲得牌堆裏的黑色和紅色牌各一張，然後選擇一項獲得一項效果直到你的下個回合開始：1.當你失去一張黑色牌後，你隨機獲得牌堆裏的一張紅色牌；2.當你失去一張紅色牌後，你隨機獲得牌堆裏的一張黑色牌。',
  },
  {
    source: 'zunwei_description',
    target:
      '出牌階段限一次，你可以選擇一名其他角色，並選擇一項：1.將手牌數摸至與該角色相同（最多摸五張）；2.隨機使用牌堆中的裝備牌至與該角色相同；3.將體力回覆至與該角色相同。最後移除該選項。',
  },

  {
    source: 'lianhua_description',
    target:
      '<b>鎖定技</b>，當其他角色於你的回合外受到傷害後，你獲得一枚“丹血”標記直到你的下個出牌階段開始（若其陣營與你：相同，此“丹血”爲紅色；不同，此“丹血”爲黑色。丹血的顏色對所有角色不可見）；準備階段開始時，你根據你擁有的“丹血”的數量及顏色，從牌堆和棄牌堆中獲得相應的牌各一張，以及相應的一項技能（此技能回合結束失去）：不多於3枚，【桃】和“英姿”；多於3枚且紅色較多，【無中生有】和“觀星”；多於3枚且黑色較多，【順手牽羊】和“直言”；多於3枚且紅黑數量相等，【殺】及【決鬥】，“攻心”。',
  },
  {
    source: 'zhafu_description',
    target:
      '<b>限定技</b>，出牌階段，你可以令一名其他角色於其下個棄牌階段開始時，其選擇其一張手牌保留，然後將其他手牌交給你。',
  },

  {
    source: 'new_fenyin_description',
    target:
      '<b>鎖定技</b>，當一張牌於你的回合內進入棄牌堆後，若此牌花色與本回合內進入過棄牌堆的其他牌花色均不同，你摸一張牌。',
  },
  {
    source: 'liji_description',
    target:
      '每回合限零次，出牌階段，你可以棄置一張牌，並對一名其他角色造成1點傷害；你的回合內，本回合進入棄牌堆的牌每達到8的倍數張時（若本回合開始時存活角色數小於5，改爲4的倍數），此技能於本回合內的使用次數上限+1。',
  },

  {
    source: 'weiyi_description',
    target:
      '每名角色限一次，當一名角色受到傷害後，若其體力值：大於你，你可以令其失去1點體力；小於你，你可以令其回覆1點體力；等於你，你可以令其失去或回覆1點體力。',
  },
  {
    source: 'jinzhi_description',
    target:
      '當你需要使用或打出基本牌時，你可以棄置X張牌，然後摸一張牌，視爲使用或打出此基本牌（X爲你本輪內發動過本技能的次數+1）。',
  },

  {
    source: 'xionghuo_description',
    target:
      '遊戲開始時，你獲得3枚“暴戾”標記；出牌階段，你可以將你的一枚“暴戾”標記移給沒有“暴戾”標記的一名其他角色；當你對擁有“暴戾”的其他角色造成傷害時，此傷害+1；擁有“暴戾”的其他角色的出牌階段開始時，移去其所有“暴戾”標記，且其隨機執行一項：1.受到你對其造成的1點火焰傷害，其於本回合內不能對你使用【殺】；2.失去1點體力，其本回合手牌上限-1；3.令你隨機獲得其裝備區和手牌裏的各一張牌。',
  },
  {
    source: 'shajue_description',
    target:
      '<b>鎖定技</b>，當其他角色進入瀕死狀態時，若其體力小於0，你獲得一枚“暴戾”標記，然後你獲得令其進入瀕死狀態的牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$bifa:1',
    target: '筆墨紙硯，皆兵器也！',
  },
  {
    source: '$bifa:2',
    target: '汝德行敗壞，人所不齒也！',
  },
  {
    source: '$songci:1',
    target: '將軍德才兼備，大漢之棟樑也！',
  },
  {
    source: '$songci:2',
    target: '汝竊國奸賊，人人得而誅之！',
  }, 

  {
    source: '$shanjia:1',
    target: '繕甲厲兵，伺機而行。',
  },
  {
    source: '$shanjia:2',
    target: '戰，當取精銳之兵，而棄駑鈍也。',
  },

  {
    source: '$weicheng:1',
    target: '吾只觀雅規，而非說客。',
  },
  {
    source: '$weicheng:2',
    target: '略施謀略，敵軍便信以爲真。',
  },
  {
    source: '$daoshu:1',
    target: '讓我看看，這是什麼機密。',
  },
  {
    source: '$daoshu:2',
    target: '得此文書，丞相定可高枕無憂！',
  },

  {
    source: '$tuogu:1',
    target: '君託以六尺之孤，爽當寄百里之命！',
  },
  {
    source: '$tuogu:2',
    target: '先帝以大事託我，任重而道遠。',
  },
  {
    source: '$shanzhuan:1',
    target: '打入冷宮，禁足絕食！',
  },
  {
    source: '$shanzhuan:2',
    target: '我言既出，誰敢不從？',
  },

  {
    source: '$zhuilie:1',
    target: '哈哈！我喜歡獵奪沙場的快感！',
  },
  {
    source: '$zhuilie:2',
    target: '追敵奪魂，獵盡賊寇！',
  },

  {
    source: '$xingzuo:1',
    target: '順人之情，時之勢，興作可成。',
  },
  {
    source: '$xingzuo:2',
    target: '興作從心，相繼不絕。',
  },
  {
    source: '$miaoxian:1',
    target: '女爲悅者容，士爲知己死。',
  },
  {
    source: '$miaoxian:2',
    target: '與君高歌，請君側耳。',
  },

  {
    source: '$pianchong:1',
    target: '得陛下憐愛，恩寵不衰。',
  },
  {
    source: '$pianchong:2',
    target: '謬蒙聖恩，光授殊寵。',
  },
  {
    source: '$zunwei:1',
    target: '處尊居顯，位極椒房。',
  },
  {
    source: '$zunwei:2',
    target: '自在東宮，及即尊位。',
  },

  {
    source: '$qirang:1',
    target: '集母親之智，效父親之法，祈以七星。',
  },
  {
    source: '$qirang:2',
    target: '仙甲既來，豈無仙術乎？',
  }, 
  {
    source: '$yuhua:1',
    target: '鳳羽飛煙，乘化仙塵。',
  },
  {
    source: '$yuhua:2',
    target: '此乃仙人之物，不可輕棄。',
  },

  {
    source: '$wuniang:1',
    target: '雖爲女子身，不輸男兒郎。',
  },
  {
    source: '$wuniang:2',
    target: '劍舞輕影，殺場克敵。',
  }, 
  {
    source: '$xushen:1',
    target: '救命之恩，湧泉相報。',
  },
  {
    source: '$xushen:2',
    target: '解我危難，報君華彩。',
  },
  {
    source: '$zhennan:1',
    target: '鎮守南中，夫君無憂。',
  },
  {
    source: '$zhennan:2',
    target: '與君攜手，定平蠻夷。',
  },

  {
    source: '$lianhua:1',
    target: '白日清山，飛昇化仙。',
  },
  {
    source: '$lianhua:2',
    target: '草木精煉，萬物化丹。',
  },
  {
    source: '$yingzi.gexuan:1',
    target: '仙人之姿，凡目豈見！',
  },
  {
    source: '$zhiyan.gexuan:1',
    target: '仙人之語，凡耳震聵！',
  },
  {
    source: '$gongxin.gexuan:1',
    target: '仙人之目，因果即現！',
  },
  {
    source: '$guanxing.gexuan:1',
    target: '仙人之棲，羣星浩瀚！',
  },
  {
    source: '$zhafu:1',
    target: '垂恩廣救，慈悲在懷。',
  },
  {
    source: '$zhafu:2',
    target: '行符敕鬼，神變善易。',
  },

  {
    source: '$new_fenyin:1',
    target: '鬥志高歌，士氣昂揚！',
  },
  {
    source: '$new_fenyin:2',
    target: '亢音而歌，左右應之！',
  },
  {
    source: '$liji:1',
    target: '破敵搴旗，未嘗負敗！',
  },
  {
    source: '$liji:2',
    target: '鷙猛壯烈，萬人不敵！',
  },

  {
    source: '$weiyi:1',
    target: '無威儀者，不可奉社稷。',
  },
  {
    source: '$weiyi:2',
    target: '有威儀者，禁止雍容。',
  },
  {
    source: '$jinzhi:1',
    target: '織錦爲旗，以揚威儀。',
  },
  {
    source: '$jinzhi:2',
    target: '坐而織錦，立則爲儀。',
  },

  {
    source: '$xionghuo:1',
    target: '此鑊加之於你，定有所傷！',
  },
  {
    source: '$xionghuo:2',
    target: '兇鑊沿襲，怎會輕易無傷？',
  },
  {
    source: '$shajue:1',
    target: '殺伐決絕，不留後患！',
  },
  {
    source: '$shajue:2',
    target: '吾既出，必絕之！',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please drop {1} card(s), if all of them are equip card, you can use a virtual slash',
    target: '{0}: 請棄置 {1} 張牌，若棄牌中均爲裝備牌，則可視爲使用一張無距離限制的【殺】',
  },
  {
    source: 'shanjia: do you want to use a slash?',
    target: '繕甲：你可以視爲使用一張【殺】（無距離限制）',
  },

  {
    source: '{0}: please choose a card suit',
    target: '{0}: 請選擇一種花色',
  },
  {
    source: '{0}: please give {1} a hand card except the card with suit {2}',
    target: '{0}: 請交給 {1} 一張非{2}手牌',
  },

  {
    source: 'the bottom of draw stack',
    target: '牌堆底的牌',
  },
  {
    source: 'xingzuo: please select cards to put on draw stack bottom',
    target: '興作：請選擇其中三張牌作爲牌堆底的牌',
  },
  {
    source: '{0}: do you want to choose a target to exchange hand cards with draw stack bottom?',
    target: '{0}：你可以令一名有牌的角色將所有手牌與牌堆底三張牌交換',
  },

  {
    source: '{0}: do you want to gain a random equip card from draw stack?',
    target: '{0}：你可以從牌堆隨機獲得一張錦囊牌',
  },
  {
    source: '{0}: do you want to select a player to append to {1} targets?',
    target: '{0}：你可以爲 {1} 增加一個額外目標',
  },

  {
    source: '{0}: please choose pianchong options',
    target: '{0}：請選擇以下一項效果獲得，並持續到你的下個回合開始',
  },
  { source: 'pianchong:loseBlack', target: '失去黑色牌獲得紅色牌' },
  { source: 'pianchong:loseRed', target: '失去紅色牌獲得黑色牌' },

  {
    source: '{0}: please choose zunwei options: {1}',
    target: '{0}：請選擇以下一項，執行對應效果至與 {1} 數量相等',
  },
  { source: 'zunwei:hand', target: '手牌' },
  { source: 'zunwei:equip', target: '裝備區牌' },
  { source: 'zunwei:recover', target: '體力值' },

  {
    source: '{0}: do you want to put a card from {1} into his judge area?',
    target: '{0}：你可以將 {1} 的一張牌置於其判定區內',
  },

  {
    source: '{0}: please choose a skill to let {1} gain it',
    target: '{0}：請選擇一項技能令 {1} 獲得',
  },

  {
    source: '{0}: please choose a hand card, give the other cards to {1}',
    target: '{0}：請選擇一張手牌保留，將其他手牌交給 {1}',
  },

  {
    source: '{0}: please choose a skill to gain',
    target: '{0}：請選擇以下一項技能獲得',
  },

  {
    source: '{0}: do you want to prey a card from another player?',
    target: '{0}：你可以獲得一名其他角色的一張牌，然後其摸一張牌',
  },

  {
    source: '{0}: do you want to choose another player to let him change general to Guan Suo and draw 3 cards?',
    target: '{0}：你可以令一名其他角色選擇是否變爲“關索”並摸三張牌',
  },
  {
    source: '{0}: do you want to change your general to Guan Suo and draw 3 cards?',
    target: '{0}：你可以變爲“關索”並摸三張牌',
  },

  {
    source: '{0}: do you want to deal 1 damage to another player?',
    target: '{0}：你可以對一名其他角色造成1點傷害',
  },

  {
    source: '{0}: please choose weiyi options: {1}',
    target: '{0}：你可以選擇令 {1} 失去或回覆1點體力',
  },
  { source: 'weiyi:loseHp', target: '其失去體力' },
  { source: 'weiyi:recover', target: '其回覆體力' },
  {
    source: '{0}: do you want to let {1} lose 1 hp?',
    target: '{0}：你可以令 {1} 失去1點體力',
  },
  {
    source: '{0}: do you want to let {1} recover 1 hp?',
    target: '{0}：你可以令 {1} 回覆1點體力',
  },
];
