import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2014', target: '將4' },

  { source: 'caozhen', target: '曹真' },
  { source: 'sidi', target: '司敵' },

  { source: 'hanhaoshihuan', target: '韓浩史渙' },
  { source: 'shenduan', target: '慎斷' },
  { source: 'yonglve', target: '勇略' },

  { source: 'chenqun', target: '陳群' },
  { source: 'pindi', target: '品第' },
  { source: 'faen', target: '法恩' },

  { source: 'wuyi', target: '吳懿' },
  { source: 'benxi', target: '奔襲' },

  { source: 'zhoucang', target: '周倉' },
  { source: 'zhongyong', target: '忠勇' },

  { source: 'zhangsong', target: '張松' },
  { source: 'qiangzhi', target: '強識' },
  { source: 'xiantu', target: '獻圖' },

  { source: 'sunluban', target: '孫魯班' },
  { source: 'zenhui', target: '譖毀' },
  { source: 'jiaojin', target: '驕矜' },

  { source: 'zhuhuan', target: '朱桓' },
  { source: 'fenli', target: '奮勵' },
  { source: 'pingkou', target: '平寇' },

  { source: 'guyong', target: '顧庸' },
  { source: 'shenxing', target: '慎行' },
  { source: 'bingyi', target: '秉壹' },

  { source: 'yjcm_jushou', target: '沮授' },
  { source: 'jianying', target: '漸營' },
  { source: 'shibei', target: '矢北' },

  { source: 'caifuren', target: '蔡夫人' },
  { source: 'qieting', target: '竊聽' },
  { source: 'xianzhou', target: '獻州' },

  { source: 'xushao', target: '許劭' },
  { source: 'pingjian', target: '評薦' },

  { source: 'qinzheng', target: '勤政' },
  { source: 'qinzheng times: {0}', target: '勤政[{0}]' },

  { source: 'zhi_shanxi', target: '善檄' },
  { source: 'zhi_shanxi:xi', target: '檄' },

  { source: 'fuji', target: '伏騎' },
  { source: 'jiaozi', target: '驕恣' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'sidi_description',
    target:
      '其他角色的出牌階段開始時，你可以棄置與你的裝備區裡的其中一張牌顏色相同的一張非基本牌，然後該角色於此回合內不能使用或打出與此牌顏色相同的牌。此階段結束時，若其於此階段內沒有使用過【殺】，視為你對其使用一張【殺】。',
  },

  {
    source: 'shenduan_description',
    target: '當你因棄置而失去一張黑色非錦囊牌後，你可以將此牌當【兵糧寸斷】使用（無距離限制）。',
  },
  {
    source: 'yonglve_description',
    target:
      '其他角色的判定階段開始時，你可以棄置其判定區裡的一張牌，然後若該角色：在你的攻擊範圍內，你摸一張牌；不在你的攻擊範圍內，你視為對其使用一張【殺】。',
  },

  {
    source: 'pindi_description',
    target:
      '出牌階段，你可以棄置一張本回合內你未以此法棄置過的類別的牌，並選擇本回合內你未以此法選擇過的一名其他角色，你選擇一項：1.令其棄置X張牌；2.令其摸X張牌（X為你本回合發動過此技能的次數）。然後若其已受傷，你橫置。',
  },
  { source: 'faen_description', target: '當一名角色的武將牌翻至正面或橫置後，你可以令其摸一張牌。' },

  {
    source: 'benxi_description',
    target:
      '<b>鎖定技</b>，當你於回合內使用牌時，本回合你計算與其他角色的距離-1；你的回合內，若你與所有其他角色的距離均為1，則當你使用【殺】或普通錦囊牌指定唯一目標時，選擇一至兩項：1.此牌目標+1；2.此牌無視防具；3.此牌不能被抵消；4.此牌造成傷害時，你摸一張牌。',
  },

  {
    source: 'zhongyong_description',
    target:
      '當你使用的【殺】結算結束後，你可以將此【殺】或此次結算中響應過此【殺】的【閃】交給除此【殺】目標外的一名其他角色，若其以此法獲得了紅色牌，其可對你攻擊範圍內的一名角色使用一張【殺】（無距離限制）。',
  },
  {
    source: 'qiangzhi_description',
    target:
      '出牌階段開始時，你可以展示一名其他角色的一張手牌，然後當你於此階段使用一張與展示牌類別相同的牌時，你可以摸一張牌。',
  },
  {
    source: 'xiantu_description',
    target:
      '其他角色的出牌階段開始時，你可以摸兩張牌，然後交給其兩張牌。若如此做，此階段結束時，若其於此階段內未殺死過角色，你失去1點體力。',
  },

  {
    source: 'zenhui_description',
    target:
      '當你於出牌階段內使用【殺】或黑色普通錦囊牌指定唯一目標時，你可以令不為此牌目標且可成為此牌目標的一名其他角色選擇一項：1.交給你一張牌，成為此牌的使用者；2.成為此牌的目標，此技能於本回合內失效。',
  },
  {
    source: 'jiaojin_description',
    target: '當你成為男性角色使用【殺】或普通錦囊牌的目標後，你可以棄置一張裝備牌，然後該牌對你無效且你獲得此牌。',
  },
  {
    source: 'fenli_description',
    target:
      '若你的手牌數為全場最多，你可以跳過摸牌階段；若你的體力值為全場最多，你可以跳過出牌階段；若你的裝備區裡有牌且牌數為全場最多，你可以跳過棄牌階段。',
  },
  {
    source: 'pingkou_description',
    target: '回合結束時，你可以對一至X名其他角色各造成1點傷害（X為你本回合內跳過的階段數）。',
  },

  { source: 'shenxing_description', target: '出牌階段，你可以棄置兩張牌，然後摸一張牌。' },
  {
    source: 'bingyi_description',
    target: '結束階段開始時，你可以展示所有手牌，若顏色均相同，你令一至X名角色各摸一張牌（X為你的手牌數）。',
  },
  {
    source: 'jianying_description',
    target: '當你於出牌階段內使用牌時，若此牌與你此階段內使用過的上一張牌的花色或點數相同，你可以摸一張牌。',
  },
  {
    source: 'shibei_description',
    target: '<b>鎖定技</b>，當你受到傷害後，若此傷害為你於此回合內第一次受到的傷害，你回覆1點體力，否則你失去1點體力。',
  },

  {
    source: 'qieting_description',
    target:
      '其他角色的回合結束時，若其此回合內未使用牌指定過除其外的角色為目標，你可以選擇一項：1.將其裝備區裡的一張牌置入你的裝備區；2.摸一張牌。',
  },
  {
    source: 'xianzhou_description',
    target:
      '<b>限定技</b>，出牌階段，你可以將裝備區裡的所有牌交給一名其他角色，然後其選擇一項：1.令你回覆X點體力；2.選擇其攻擊範圍內一至X名角色，其對這些角色各造成1點傷害（X為你以此法給出的牌數）。',
  },

  {
    source: 'zhi_shanxi_description',
    target:
      '出牌階段開始時，你可以選擇一名沒有“檄”的其他角色，移去場上所有“檄”，然後該角色獲得一枚“檄”標記；當有“檄”的角色回覆體力後，若其未處於瀕死狀態，其選擇一項：1.將兩張牌交給你；2.失去1點體力。',
  },

  {
    source: 'fuji_description',
    target: '鎖定技，距離至你為1的角色不能響應你使用的牌。',
  },
  {
    source: 'jiaozi_description',
    target: '鎖定技，當你造成或受到傷害時，若你的手牌數為全場唯一最多，此傷害+1。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'please choose less than {0} player to draw 1 crad.',
    target: '請選擇至多{0}名角色各摸一張牌。',
  },
];
