import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'pve_boss', target: '龍神' },
  { source: 'pve_huashen', target: '化神' },
  { source: 'pve_chaofeng', target: '嘲風' },
  { source: 'pve_longlin', target: '龍鱗' },
  { source: 'pve_suanni', target: '狻猊' },
  { source: 'pve_ruiyan', target: '瑞煙' },
  { source: 'pve_bian', target: '狴犴' },
  { source: 'pve_suwei', target: '肅威' },
  { source: 'pve_bixi', target: '贔屓' },
  { source: 'pve_lingxi', target: '靈屓' },
  { source: 'pve_fuxi', target: '負屓' },
  { source: 'pve_longshi', target: '龍識' },
  { source: 'pve_yazi', target: '睚眥' },
  { source: 'pve_longlie', target: '龍烈' },
  { source: '#pve_longlie', target: '龍烈' },
  { source: 'pve_qinlv', target: '琴律' },
  { source: 'pve_jienu', target: '介怒' },
  { source: 'pve_longhou', target: '龍吼' },
  { source: 'pve_chaiyue', target: '豺月' },
  { source: 'pve_lige', target: '離歌' },
  { source: 'pve_bibao', target: '必報' },
  { source: 'pve_tansuo', target: '探索' },
  { source: 'pve_beifa', target: '北伐' },
  { source: 'pve_beifa times: {0}', target: '北[{0}]' },
  { source: 'pve_buxu', target: '不許' },
  { source: 'pve_buxu times: {0}', target: '不[{0}]' },
  { source: 'pve_dudu', target: '都督' },
  { source: 'pve_dudu times: {0}', target: '都[{0}]' },
  { source: 'pve_feihua', target: '廢話' },
  { source: 'pve_feihua times: {0}', target: '廢[{0}]' },
  { source: 'pve_chengxiang', target: '丞相' },
  { source: 'pve_chengxiang times: {0}', target: '丞[{0}]' },
  { source: 'pve_zhibing', target: '知兵' },
  { source: 'pve_zhibing times: {0}', target: '知[{0}]' },
  { source: 'pve_pyjiaoyi', target: '交易' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你獲得6枚“化神”標記。遊戲開始時，你移去一枚“化神”標記，進入下一形態。當你進入瀕死狀態時，你棄置手牌區及裝備區所有牌，移去一枚“化神”標記，進入下一形態；若如此做，其它所有角色依次回覆1點體力，摸两張牌，選擇一張牌名強化並從四名武將中選擇一個，獲得其一個技能。',
  },
  {
    source: 'pve_longlin_description',
    target:
      '<b>鎖定技</b>，準備階段開始時，若你的裝備區：沒有武器，你摸两張牌，沒有防具，你摸两張牌，沒有寶具，你摸两張牌；摸牌階段開始時，你額外摸裝備區花色數張牌；當你使用裝備牌時，若你已受傷，你回覆两點體力並摸一張牌，若你未受傷，你體力上限+1並摸三張牌。',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>鎖定技</b>，準備階段或結束階段開始時，你摸X張牌（X為其它角色數）。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>鎖定技</b>，當你成為一名其它角色使用牌的目標後，你摸一張牌並棄置其一張牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>鎖定技</b>，當你受到傷害後，你摸一張牌並將一張牌置於武將牌上，稱為【碑】；你的手牌上限+X；摸牌階段開始時，你額外摸X張牌（X為碑的數目）。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>鎖定技</b>: 準備階段開始時，你依次棄置其它角色各個區域至多三張牌；若你以此法棄置的卡牌型別之和：為3，你獲得這些牌，為2，你對其造成一點傷害，不大於1，你扣減其一點體力上限。',
  },
  {
    source: 'pve_longlie_description',
    target:
      '<b>鎖定技</b>，你使用【殺】不能被響應；遊戲人數大於2時，此【殺】傷害+1',
  },
  {
    source: 'pve_qinlv_description',
    target:
      '<b>鎖定技</b>，每名角色結束階段開始時，你與其各回復一點體力；若你仍受傷且不是你的回合，其失去X點體力；如此做後，若其未受傷，則你摸X張牌。（X為體力上限一半，向下取整）',
  },
  {
    source: 'pve_longhou_description',
    target: '<b>鎖定技</b>，你使用牌指定目標後，目標角色體力上限+1，然後受到其已損失體力值的傷害。',
  },
  {
    source: 'pve_jienu_description',
    target:
      '<b>鎖定技</b>，當你翻面後，你回復一點體力並對所有其他角色造成兩點火屬性傷害；出牌階段開始時，若你的體力值小於已損失的體力值，你翻面；當你受到傷害後，你翻面。（每受到一种屬性傷害後削弱此技能直到受到普通傷害或單屬性傷害超過四次）',
  },
  {
    source: 'pve_chaiyue_description',
    target:
      '<b>鎖定技</b>，你每受到1點普通傷害後，你摸兩張牌並將一張牌置於武將牌上，稱為【碑】；摸牌階段開始時，你摸X張牌；你的【殺】次數+X（X為【碑】數）',
  },
  {
    source: 'pve_lige_description',
    target:
      '<b>鎖定技</b>，一名其他角色結束階段開始時，其交給你一張牌或令你摸兩張牌，選擇後視為對其使用【決鬥】',
  },
  {
    source: 'pve_bibao_description',
    target:
      '<b>鎖定技</b>，你造成或受到傷害時，你回復1點體力且此傷害+1，你摸等同傷害+1張牌。',
  },
  {
    source: 'pve_tansuo_description',
    target:
      '<b>鎖定技</b>，第四關及之後，玩家使用牌有概率觸發機關或奇遇寶物。玩家共用強化池',
  },
  {
    source: 'pve_beifa_description',
    target:
      '<b>鎖定技</b>，你失去最後一張牌時，令一名角色失去X點體力。（X爲此技能等級）',
  },
  {
    source: 'pve_buxu_description',
    target:
      '<b>鎖定技</b>，BOSS回合內其使用牌次數≤此技能等級，則無效。',
  },
  {
    source: 'pve_dudu_description',
    target:
      '出牌階段限一次，你摸1張牌。（升級多摸兩張）',
  },
  {
    source: 'pve_feihua_description',
    target:
      '<b>鎖定技</b>，你使用牌點數-X。（X爲此技能等級）',
  },
  {
    source: 'pve_chengxiang_description',
    target:
      '<b>鎖定技</b>，出牌階段結束時，你隨機回複1-3點體力。（升級提升1點回複。）',
  },
  {
    source: 'pve_zhibing_description',
    target:
      '出牌階段限一次，對一名角色造成隨機1-3點傷害。（升級提升1點傷害上限）',
  },
  {
    source: 'pve_pyjiaoyi_description',
    target:
      '限一次,通關後次數+1，出牌階段，你可以和BOSS進行一次交易，犧牲一些代價獲得寶物或者升級寶物。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '請選擇一個武將並獲得其一個技能',
  },
  {
    source: 'pve_huashen: please make a card1',
    target: '請選擇一張牌名，使用此牌名時，摸一張牌',
  },
  {
    source: 'pve_huashen: please make a card2',
    target: '請選擇一張牌名，使用此牌名時，令一名角色失去1點體力',
  },
  {
    source: 'pve_huashen: please make a card3',
    target: '請選擇一張牌名，使用此牌名時，對一名角色造成隨機1-3點傷害',
  },
  {
    source: 'pve_huashen: please make a card4',
    target: '請選擇一張牌名，使用此牌名時，你隨機回復至多3點體力',
  },
  {
    source: 'pve_huashen: please announce a boss',
    target: '請選擇難度',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal1',
    target: '交給BOSS，你一半體力上限。',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal2',
    target: '交給BOSS，全部手牌（至少1張）。',
  },
  {
    source: 'pve_huashen:choose a role losehp 1',
    target: '選擇一名角色，令其失去1點體力',
  },
  {
    source: 'pve_huashen:choose a role damage',
    target: '選擇一名角色，對其造成傷害',
  },
];
export const eventDictionary: Word[] = [
  { source: 'pve-easy-mode', target: '低難度' },
  { source: 'pve-hard-mode', target: '高難度' },
  { source: '{0} ouyujiguan', target: '{0} 偶遇了機關' },
  { source: '{0} qiyubaowu', target: '{0} 奇遇寶物' },
]
