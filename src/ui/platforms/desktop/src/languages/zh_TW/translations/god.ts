import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'god_guanyu', target: '神關羽' },
  { source: 'wushen', target: '武神' },
  { source: 'wuhun', target: '武魂' },
  { source: '#wuhun', target: '武魂' },

  { source: 'god_lvmeng', target: '神呂蒙' },
  { source: 'gongxin', target: '攻心' },
  { source: 'shelie', target: '涉獵' },

  { source: 'god_zhouyu', target: '神周瑜' },
  { source: 'qinyin', target: '琴音' },
  { source: 'yeyan', target: '業炎' },

  { source: 'god_zhugeliang', target: '神諸葛亮' },
  { source: 'qixing', target: '七星' },
  { source: '#qixing', target: '七星' },
  { source: 'kuangfeng', target: '狂風' },
  { source: 'dawu', target: '大霧' },

  { source: 'god_caocao', target: '神曹操' },
  { source: 'guixin', target: '歸心' },
  { source: 'feiying', target: '飛影' },

  { source: 'god_lvbu', target: '神呂布' },
  { source: 'kuangbao', target: '狂暴' },
  { source: 'wumou', target: '無謀' },
  { source: 'wuqian', target: '無前' },
  { source: 'shenfen', target: '神憤' },

  { source: 'god_simayi', target: '神司馬懿' },
  { source: 'renjie', target: '忍戒' },
  { source: 'baiyin', target: '拜印' },
  { source: 'jilve', target: '極略' },
  { source: '#jilve', target: '極略' },
  { source: '##jilve', target: '極略·鬼才' },
  { source: '###jilve', target: '極略·集智' },
  { source: '####jilve', target: '極略·放逐' },
  { source: 'jilve-zhiheng', target: '極略·制衡' },
  { source: 'lianpo', target: '連破' },

  { source: 'god_zhaoyun', target: '神趙雲' },
  { source: 'juejing', target: '絕境' },
  { source: 'longhun', target: '龍魂' },
  { source: '#longhun', target: '龍魂' },
  { source: '##longhun', target: '龍魂' },

  { source: 'god_liubei', target: '神劉備' },
  { source: 'longnu', target: '龍怒' },
  { source: 'liu_jieying', target: '結營' },

  { source: 'god_luxun', target: '神陸遜' },
  { source: 'junlve', target: '軍略' },
  { source: 'cuike', target: '摧克' },
  { source: 'zhanhuo', target: '綻火' },

  { source: 'god_zhangliao', target: '神張遼' },
  { source: 'duorui', target: '奪銳' },
  { source: 'duorui target skill: {0}', target: '被奪銳[{0}]' },
  { source: 'duorui skill: {0}', target: '奪銳[{0}]' },
  { source: 'zhiti', target: '止啼' },

  { source: 'god_ganning', target: '神甘寧' },
  { source: 'poxi', target: '魄襲' },
  { source: 'jieying', target: '劫營' },

  { source: 'god_guojia', target: '神郭嘉' },
  { source: 'god_huishi', target: '慧識' },
  { source: 'god_tianyi', target: '天翊' },
  { source: 'god_huishi_sec', target: '輝逝' },
  { source: 'zuoxing', target: '佐幸' },
  { source: 'side_zuoxing_s', target: '佐幸' },

  { source: 'god_taishici', target: '神太史慈' },
  { source: 'dulie', target: '篤烈' },
  { source: 'powei', target: '破圍' },
  { source: 'powei:succeeded', target: '破圍[成功]' },
  { source: 'powei:failed', target: '破圍[失敗]' },
  { source: 'powei', target: '破圍' },
  { source: 'dangmo', target: '蕩魔' },
  { source: 'shenzhuo', target: '神著' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'wushen_description',
    target: '<b>鎖定技</b>，你的紅桃手牌均視爲【殺】；你使用紅桃【殺】無距離和次數限制，無法被響應。',
  },
  {
    source: 'wuhun_description',
    target:
      '<b>鎖定技</b>，當你受到1點傷害後，傷害來源獲得1枚“夢魘”標記；當你死亡時，你令“夢魘”標記數最多的一名其他角色判定，若不爲【桃】或【桃園結義】，該角色死亡。',
  },
  {
    source: 'shelie_description',
    target: '摸牌階段，你可以改爲亮出牌堆頂五張牌，然後獲得其中每種花色的牌各一張。',
  },
  {
    source: 'gongxin_description',
    target:
      '出牌階段限一次，你可以觀看一名其他角色的手牌，然後你可以展示其中一張紅桃牌，選擇一項：1.棄置此牌；2.將此牌置於牌堆頂。',
  },
  {
    source: 'qinyin_description',
    target:
      '<b>鎖定技</b>，棄牌階段結束時，若你於此階段內棄置過不少於兩張手牌，則你令所有角色失去1點體力或回覆1點體力。',
  },
  {
    source: 'yeyan_description',
    target:
      '<b>限定技</b>，出牌階段，你可以選擇一至三名角色，對這些角色造成共計至多3點火焰傷害（若你將對其中一名角色分配不少於2點火焰傷害，你須先棄置四張花色各不相同的手牌並失去3點體力）。',
  },
  {
    source: 'qixing_description',
    target:
      '遊戲開始時，你將牌堆頂七張牌扣置於你的武將牌上，稱爲“星”；摸牌階段結束時，你可以用至少一張手牌交換等量的“星”。',
  },
  {
    source: 'kuangfeng_description',
    target:
      '結束階段開始時，你可以移去一張“星”並選擇一名角色，然後直到你的下個回合開始前，當該角色受到火焰傷害時，此傷害+1。',
  },
  {
    source: 'dawu_description',
    target:
      '結束階段開始時，你可以移去至少一張“星”並選擇等量角色，然後直到你的下個回合開始前，當這些角色受到非雷電傷害時，防止此傷害。',
  },
  {
    source: 'guixin_description',
    target: '當你受到1點傷害後，你可以隨機獲得每名其他角色區域裏的一張牌，然後你翻面。',
  },
  {
    source: 'feiying_description',
    target: '<b>鎖定技</b>，其他角色計算與你的距離+1。',
  },
  {
    source: 'kuangbao_description',
    target: '<b>鎖定技</b>，遊戲開始時，你獲得2枚“暴怒”標記；當你造成或受到1點傷害後，你獲得1枚“暴怒”標記。',
  },
  {
    source: 'wumou_description',
    target: '<b>鎖定技</b>，當你使用普通錦囊牌時，你失去1點體力或移去一枚“暴怒”標記。',
  },
  {
    source: 'wuqian_description',
    target:
      '出牌階段，你可以移去2枚“暴怒”標記並選擇本回合內你未以此法選擇過的一名其他角色，然後直到回合結束，你擁有“無雙”且該角色的防具失效。',
  },
  {
    source: 'shenfen_description',
    target:
      '出牌階段限一次，你可以移去6枚“暴怒”標記並對所有其他角色造成1點傷害，然後這些角色棄置裝備區裏的所有牌，再棄置四張手牌，最後你翻面。',
  },
  {
    source: 'renjie_description',
    target: '<b>鎖定技</b>，當你受到傷害後，或於棄牌階段內棄置手牌後，你獲得X枚“忍”標記（X爲傷害值或棄置的手牌數）。',
  },
  {
    source: 'baiyin_description',
    target: '<b>覺醒技</b>，準備階段開始時，若你擁有不少於4枚“忍”標記，你減1點體力上限並獲得技能“極略”。',
  },
  {
    source: 'jilve_description',
    target: '你可以移去1枚“忍”標記，發動下列一項技能：“鬼才”、“放逐”、“集智”、“制衡”或“完殺”。',
  },
  {
    source: 'lianpo_description',
    target: '一名角色的回合結束時，若你於此回合內殺死過角色，你可以獲得一個額外的回合。',
  },
  {
    source: 'juejing_description',
    target: '<b>鎖定技</b>，當你進入或脫離瀕死狀態時，你摸一張牌；你的手牌上限+2。',
  },
  {
    source: 'longhun_description',
    target:
      '你可以將一至兩張同花色的牌按如下規則使用或打出：紅桃當【桃】；方塊當火【殺】；梅花當【閃】；黑桃當【無懈可擊】。若你以此法使用或打出的兩張牌爲：紅色，此牌的傷害值或回覆值+1；黑色，你棄置當前回合角色的一張牌。',
  },

  {
    source: 'longnu_description',
    target:
      '<b>轉換技</b>，<b>鎖定技</b>，出牌階段開始時，陽：你失去1點體力並摸一張牌，然後你於此階段內紅色手牌均視爲火【殺】且使用火【殺】無距離限制；陰：你減1點體力上限並摸一張牌，然後你於此階段內手牌中的錦囊牌均視爲雷【殺】且你使用雷【殺】無次數限制。',
  },
  {
    source: 'liu_jieying_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你橫置；當你重置前，你防止之；所有處於“連環狀態”的角色的手牌上限+2；結束階段開始時，你橫置一名角色。',
  },

  {
    source: 'junlve_description',
    target: '<b>鎖定技</b>，當你受到或造成1點傷害後，你獲得一個“軍略”標記。',
  },
  {
    source: 'cuike_description',
    target:
      '出牌階段開始時，若“軍略”數量爲奇數，你可以對一名角色造成1點傷害；若“軍略”數量爲偶數，你可以橫置一名角色並棄置其區域裏的一張牌。若“軍略”數量超過7個，你可以移去全部“軍略”標記並對所有其他角色造成1點傷害。',
  },
  {
    source: 'zhanhuo_description',
    target:
      '<b>限定技</b>，出牌階段，你可以移去全部“軍略”標記，令至多等量的已橫置角色棄置所有裝備區裏的牌，然後對其中一名角色造成1點火焰傷害。',
  },

  {
    source: 'duorui_description',
    target:
      '當你於出牌階段對其他角色造成傷害後，你可以廢除一個裝備欄，然後選擇其武將牌上的一項技能（限定技、覺醒技和主公技除外），令其於其下回合結束之前此技能無效，且你於其下回合結束或其死亡之前擁有此技能且不能發動“奪銳”。',
  },
  {
    source: 'zhiti_description',
    target:
      '<b>鎖定技</b>，你攻擊範圍內已受傷的角色的手牌上限-1；當你使用【決鬥】對你攻擊範圍內已受傷的角色造成傷害後，你與這些角色拼點贏後，或你受到這些角色造成的傷害後，你恢復一個裝備欄。',
  },

  {
    source: 'poxi_description',
    target:
      '出牌階段限一次，你可以觀看一名其他角色的手牌，然後你可以棄置你與其共計四張花色各不相同的手牌。若你以此法棄置你的牌數爲：0，你減1點體力上限；1，你結束此階段且本回合手牌上限-1；3，你回覆1點體力；4，你摸四張牌。',
  },
  {
    source: 'jieying_description',
    target:
      '回合開始時，若場上沒有“營”，你獲得一枚“營”標記；結束階段開始時，你可以將“營”移至其他角色；你令有“營”的角色於其摸牌階段多摸一張牌、使用【殺】的次數上限+1、手牌上限+1；有“營”的其他角色的結束階段開始時，你移去其“營”，然後獲得其所有手牌。',
  },

  {
    source: 'god_huishi_description',
    target:
      '出牌階段限一次，若你的體力上限小於10，你可以判定，若結果與你此次“慧識”中的其它判定結果花色均不同，且你體力上限小於10，你可以加1點體力上限並重復此流程。最後你將所有仍在棄牌堆中的判定牌交給一名角色，若其手牌數爲全場最多，你減1點體力上限。',
  },
  {
    source: 'god_tianyi_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若所有存活角色均在本局遊戲內受到過傷害，你加2點體力上限並回復1點體力，令一名角色獲得技能“佐幸”。',
  },
  {
    source: 'god_huishi_sec_description',
    target:
      '<b>限定技</b>，出牌階段，你可以選擇一名角色，若其有未發動過的覺醒技，且你的體力上限不小於存活角色數，你選擇其一項覺醒技，令此技能於其觸發時機無視其條件發動；否則其摸四張牌。最後你減2點體力上限。',
  },
  {
    source: 'zuoxing_description',
    target:
      '準備階段開始時，若場上有體力上限大於1的神郭嘉存活，你可以令其中一名減1點體力上限，然後你於本回合的出牌階段限一次，你可以視爲使用任意一張普通錦囊牌。',
  },

  {
    source: 'dulie_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你令X名其他角色各獲得一枚“圍”標記（X爲角色數的一半，向下取整）；你對沒有“圍”的角色使用【殺】無距離限制；當你成爲沒有“圍”的角色使用【殺】的目標時，你判定，若爲紅色，取消之。',
  },
  {
    source: 'powei_description',
    target:
      '<b>使命技</b>，當你使用【殺】對有“圍”的角色造成傷害時，移去其一枚“圍”標記，並防止此傷害。<br><b>成功</b>：當你使用【殺】結算結束後，若場上沒有“圍”，你獲得技能“神著”。<br><b>失敗</b>：當你進入瀕死狀態時，若你的體力小於1，你棄置裝備區裏的所有牌，回覆體力至1點。',
  },
  {
    source: 'dangmo_description',
    target:
      '當你於出牌階段內首次使用【殺】聲明指定目標後，你可以爲此【殺】額外選擇一至X名目標（X爲你的體力值-1）。',
  },
  {
    source: 'shenzhuo_description',
    target:
      '<b>鎖定技</b>，你使用【殺】無次數限制；當你使用非轉化和非虛擬的【殺】結算結束後，你摸一張牌。',
  },
];

