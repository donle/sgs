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
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_huashen_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你獲得6枚“化神”標記。遊戲開始時，你移去一枚“化神”標記，進入下一形態。當你進入瀕死狀態時，你棄置手牌區及裝備區所有牌，移去一枚“化神”標記，進入下一形態；若如此做，其它所有角色依次回覆1點體力，摸一張牌，並從三名武將中選擇一個，獲得其一個技能。',
  },
  {
    source: 'pve_longlin_description',
    target:
      '<b>鎖定技</b>，鎖定技，準備階段開始時，若你的裝備區：沒有武器，你摸一張牌，沒有防具，你摸一張牌，沒有寶具，你摸一張牌；摸牌階段開始時，你額外摸裝備區花色數張牌；當你使用裝備牌時，若你已受傷，你回覆一點體力並摸一張牌，若你未受傷，你摸三張牌。',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>鎖定技</b>，準備階段或結束階段開始時，你摸X張牌（X為其它角色數）。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>鎖定技</b>，當你成為一名其它角色使用牌的目標後，你抽一張牌並棄置其一張牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>鎖定技</b>，當你受到傷害後，你摸一張牌並將一張牌置於武將牌上，稱為【碑】；你的手牌上限+X；摸牌階段開始時，你額外摸X張牌（X為碑的數目）。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>鎖定技</b>，鎖定技: 準備階段開始時，你依次棄置其它角色各個區域至多三張牌；若你以此法棄置的卡牌型別之和：為3，你獲得這些牌，為2，你對其造成一點傷害，不大於1，你扣減其一點體力上限。',
  },
  {
    source: 'pve_longlie_description',
    target:
      '<b>鎖定技</b>，當使用的【殺】指定目標後，你令此【殺】不能被【閃】響應；其它角色回合結束時，視為你對其使用一張【火殺】。',
  },
  {
    source: 'pve_qinlv_description',
    target:
      '<b>鎖定技</b>，每名角色結束階段開始時，你與其各回復一點體力；若你仍受傷且不是你的回合，其失去X點體力；如此做後，若其未受傷，則你摸1張牌。（X為體力上限一半，向下取整）',
  },
  {
    source: 'pve_longhou_description',
    target: '<b>鎖定技</b>，你使用牌指定目標後，目標角色體力上限+1，然後受到其已損失體力值的傷害。',
  },
  {
    source: 'pve_jienu_description',
    target:
      '<b>鎖定技</b>，當你翻面後，若你正面朝上，你回覆一點體力，否則對所有其他角色造成一點火屬性傷害；出牌階段開始時，若你的體力值小於已損失的體力值，你翻面；當你受到傷害後，你翻面。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: 'pve_huashen: please announce a skill to obtain',
    target: '請選擇一個武將並獲得其一個技能',
  },
];
