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

  { source: 'god_lvbu', target: '神呂佈' },
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
  { source: 'jilve-zhiheng', target: '極略·製衡' },
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

  { source: 'god_ganning', target: '神甘甯' },
  { source: 'poxi', target: '魄襲' },
  { source: 'jieying', target: '劫營' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'wushen_description',
    target: '<b>鎖定技</b>，你的紅桃手牌均視為【殺】；你使用紅桃【殺】無距離和次數限製，無法被響應。',
  },
  {
    source: 'wuhun_description',
    target:
      '<b>鎖定技</b>，當你受到1點傷害後，傷害來源獲得1枚“夢魘”標記；當你死亡時，你令“夢魘”標記數最多的一名其他角色判定，若不為【桃】或【桃園結義】，該角色死亡。',
  },
  {
    source: 'shelie_description',
    target: '摸牌階段，你可以改為亮出牌堆頂五張牌，然後獲得其中每種花色的牌各一張。',
  },
  {
    source: 'gongxin_description',
    target:
      '出牌階段限一次，你可以觀看一名其他角色的手牌，然後你可以展示其中一張紅桃牌，選擇一項：1.棄置此牌；2.將此牌置於牌堆頂。',
  },
  {
    source: 'qinyin_description',
    target:
      '<b>鎖定技</b>，棄牌階段結束時，若你於此階段內棄置過不少於兩張手牌，則你令所有角色失去1點體力或回複1點體力。',
  },
  {
    source: 'yeyan_description',
    target:
      '<b>限定技</b>，出牌階段，你可以選擇一至三名角色，對這些角色造成共計至多3點火焰傷害（若你將對其中一名角色分配不少於2點火焰傷害，你須先棄置四張花色各不相同的手牌並失去3點體力）。',
  },
  {
    source: 'qixing_description',
    target:
      '遊戲開始時，你將牌堆頂七張牌扣置於你的武將牌上，稱為“星”；摸牌階段結束時，你可以用至少一張手牌交換等量的“星”。',
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
    target: '當你受到1點傷害後，你可以隨機獲得每名其他角色區域裏的一張牌，然後你翻麵。',
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
      '出牌階段限一次，你可以移去6枚“暴怒”標記並對所有其他角色造成1點傷害，然後這些角色棄置裝備區裏的所有牌，再棄置四張手牌，最後你翻麵。',
  },
  {
    source: 'renjie_description',
    target: '<b>鎖定技</b>，當你受到傷害後，或於棄牌階段內棄置手牌後，你獲得X枚“忍”標記（X為傷害值或棄置的手牌數）。',
  },
  {
    source: 'baiyin_description',
    target: '<b>覺醒技</b>，準備階段開始時，若你擁有不少於4枚“忍”標記，你減1點體力上限並獲得技能“極略”。',
  },
  {
    source: 'jilve_description',
    target: '你可以移去1枚“忍”標記，發動下列一項技能：“鬼才”、“放逐”、“集智”、“製衡”或“完殺”。',
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
      '你可以將一至兩張同花色的牌按如下規則使用或打出：紅桃當【桃】；方塊當火【殺】；梅花當【閃】；黑桃當【無懈可擊】。若你以此法使用或打出的兩張牌為：紅色，此牌的傷害值或回複值+1；黑色，你棄置當前回合角色的一張牌。',
  },

  {
    source: 'longnu_description',
    target:
      '<b>轉換技</b>，<b>鎖定技</b>，出牌階段開始時，陽：你失去1點體力並摸一張牌，然後你於此階段內紅色手牌均視為火【殺】且使用火【殺】無距離限制；陰：你減1點體力上限並摸一張牌，然後你於此階段內手牌中的錦囊牌均視為雷【殺】且你使用雷【殺】無次數限制。',
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
      '出牌階段開始時，若“軍略”數量為奇數，你可以對一名角色造成1點傷害；若“軍略”數量為偶數，你可以橫置一名角色並棄置其區域裏的一張牌。若“軍略”數量超過7個，你可以移去全部“軍略”標記並對所有其他角色造成1點傷害。',
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
      '出牌階段限一次，你可以觀看一名其他角色的手牌，然後你可以棄置你與其共計四張花色各不相同的手牌。若你以此法棄置你的牌數為：0，你減1點體力上限；1，你結束此階段且本回合手牌上限-1；3，你回複1點體力；4，你摸四張牌。',
  },
  {
    source: 'jieying_description',
    target:
      '回合開始時，若場上冇有“營”，你獲得一枚“營”標記；結束階段開始時，你可以將“營”移至其他角色；你令有“營”的角色於其摸牌階段多摸一張牌、使用【殺】的次數上限+1、手牌上限+1；有“營”的其他角色的結束階段開始時，你移去其“營”，然後獲得其所有手牌。',
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
];