export const skillAudios: Word[] = [
  {
    source: '$wushen:1',
    target: '取汝狗頭，猶如探囊取物！',
  },
  {
    source: '$wushen:2',
    target: '還不速速領死！',
  },
  {
    source: '$wuhun:1',
    target: '拿命來！',
  },
  {
    source: '$wuhun:2',
    target: '誰來與我同去？',
  },

  {
    source: '$gongxin:1',
    target: '攻城爲下，攻心爲上。',
  },
  {
    source: '$gongxin:2',
    target: '我替施主把把脈。',
  },
  {
    source: '$shelie:1',
    target: '什麼都略懂一點，生活更多彩一些。',
  },
  {
    source: '$shelie:2',
    target: '略懂，略懂。',
  },

  {
    source: '$qinyin:1',
    target: '（柔和的琴聲）',
  },
  {
    source: '$qinyin:2',
    target: '（急促的琴聲）',
  },
  {
    source: '$yeyan:1',
    target: '（燃燒聲）讓這熊熊業火，焚盡你的罪惡！',
  },
  {
    source: '$yeyan:2',
    target: '（燃燒聲）聆聽吧，這獻給你的鎮魂曲！',
  },

  {
    source: '$qixing:1',
    target: '祈星辰之力，佑我蜀漢！',
  },
  {
    source: '$qixing:2',
    target: '伏望天恩，誓討漢賊！',
  },
  {
    source: '$kuangfeng:1',
    target: '風~~~起~~~！',
  },
  {
    source: '$kuangfeng:2',
    target: '萬事俱備，只欠業火。',
  },
  {
    source: '$dawu:1',
    target: '此計，可保你一時平安。',
  },
  {
    source: '$dawu:2',
    target: '此非萬全之策，惟懼天雷。',
  },

  {
    source: '$guixin:1',
    target: '山不厭高，海不厭深。',
  },
  {
    source: '$guixin:2',
    target: '周公吐哺，天下歸心。',
  },

  {
    source: '$kuangbao:1',
    target: '哼！',
  },
  {
    source: '$kuangbao:2',
    target: '嗯~~~~',
  },
  {
    source: '$wumou:1',
    target: '不管這些了！',
  },
  {
    source: '$wumou:2',
    target: '哪個說我有勇無謀？',
  },
  {
    source: '$wuqian:1',
    target: '天王老子也保不住你！',
  },
  {
    source: '$wuqian:2',
    target: '看我神威！無堅不摧！',
  },
  {
    source: '$shenfen:1',
    target: '這，纔是活生生的地獄！',
  },
  {
    source: '$shenfen:2',
    target: '凡人們，顫抖吧！這是神之怒火！',
  },
  
  {
    source: '$renjie:1',
    target: '忍一時，風平浪靜。',
  },
  {
    source: '$renjie:2',
    target: '退一步，海闊天空。',
  },
  {
    source: '$baiyin:1',
    target: '老驥伏櫪，志在千里。',
  },
  {
    source: '$baiyin:2',
    target: '烈士暮年，壯心不已。',
  },
  {
    source: '$lianpo:1',
    target: '一鼓作氣，破敵制勝！',
  },
  {
    source: '$lianpo:2',
    target: '受命於天，既壽永昌！',
  },

  {
    source: '$juejing:1',
    target: '置於死地，方能後生！',
  },
  {
    source: '$juejing:2',
    target: '背水一戰，不勝便死！',
  },
  {
    source: '$longhun:1',
    target: '常山趙子龍在此！',
  },
  {
    source: '$longhun:2',
    target: '能屈能伸，纔是大丈夫！',
  },

  {
    source: '$longnu:1',
    target: '龍意怒火，汝皆不能逃脫！',
  },
  {
    source: '$longnu:2',
    target: '龍怒降臨，豈是爾等凡人可抗！',
  },
  {
    source: '$liu_jieying:1',
    target: '結草銜環，報兄弟大恩！',
  },
  {
    source: '$liu_jieying:2',
    target: '桃園結義，營一世之交！',
  },

  {
    source: '$junlve:1',
    target: '軍略綿腹，制敵千里。',
  },
  {
    source: '$junlve:2',
    target: '文韜武略兼備，方可破敵如破竹。',
  },
  {
    source: '$cuike:1',
    target: '克險摧難，軍略當先。',
  },
  {
    source: '$cuike:2',
    target: '摧敵心神，克敵計謀。',
  },
  {
    source: '$zhanhuo:1',
    target: '業火映東水，吳志綻敵營。',
  },
  {
    source: '$zhanhuo:2',
    target: '綻東吳業火，燒敵軍數千。',
  },

  {
    source: '$duorui:1',
    target: '奪敵軍銳氣，殺敵方士氣！',
  },
  {
    source: '$duorui:2',
    target: '尖銳之勢，吾亦可一人奪之。',
  },
  {
    source: '$zhiti:1',
    target: '江東小兒，安敢啼哭？',
  },
  {
    source: '$zhiti:2',
    target: '娃聞名止啼，孫損十萬休！',
  },

  {
    source: '$poxi:1',
    target: '夜襲敵軍，挫其銳氣！',
  },
  {
    source: '$poxi:2',
    target: '受主知遇，襲敵不懼。',
  },
  {
    source: '$jieying:1',
    target: '裹甲銜枚，劫營如入無人之境！',
  },
  {
    source: '$jieying:2',
    target: '劫營速戰，措手不及！',
  },

  {
    source: '$god_huishi:1',
    target: '聰以知遠，明以察微。',
  },
  {
    source: '$god_huishi:2',
    target: '見微知著，識人心志。',
  },
  {
    source: '$god_tianyi:1',
    target: '天命靡常，惟德是輔。',
  },
  {
    source: '$god_tianyi:2',
    target: '可成吾志者，必此人也。',
  },
  {
    source: '$god_huishi_sec:1',
    target: '喪家之犬，主公實不足慮也。',
  },
  {
    source: '$god_huishi_sec:2',
    target: '時勢兼備，主公復有何憂？',
  },
  {
    source: '$zuoxing:1',
    target: '以聰慮難，悉諮於上。',
  },
  {
    source: '$zuoxing:2',
    target: '奉孝不才，願獻勤心。',
  },

  {
    source: '$dulie:1',
    target: '素來言出必踐，成吾信義昭彰。',
  },
  {
    source: '$dulie:2',
    target: '小信如若不成，大信將以何立？',
  },
  {
    source: '$powei:1',
    target: '弓馬齊射灑熱血，突破重圍顯英豪！',
  },
  {
    source: '$powei:2',
    target: '敵軍尚有嚴防，有待明日再看！',
  },
  {
    source: '$dangmo:1',
    target: '魔高一尺，道高一丈！',
  },
  {
    source: '$dangmo:2',
    target: '天魔禍世，吾自蕩而除之！',
  },
  {
    source: '$shenzhuo:1',
    target: '力引強弓百斤，矢出貫手着棼！',
  },
  {
    source: '$shenzhuo:2',
    target: '箭既已在弦上，吾又豈能不發！',
  },
];

