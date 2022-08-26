import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'pve_longshen', target: '龍神' },
  { source: 'pve_longshen_zhihuo', target: '止火' },
  { source: 'pve_longshen_qifu', target: '祈福' },
  { source: '~pve_longshen_qifu', target: '祈福' },

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

  { source: 'pve_soldier', target: '風瑤軍' },
  { source: 'pve_qisha', target: '七殺' },
  { source: 'pve_tiantong', target: '天同' },
  { source: 'pve_tianliang', target: '天梁' },
  { source: 'pve_tianji', target: '天機' },
  { source: 'pve_tianxiang', target: '天相' },
  { source: 'pve_lianzhen', target: '廉貞' },

  { source: 'pve_jian', target: '漸' },
  { source: 'pve_zhi', target: '制' },
  { source: 'pve_xi', target: '襲' },
  { source: 'pve_ji', target: '疾' },
  { source: 'pve_yu', target: '御' },
  { source: 'pve_ying', target: '盈' },
  { source: 'pve_gu', target: '孤' },
  { source: 'pve_he', target: '合' },
  { source: 'pve_tanlang', target: '貪狼' },
  { source: 'pve_wenqu', target: '文曲' },
  { source: 'pve_wuqu', target: '武曲' },
  { source: 'pve_pojun', target: '破軍' },

  { source: 'pve_classic_qisha', target: '七殺' },
  { source: 'pve_classic_tiantong', target: '天同' },
  { source: 'pve_classic_tianliang', target: '天梁' },
  { source: 'pve_classic_tianji', target: '天機' },
  { source: 'pve_classic_tianxiang', target: '天相' },
  { source: 'pve_classic_lianzhen', target: '廉貞' },
  { source: 'pve_classic_gu', target: '孤勇' },
  { source: '#pve_classic_gu', target: '孤勇' },
  { source: 'pve_classic_guyong', target: '孤勇' },
  { source: '#pve_classic_guyong', target: '孤勇-天命' },
  { source: '##pve_classic_guyong', target: '孤勇-貪狼' },
  { source: '###pve_classic_guyong', target: '孤勇-文曲' },
  { source: '####pve_classic_guyong', target: '孤勇-武曲' },
  { source: '#####pve_classic_guyong', target: '孤勇-破軍' },
  { source: 'pve_classic_ai', target: '合擊' },
  { source: '#pve_classic_ai', target: '合擊' },
  { source: 'pve_beifa', target: '北伐' },
  { source: 'pve_beifa times: {0}', target: '北[{0}]' },
  { source: 'pve_buxu', target: '不許' },
  { source: 'pve_buxu times: {0}', target: '不[{0}]' },
  { source: 'pve_dudu', target: '都督' },
  { source: 'pve_dudu times: {0}', target: '都[{0}]' },
  { source: 'pve_feihua', target: '飛華' },
  { source: 'pve_feihua times: {0}', target: '廢[{0}]' },
  { source: 'pve_chengxiang', target: '丞相' },
  { source: 'pve_chengxiang times: {0}', target: '丞[{0}]' },
  { source: 'pve_zhibing', target: '知兵' },
  { source: 'pve_zhibing times: {0}', target: '知[{0}]' },
  { source: 'pve_pyjiaoyi', target: '交易' },
  { source: 'pve_tishen', target: '替身' },
  { source: 'pve_zhiheng', target: '再議' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'pve_longshen_zhihuo_description',
    target: '<b>鎖定技</b>，你的回合開始時，若其它角色技能數量超過5個，你隨機獲得其一個技能',
  },
  {
    source: 'pve_longshen_qifu_description',
    target:
      '其它角色出牌階段內，其可以發動此技能並獲得一個技能；若其發動此技能前技能數量已經不小於5個，其需先失去一個技能',
  },
  {
    source: 'pve_huashen_description',
    target:
      '<b>鎖定技</b>，遊戲開始時，你獲得6枚“化神”標記。遊戲開始時，你移去一枚“化神”標記，進入下一形態。當你進入瀕死狀態時，你棄置手牌區及裝備區所有牌，移去一枚“化神”標記，進入下一形態；若如此做，其它所有角色依次回覆1點體力，摸兩張牌，選擇一張牌名強化並從四名武將中選擇一個，獲得其一個技能。',
  },
  {
    source: 'pve_longlin_description',
    target:
      '<b>鎖定技</b>，準備階段開始時，若你的裝備區：沒有武器，你摸兩張牌，沒有防具，你摸兩張牌，沒有寶具，你摸兩張牌；摸牌階段開始時，你額外摸裝備區花色數張牌；當你使用裝備牌時，若你已受傷，你回覆兩點體力並摸一張牌，若你未受傷，你增加一點體力上限並摸三張牌。',
  },
  {
    source: 'pve_ruiyan_description',
    target: '<b>鎖定技</b>，準備階段或結束階段開始時，你摸X張牌（X爲其它角色數）。',
  },
  {
    source: 'pve_suwei_description',
    target: '<b>鎖定技</b>，當你成爲一名其它角色使用牌的目標後，你摸一張牌並棄置其一張牌。',
  },
  {
    source: 'pve_lingxi_description',
    target:
      '<b>鎖定技</b>，當你受到傷害後，你摸一張牌並將一張牌置於武將牌上，稱爲【碑】；你的手牌上限+X；摸牌階段開始時，你額外摸X張牌（X爲碑的數目）。',
  },
  {
    source: 'pve_longshi_description',
    target:
      '<b>鎖定技</b>，鎖定技: 準備階段開始時，你依次棄置其它角色各個區域至多三張牌；若你以此法棄置的卡牌類型之和：爲3，你獲得這些牌，爲2，你對其造成一點傷害，不大於1，你扣減其一點體力上限。',
  },
  {
    source: 'pve_longlie_description',
    target: '<b>鎖定技</b>，你使用的【殺】無法被響應，且遊戲人數大於2時，此【殺】傷害+1。',
  },
  {
    source: 'pve_qinlv_description',
    target:
      '<b>鎖定技</b>，每名角色結束階段開始時，你與其各回復一點體力；若你仍受傷且不是你的回合，其失去X點體力；若其未受傷，則你摸X張牌。（X爲其體力上限一半，向下取整）',
  },
  {
    source: 'pve_longhou_description',
    target: '<b>鎖定技</b>，你使用牌指定目標後，目標角色體力上限+1，然後受到其已損失體力值的傷害。',
  },
  {
    source: 'pve_jienu_description',
    target:
      '<b>鎖定技</b>，當你翻面後，你回覆一點體力並對所有其他角色造成兩點火屬性傷害；出牌階段開始時，若你的體力值小於已損失的體力值，你翻面；當你受到傷害後，你對所有其他角色造成兩點火屬性傷害，若此傷害爲普通傷害，則你回覆兩點體力',
  },
  {
    source: 'pve_chaiyue_description',
    target:
      '<b>鎖定技</b>，你每受到1點普通傷害後，你摸兩張牌並將一張牌置於武將牌上，稱爲【碑】；摸牌階段開始時，你摸X張牌；你的【殺】次數+X（X爲【碑】數）',
  },
  {
    source: 'pve_lige_description',
    target: '<b>鎖定技</b>，一名其他角色結束階段開始時，其交給你一張牌或令你摸兩張牌，選擇後視爲對其使用【決鬥】',
  },
  {
    source: 'pve_bibao_description',
    target: '<b>鎖定技</b>，你造成或受到傷害時，你回覆1點體力且此傷害+1，你摸等同傷害+1張牌。',
  },
  {
    source: 'pve_tansuo_description',
    target:
      '<b>鎖定技</b>，第四關及之後，玩家使用牌有概率觸發機關（此牌點數越高几率越大且隨着每回合使用次數提高）或奇遇寶物。玩家共用強化池',
  },
  {
    source: 'pve_beifa_description',
    target: '<b>鎖定技</b>，你失去最後一張牌時，令一名角色失去X點體力。（X爲此技能等級）',
  },
  {
    source: 'pve_buxu_description',
    target: '<b>鎖定技</b>，BOSS回合內其使用的前X張牌對你無效。（X爲此技能等級）',
  },
  {
    source: 'pve_dudu_description',
    target: '出牌階段限一次，你摸1張牌。（升級多摸兩張）',
  },
  {
    source: 'pve_feihua_description',
    target: '<b>鎖定技</b>，你觸發減少觸發機關概率等級越高提升越大',
  },
  {
    source: 'pve_chengxiang_description',
    target: '<b>鎖定技</b>，出牌階段結束時，你隨機回覆1-3點體力。（升級提升1點回復。）',
  },
  {
    source: 'pve_zhibing_description',
    target: '出牌階段限一次，對一名角色造成隨機1-3點傷害。（升級提升1點傷害上限）',
  },
  {
    source: 'pve_pyjiaoyi_description',
    target: '限一次,通關後次數+1，出牌階段，你可以和BOSS進行一次交易，犧牲一些代價獲得寶物或者升級寶物。',
  },
  {
    source: 'pve_classic_ai_desc',
    target:
      '<b>鎖定技</b> 你或你的隊友擁有如下標記時，執行對應操作：【漸】摸牌階段可以多摸一張牌；【制】手牌上限等於體力值；【襲】出牌階段可以多出一張殺；【疾】初始手牌數量加3；【御】受到傷害後可以摸一張牌；【盈】體力及體力上限加1',
  },
  {
    source: 'pve_classic_gu_desc',
    target:
      '<b>鎖定技</b>你每打出或使用一種花色的牌，若沒有對應的標記，根據這些牌的花色，你獲得對應標記：黑桃牌，獲得“紫微”；梅花牌，獲得“后土”；紅桃牌，獲得“玉清”；方塊牌，獲得“勾陳”。當你摸牌時，消耗一枚標記，額外摸一張牌；當你造成或受到傷害時，消耗兩枚標記，傷害值+1/-1；準備階段開始時，消耗三枚標記，摸一張牌並視爲使用一張殺；結束階段結束時，消耗四枚標記，增加一點體力上限並回復一點體力',
  },
  {
    source: 'pve_classic_guyong_description',
    target:
      '<b>鎖定技</b>，你點亮的標記擁有如下效果：<p>貪狼：其它角色準備階段開始時，若你的手牌數不大於體力上限，你可以摸一張牌</p><p>文曲：你使用順手牽羊、過河拆橋、火攻和決鬥可以額外增加一個目標</p><p>武曲：準備階段結束時，你可以與一名角色拼點，若你嬴，視爲你對其使用一張殺，若你沒贏，視爲其對你使用一張決鬥</p><p>破軍：每回合限一次，當你於回合外成爲錦囊牌的目標後，你可以棄置一張牌；若此牌：爲裝備牌，你對其造成一點傷害；爲錦囊牌，你隨機獲得其一張手牌，爲基本牌，你摸一張牌</p>每當一種花色的判定牌亮出，或當你殺死一名角色時，你點亮一個階段的標記。準備階段開始時，若你已點亮四種標記時，你獲得適應性加強。',
  },
  {
    source: 'pve_classic_qisha_description',
    target: '<b>鎖定技</b>，你的殺、決鬥、火攻、南蠻入侵和萬箭齊發的傷害基數+1',
  },
  {
    source: 'pve_classic_tianji_description',
    target: '其他角色回合結束時，若其本回合沒有造成過傷害，你棄一張牌對其造成一點雷屬性傷害',
  },
  {
    source: 'pve_classic_tianliang_description',
    target: '<b>鎖定技</b>，摸牌時你多摸一張牌（每回合限x次，x爲你的體力上限）',
  },
  {
    source: 'pve_classic_tianxiang_description',
    target:
      '當你受到傷害後，你可以棄置x張牌；你以此法每棄置一張黑色牌，摸兩張牌；若你棄置的所有牌均爲紅色，你對傷害來源造成一點傷害（x爲你已損失的體力值）',
  },
  {
    source: 'pve_classic_tiantong_description',
    target: '<b>限定技</b>準備階段開始時，你的體力值及體力上限加3；',
  },
  {
    source: 'pve_classic_lianzhen_description',
    target: '回合開始時，你可以指定一名角色，該角色每獲得一張牌，你摸一張牌；若此時在你的回合內，你額外摸一張牌；',
  },
  {
    source: 'pve_tishen_description',
    target: '準備階段，你可以將體力恢復至體力上限並摸等量張牌',
  },
  {
    source: 'pve_zhiheng_description',
    target: '出牌階段限一次，你可以棄置至少一張牌，然後摸等量的牌。若你以此法棄置了所有的手牌，則額外摸一張牌。',
  },
];

