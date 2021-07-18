import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'caopi', target: '曹丕' },
  { source: 'xingshang', target: '行殤' },
  { source: 'fangzhu', target: '放逐' },
  { source: 'songwei', target: '頌威' },

  { source: 'xuhuang', target: '徐晃' },
  { source: 'duanliang', target: '斷糧' },
  { source: 'jiezi', target: '截輜' },

  { source: 'menghuo', target: '孟獲' },
  { source: 'huoshou', target: '禍首' },
  { source: 'zaiqi', target: '再起' },

  { source: 'zhurong', target: '祝融' },
  { source: 'juxiang', target: '巨象' },
  { source: 'lieren', target: '烈刃' },

  { source: 'lusu', target: '魯肅' },
  { source: 'haoshi', target: '好施' },
  { source: '#haoshi', target: '好施' },
  { source: 'dimeng', target: '締盟' },

  { source: 'sunjian', target: '孫堅' },
  { source: 'yinghun', target: '英魂' },
  { source: 'wulie', target: '武烈' },
  { source: '#wulie_shadow', target: '武烈' },

  { source: 'dongzhuo', target: '董卓' },
  { source: 'jiuchi', target: '酒池' },
  { source: 'JiuChi_Used', target: '崩壞失效' },
  { source: 'roulin', target: '肉林' },
  { source: 'benghuai', target: '崩壞' },
  { source: 'baonve', target: '暴虐' },

  { source: 'jiaxu', target: '賈詡' },
  { source: 'wansha', target: '完殺' },
  { source: 'luanwu', target: '亂武' },
  { source: 'weimu', target: '帷幕' },
];

export const skillDescriptions: Word[] = [
  { source: 'xingshang_description', target: '當其他角色死亡時，你可以選擇一項：1.獲得其所有牌；2.回複1點體力。' },
  {
    source: 'fangzhu_description',
    target:
      '當你受到傷害後，你可以令一名其他角色選擇一項：1.摸X張牌並翻麵；2.棄置X張牌並失去1點體力（X為你已損失的體力值）。',
  },
  {
    source: 'songwei_description',
    target: '<b>主公技</b>，當其他魏勢力的黑色判定牌生效後，其可以令你摸一張牌。',
  },
  {
    source: 'duanliang_description',
    target: '你可以將一張黑色基本或裝備牌當【兵糧寸斷】使用；你對手牌數不小於你的角色使用【兵糧寸斷】無距離限製。',
  },
  { source: 'jiezi_description', target: '<b>鎖定技</b>，當其他角色跳過摸牌階段後，你摸一張牌。' },
  {
    source: 'huoshou_description',
    target:
      '<b>鎖定技</b>，【南蠻入侵】對你無效；當其他角色使用【南蠻入侵】指定第一個目標後，你代替其成為此牌造成傷害的傷害來源。',
  },
  {
    source: 'zaiqi_description',
    target:
      '棄牌階段結束時，你可以令一至X名角色選擇一項：1.令你回複1點體力；2.摸一張牌（X為本回合內進入棄牌堆的紅色牌數）。',
  },
  {
    source: 'juxiang_description',
    target: '<b>鎖定技</b>，【南蠻入侵】對你無效；當其他角色使用的【南蠻入侵】結算結束後，你獲得之。',
  },
  {
    source: 'lieren_description',
    target: '當你使用【殺】指定目標後，你可以與目標角色拚點，若你：贏，你獲得其一張牌；冇贏，你與其交換拚點牌。',
  },
  {
    source: 'haoshi_description',
    target:
      '摸牌階段，你可以多摸兩張牌。若如此做，此階段結束時，若你的手牌數大於5，你將一半的手牌交給除你外手牌數最少的一名角色（嚮下取整）。',
  },
  {
    source: 'dimeng_description',
    target:
      '出牌階段限一次，你可以選擇兩名其他角色（至少一名角色有手牌）並棄置X張牌（X為這兩名角色的手牌數之差），然後令這兩名角色交換其手牌。',
  },
  {
    source: 'yinghun_description',
    target:
      '準備階段開始時，若你已受傷，你可以選擇一名其他角色並選擇一項：1.令其摸X張牌並棄置一張牌；2.令其摸一張牌並棄置X張牌（X為你已損失的體力值）。',
  },
  {
    source: 'wulie_description',
    target:
      '<b>限定技</b>，結束階段開始時，你可以失去至少1點體力並選擇等量其他角色，這些角色各獲得一枚“烈”標記；當有“烈”標記的角色受到傷害時，其移去此標記並防止此傷害。',
  },
  {
    source: 'jiuchi_description',
    target:
      '你可以將一張黑桃手牌當【酒】使用；你使用【酒】無次數限製；你使用【酒】【殺】造成傷害後，本回合內你的“崩壞”無效。',
  },
  {
    source: 'roulin_description',
    target:
      '<b>鎖定技</b>，當你使用【殺】指定女性角色為目標/女性角色使用【殺】指定你為目標後，其/你需依次使用兩張【閃】才能抵消此【殺】。',
  },
  {
    source: 'benghuai_description',
    target: '<b>鎖定技</b>，結束階段開始時，若你不為體力值最小的角色，你選擇一項：1.失去1點體力；2.減1點體力上限。',
  },
  {
    source: 'baonve_description',
    target:
      '<b>主公技</b>，當其他群勢力角色造成一點傷害後，其可以令你進行判定，若結果為黑桃，你獲得此判定牌並回複1點體力。',
  },
  {
    source: 'wansha_description',
    target: '<b>鎖定技</b>，你的回合內，除處於瀕死狀態的角色外的其他角色不能使用【桃】。',
  },
  {
    source: 'luanwu_description',
    target:
      '<b>限定技</b>，出牌階段，你可以令所有其他角色選擇一項：1.對除其外與其距離最近的角色使用一張【殺】；2.失去1點體力。',
  },
  {
    source: 'weimu_description',
    target: '<b>鎖定技</b>，你不能成為黑色錦囊牌的目標。',
  },
];

export const eventDictionary: Word[] = [
  { source: 'yinghun:option-one', target: '摸一棄X' },
  { source: 'yinghun:option-two', target: '摸X棄一' },
  { source: 'benghuai:hp', target: '失去1點體力' },
  { source: 'benghuai:maxhp', target: '減1點體力上限' },
  { source: 'xingshang:recover', target: '回複1點體力' },
  { source: 'xingshang:pickup', target: '獲得陣亡角色的所有牌' },
  { source: 'zaiqi:draw', target: '摸一張牌' },
  { source: 'zaiqi:recover', target: '令孟獲回複1點體力' },
];
