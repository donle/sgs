import type { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'yijiang2011', target: '將1' },

  { source: 'caozhi', target: '曹植' },
  { source: 'luoying', target: '落英' },
  { source: 'jiushi', target: '酒詩' },
  { source: '#jiushi', target: '酒詩' },
  { source: 'chengzhang', target: '成章' },

  { source: 'yujin', target: '于禁' },
  { source: 'jieyue', target: '節鉞' },

  { source: 'zhangchunhua', target: '張春華' },
  { source: 'jueqing', target: '絕情' },
  { source: 'shangshi', target: '傷逝' },

  { source: 'masu', target: '馬謖' },
  { source: 'sanyao', target: '散謠' },
  { source: 'zhiman', target: '制蠻' },

  { source: 'fazheng', target: '法正' },
  { source: 'enyuan', target: '恩怨' },
  { source: 'xuanhuo', target: '眩惑' },

  { source: 'xushu', target: '徐庶' },
  { source: 'wuyan', target: '無言' },
  { source: 'jujian', target: '舉薦' },

  { source: 'wuguotai', target: '吳國太' },
  { source: 'ganlu', target: '甘露' },
  { source: 'buyi', target: '補益' },

  { source: 'xusheng', target: '徐盛' },
  { source: 'pojun', target: '破軍' },

  { source: 'lingtong', target: '淩統' },
  { source: 'xuanfeng', target: '旋風' },
  { source: 'yongjin', target: '勇進' },

  { source: 'chengong', target: '陳宮' },
  { source: 'mingce', target: '明策' },
  { source: 'zhichi', target: '智遲' },

  { source: 'gaoshun', target: '高順' },
  { source: 'xianzhen', target: '陷陣' },
  { source: '#####xianzhen', target: '陷陣' },
  { source: 'jinjiu', target: '禁酒' },
  { source: 'xianzhen target: {0}', target: '陷陣:{0}' },
  { source: 'xianzhen_lose', target: '陷陣[沒贏]' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'luoying_description',
    target: '當其他角色的判定牌進入棄牌堆後，或其他角色的牌因棄置而進入棄牌堆後，你可以獲得其中至少一張梅花牌。',
  },
  {
    source: 'jiushi_description',
    target:
      '1級：當你需要使用[酒]時，若你的武將牌正面向上，你可以翻面，視為使用一張[酒]。當你受到傷害後，若你的武將牌背面向上，你可以翻面並獲得牌堆中的一張隨機錦囊。<br />2級：當你需要使用[酒]時，若你的武將牌正面向上，你可以翻面，視為使用一張[酒]。當你受到傷害後若你的武將牌背面向上，你可以翻面。當你翻面時，你獲得牌堆中的一張隨機錦囊。',
  },
  {
    source: 'chengzhang_description',
    target:
      '<b>覺醒技</b>，準備階段開始時，若你造成傷害與受到傷害值之和累計7點或以上，則你回覆1點體力並摸1張牌，然後升級“酒詩”。',
  },
  {
    source: 'jieyue_description',
    target:
      '結束階段開始時，你可以交給一名其他角色一張牌，然後其選擇一項：1.保留一張手牌和一張裝備區裡的牌，棄置其餘的牌；2.令你摸三張牌。',
  },

  {
    source: 'jueqing_description',
    target: '<b>鎖定技</b>，你即將造成的傷害均視為體力流失。',
  },
  {
    source: 'shangshi_description',
    target: '當你的手牌數小於X時，你可以將手牌摸至X張（X為你已損失的體力值）。',
  },

  {
    source: 'sanyao_description',
    target:
      '出牌階段每項限一次，你可以棄置一張牌，並選擇一項：1.指定體力值最高的一名角色；2.指定手牌數最多的一名角色。對你所選的角色造成1點傷害。',
  },
  {
    source: 'zhiman_description',
    target: '你對其他角色造成傷害時，你可以防止此傷害，然後獲得其區域內的一張牌。',
  },

  {
    source: 'enyuan_description',
    target:
      '當你受到1點傷害後，你可以令傷害來源選擇一項：1.交給你一張手牌，若此牌不為紅桃，你摸一張牌；2.失去1點體力。當你獲得其他角色的牌後，若不少於兩張，你可以令其摸一張牌。',
  },
  {
    source: 'xuanhuo_description',
    target:
      '摸牌階段結束時，你可以交給一名其他角色兩張手牌，並選擇另一名其他角色，前者選擇一項：1.視為對後者使用一張任意【殺】或【決鬥】；2.交給你所有手牌。',
  },

  {
    source: 'wuyan_description',
    target: '<b>鎖定技</b>，當你使用錦囊牌造成傷害時，或你受到錦囊牌造成的傷害時，防止此傷害。',
  },
  {
    source: 'jujian_description',
    target:
      '結束階段開始時，你可以棄置一張非基本牌並選擇一名其他角色，其選擇一項：1.回覆1點體力；2.摸兩張牌；3.復原武將牌。',
  },

  {
    source: 'pojun_description',
    target:
      '當你使用【殺】指定目標後，你可以將其一至X張牌扣置於其武將牌上，此回合結束時，其獲得這些牌（X為其體力值）；當你使用【殺】對手牌區與裝備區牌數均不大於你的角色造成傷害時，此傷害+1。',
  },

  {
    source: 'ganlu_description',
    target:
      '出牌階段限一次，你可以選擇一項：1.選擇兩名裝備區內牌數相差不大於你已損失體力值的角色，令他們交換裝備區裡的牌；2.交換你與一名其他角色裝備區裡的牌。',
  },
  {
    source: 'buyi_description',
    target:
      '當一名角色進入瀕死狀態時，若其體力值不大於0，你可以展示其一張手牌，若此牌不為基本牌，則其棄置之且該角色回覆1點體力。',
  },

  {
    source: 'xuanfeng_description',
    target:
      '若你於棄牌階段內棄置過至少兩張手牌，或當你失去裝備區裡的牌後，你可以依次棄置其他角色的共計一至兩張牌，然後若此時是你的回合內，你可以對其中一名角色造成1點傷害。',
  },
  {
    source: 'yongjin_description',
    target: '<b>限定技</b>，出牌階段，你可以依次移動場上一至三張不同的裝備牌。',
  },

  {
    source: 'mingce_description',
    target:
      '出牌階段限一次，你可以將一張【殺】或裝備牌交給一名其他角色，然後其選擇一項：1.視為對其攻擊範圍內由你指定的另一名角色使用一張【殺】；2.摸一張牌。',
  },
  {
    source: 'zhichi_description',
    target: '<b>鎖定技</b>，當你於回合外受到傷害後，本回合內【殺】和普通錦囊牌對你無效。',
  },

  {
    source: 'xianzhen_description',
    target:
      '出牌階段限一次，你可以與一名角色拼點，若你：贏，此階段內你無視其防具，對其使用牌無距離和次數限制，且當你使用【殺】或普通錦囊牌僅指定唯一目標時，可令其成為目標；沒贏，你本回合內不能使用【殺】且你的【殺】不計入手牌上限。',
  },
  {
    source: 'jinjiu_description',
    target: '<b>鎖定技</b>，你的【酒】均視為【殺】。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: you need to give a handcard to {1}',
    target: '{0}：你需交給 {1} 一張手牌（若不為紅桃則 {1} 摸一張牌），否則失去1點體力',
  },

  { source: 'xuanhuo:attack', target: '選項一' },
  { source: 'xuanhuo:give', target: '選項二' },
  {
    source: '{0}: please choose xuanhuo options: {1}',
    target: '{0}：選項一：視為對 {1} 使用一張任意【殺】或【決鬥】；選項二：交給 {1} 所有手牌',
  },
  {
    source: '{0}: please choose xuanhuo attack options: {1}',
    target: '{0}：請選擇視為對 {1} 使用的牌',
  },

  {
    source: 'please choose sanyao options',
    target: '散謠：請選擇消耗項',
  },
  { source: 'sanyao:hp', target: '體力值' },
  { source: 'sanyao:handNum', target: '手牌數' },

  {
    source: '{0}: do you want to prevent the damage to {1} to pick one card in areas?',
    target: '{0}：你可以防止對 {1} 造成的傷害，然後獲得其區域裡的一張牌',
  },

  {
    source: '{0} triggered skill {1}, prevent the damage of {2}',
    target: '{0} 觸發了技能 {1} ，防止了 {2} 造成的傷害',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以棄置一張非基本牌並選擇一名其他角色，其選擇摸牌、回血或復原',
  },
  {
    source: '{0}: do you want to drop a card except basic card and choose a target',
    target: '{0}：你可以棄置一張非基本牌並選擇一名其他角色，其選擇摸牌、回血或復原',
  },
  { source: 'jujian:draw', target: '摸兩張牌' },
  { source: 'jujian:recover', target: '回覆1點體力' },
  { source: 'jujian:restore', target: '復原武將牌' },

  {
    source: '{0}: please choose a target who {1} can use slash to',
    target: '{0}：請選擇 {1} 攻擊範圍內的一名角色作為【殺】的目標',
  },

  {
    source: 'please choose mingce options:{0}',
    target: '明策：1.視為對 {0} 使用一張【殺】；2.摸一張牌',
  },
  { source: 'mingce:slash', target: '視為使用【殺】' },
  { source: 'mingce:draw', target: '摸一張牌' },

  {
    source: 'jieyue: please choose jieyue options',
    target: '{0}：1.選擇一張手牌和裝備牌，棄置其餘的牌；2.令 {1} 摸3張牌',
  },

  {
    source: '{0}: do you want to reveal a hand card from {1} ?',
    target: '{0}：你可以展示 {1} 的一張手牌，若此牌不為基本牌，其棄置之並回復1點體力',
  },
  {
    source: 'xianzhen: do you want to add {0} as targets of {1}?',
    target: '陷陣：你可以令 {0} 也成為 {1} 的目標',
  },

  {
    source: '{0}: do you want to choose a target to drop a card?',
    target: '{0}：你可以棄置一名角色的一張牌',
  },
  {
    source: '{0}: do you want to choose a XuanFeng target to deal 1 damage?',
    target: '{0}：你可以選擇其中一名角色，對其造成1點傷害',
  },

  {
    source: '{0}: please choose two target to move their equipment',
    target: '{0}：你可以依次選擇兩名角色，先選角色裝備區裡的牌將被移至後選角色',
  },

  {
    source: '{0}: do you want to draw {1} cards?',
    target: '{0}: 是否摸 {1} 張牌?',
  },
];