export const promptDescriptions: Word[] = [
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
    target: '請選擇一張牌名，使用此牌名時，你隨機回覆至多3點體力',
  },
  {
    source: 'pve_huashen:choose a role losehp 1',
    target: '選擇一名角色，令其失去1點體力',
  },
  {
    source: 'pve_huashen:choose a role damage',
    target: '選擇一名角色，對其造成傷害。',
  },
  { source: 'Please drop a skill', target: '請選擇一個技能失去' },
  {
    source: 'Please announce a skill',
    target: '請選擇一個技能獲得',
  },
  {
    source: 'Please choose a character to get a skill',
    target: '請選擇一個武將並獲得其一個技能',
  },
  {
    source: 'Please select cards which needs to be replaced',
    target: '請選擇需要更換的手牌',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal1',
    target: '交給BOSS，你1點體力上限。',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal2',
    target: '交給BOSS，全部手牌（至少1張）。',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal3',
    target: 'BOSS似乎在讓你一手。',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal4',
    target: 'BOSS正在不懷好意。',
  },
  {
    source: 'pve_pyjiaoyi: A dirty deal5',
    target: 'BOSS準備設下圈套。',
  },
];
export const eventDictionary: Word[] = [
  { source: 'pve-easy-mode', target: '低難度' },
  { source: 'pve-hard-mode', target: '高難度' },
  { source: '{0} ouyujiguan', target: '{0} 偶遇了機關' },
  { source: '{0} qiyubaowu', target: '{0} 奇遇寶物' },
  { source: '{0}: do you want to awaken?', target: '{0} 已點亮四種標記，請選擇適應性強化' },
  { source: '{0}: get the next stage mark', target: '{0} 點亮下一階段標記' },
  { source: '{0}: do you want to draw a card?', target: '{0} 你可以摸一張牌' },
  { source: '{0} triggered skill {1}, draw a card', target: '{0} 觸發了{1}摸了一張牌' },
  {
    source: '{0}: you can append a player to the targets of {1}',
    target: '{0} 你可以選擇一名其它角色，令其也成爲 {1} 的目標',
  },
  { source: '{0}: please select a player append to target for {1}', target: '{0} 請選擇一名角色成爲{1}的額外目標' },
  { source: '{0} triggered skill {1}, add a target for {2}', target: '{0} 使用了技能 {1}, 爲 {2} 添加了一個目標' },
  { source: '{0}: you can pindian to a player', target: '{0} 你可以選擇一名角色拼點' },
  { source: '{0}: you can drop {1}', target: '{0} 你可以棄置{1}張牌' },
  {
    source: '{0}: you can drop a card',
    target: '{0}: 你可以棄置一張牌',
  },
  {
    source: '{0}: you can drop a card to deal 1 thunder damage to current player?',
    target: '{0}: 你可以棄置一張牌，並對當前回合角色造成一點雷屬性傷害',
  },
  {
    source: '{0} {1}pve, please choose a character',
    target: '挑戰者, 請選擇一名武將',
  },
];