export const conversations: Word[] = [
  { source: 'qixing: please select cards to save', target: '七星：請選擇需要保留為手牌的牌' },

  { source: 'liu_jieying: please choose a target to chain on', target: '結營：請選擇一名角色橫置' },

  {
    source: '{0}: please choose a skill to nullify and you obtain it until the end of target’s turn',
    target: '{0}：請選擇一項技能，直到其下回合結束，其此技能失效，且你擁有此技能',
  },

  {
    source: '{0}: please choose and resume an equip section',
    target: '{0}：請選擇一個裝備欄恢復',
  },

  {
    source: '{0}: do you want to gain a max hp and judge again?',
    target: '{0}：你可以加1點體力上限並判定',
  },
  {
    source: '{0}: please choose a target to gain these cards',
    target: '{0}：請將這些牌交給一名角色',
  },

  {
    source: 'god_tianyi:please choose a target to obtain ‘Zuo Xing’',
    target: '天翊：請選擇一名角色獲得技能“佐幸”',
  },

  {
    source: '{0}: please choose god_huishi_sec options: {1}',
    target: '請選擇 {1} 的以下一項覺醒技',
  },

  {
    source: '{0}: do you want to let God Guo Jia loses 1 max hp? Then you can use virtual trick this turn',
    target: '{0}：你可以令“神郭嘉”減1點體力上限，然後你於本回合的出牌階段限一次，可視為使用任意普通錦囊牌',
  },
  {
    source: 'zuoxing: please choose a God Guo Jia to lose 1 max hp',
    target: '佐幸：請選擇一名“神郭嘉”減1點體力上限',
  },

  {
    source: '{0}: please choose {1} targets to gain ‘Wei’ mark',
    target: '{0}：請選擇 {1} 名其他角色獲得“圍”標記',
  },

  {
    source: '{0}: do you want to add at least {1} targets for {2} ?',
    target: '{0}：你可以為 {2} 增加至多 {1} 名目標',
  },
];
