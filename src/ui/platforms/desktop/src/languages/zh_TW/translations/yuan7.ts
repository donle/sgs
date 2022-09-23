import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yuan7', target: '原7' },

  { source: 'jikang', target: '嵇康' },
  { source: 'qingxian', target: '清弦' },
  { source: 'juexiang', target: '絕響' },
  { source: 'jixian', target: '激弦' },
  { source: 'liexian', target: '烈弦' },
  { source: 'hexian', target: '和絃' },
  { source: 'rouxian', target: '柔弦' },

  { source: 'xushi', target: '徐氏' },
  { source: 'wengua', target: '問卦' },
  { source: '~side_wengua_s', target: '問卦' },
  { source: 'fuzhu', target: '伏誅' },

  { source: 'xuezong', target: '薛綜' },
  { source: 'funan', target: '復難' },
  { source: 'funan_EX', target: '復難' },
  { source: 'jiexun', target: '誡訓' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'qingxian_description',
    target:
      '當你受到傷害/回覆體力後，若場上沒有角色處於瀕死狀態，你可以選擇以下一項令傷害來源/一名其他角色執行：1.失去1點體力，隨機使用牌堆裡的一張裝備牌；2.回覆1點體力，隨機棄置其一張裝備牌。若其以此法使用或棄置的牌為梅花牌，你摸一張牌。',
  },
  {
    source: 'juexiang_description',
    target:
      '當你死亡時，你可以令一名其他角色隨機獲得“清弦殘譜”中的一項技能，且直到其下個回合開始，其不能成為除其外使用梅花牌的目標。',
  },
  {
    source: 'jixian_description',
    target:
      '當你受到傷害後，若場上沒有角色處於瀕死狀態，你可以令傷害來源失去1點體力，然後其隨機使用牌堆裡的一張裝備牌。',
  },
  {
    source: 'liexian_description',
    target:
      '當你回覆體力後，若場上沒有角色處於瀕死狀態，你可以令一名其他角色失去1點體力，然後其隨機使用牌堆裡的一張裝備牌。',
  },
  {
    source: 'rouxian_description',
    target: '當你受到傷害後，若場上沒有角色處於瀕死狀態，你可以令傷害來源回覆1點體力，然後其隨機棄置其一張裝備牌。',
  },
  {
    source: 'hexian_description',
    target: '當你回覆體力後，若場上沒有角色處於瀕死狀態，你可以令一名其他角色回覆1點體力，然後其隨機棄置其一張裝備牌。',
  },

  {
    source: 'wengua_description',
    target:
      '一名角色的出牌階段限一次，若該角色：為你，你可以將一張牌置於牌堆頂或牌堆底，然後你從牌堆的另一端摸一張牌；不為你，其可將一張牌交給你，然後你可將此牌置於牌堆頂或牌堆底，且你與其從牌堆的另一端各摸一張牌。',
  },
  {
    source: 'side_wengua_s_description',
    target:
      '出牌階段限一次，你可以將一張牌交給一名擁有技能“問卦”的其他角色，然後其可將此牌置於牌堆頂或牌堆底，且你與其從牌堆的另一端各摸一張牌。',
  },
  {
    source: 'fuzhu_description',
    target:
      '男性角色的結束階段開始時，若牌堆的牌數不大於你的體力值的十倍，你可以對其使用牌堆中的第一張【殺】，然後若其未死亡或你於此流程中以此法使用【殺】的數量不大於遊戲人數，你重複此流程。最後你洗牌。',
  },

  {
    source: 'funan_description',
    target:
      '當其他角色使用或打出牌響應你使用的牌時，你可以令其獲得你使用的牌（其於本回合內不能使用以此法獲得的牌），然後你獲得其使用或打出的牌。',
  },
  {
    source: 'funan_EX_description',
    target: '當其他角色使用或打出牌響應你使用的牌時，你可以獲得此牌。',
  },
  {
    source: 'jiexun_description',
    target:
      '結束階段開始時，你可以令一名其他角色摸X張牌（X為場上的方塊牌數），然後棄置等同於你發動過本技能次數的牌。若其以此法棄置了所有的牌，你失去本技能，且你的技能“復難”改為無須令其獲得你使用的牌。',
  },
];

export const skillAudios: Word[] = [];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose wengua options: {1}',
    target: '{0}：請選擇將 {1} 置於牌堆頂或牌堆底，然後你從牌堆另一端摸一張牌',
  },
  { source: 'wengua:top', target: '置於牌堆頂' },
  { source: 'wengua:bottom', target: '置於牌堆底' },
  {
    source: '{0}: do you want to use this skill for {1}: {2}',
    target: '{0}：你是否要將 {2} 置於牌堆頂或牌堆底，然後你與 {1} 從牌堆另一端各摸一張牌',
  },
  {
    source: '{0}: please choose wengua options: {1} {2}',
    target: '{0}：請選擇將 {1} 置於牌堆頂或牌堆底，然後你與 {2} 從牌堆另一端摸一張牌',
  },
  {
    source: '{0}: do you want to let {1} lose 1 hp and use a equip card from draw pile?',
    target: '{0}: 令 {1} 失去一點體力並使用一張摸牌堆裡的一張裝備牌',
  },
  {
    source: '{0}: do you want to choose a target to lose 1 hp and use a equip card from draw pile?',
    target: '{0}: 令一名角色失去一點體力並使用一張摸牌堆裡的一張裝備牌',
  },
  {
    source: '{0}: do you want to let {1} recover 1 hp and discard a equip card?',
    target: '{0}: 令 {1} 恢復一點體力並棄置一張裝備牌',
  },
  {
    source: '{0}: do you want to choose a target to recover 1 hp and discard a equip card?',
    target: '{0}: 令一名角色恢復一點體力並棄置一張裝備牌',
  },
];
