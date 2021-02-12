import type { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'slash', target: '殺' },
  { source: 'jink', target: '閃' },
  { source: 'peach', target: '桃' },
  { source: 'alcohol', target: '酒' },
  { source: 'qinggang', target: '青釭劍' },
  { source: 'zixing', target: '紫騂' },
  { source: 'dayuan', target: '大宛' },
  { source: 'jueying', target: '絕影' },
  { source: 'chitu', target: '赤兔' },
  { source: 'dilu', target: '的盧' },
  { source: 'zhuahuangfeidian', target: '爪黃飛電' },
  { source: 'nanmanruqing', target: '南蠻入侵' },
  { source: 'wanjianqifa', target: '萬箭齊發' },
  { source: 'lightning', target: '閃電' },
  { source: 'zhugeliannu', target: '諸葛連弩' },
  { source: 'guohechaiqiao', target: '過河拆橋' },
  { source: 'shunshouqianyang', target: '順手牽羊' },
  { source: 'wuxiekeji', target: '無懈可擊' },
  { source: 'wuzhongshengyou', target: '無中生有' },
  { source: 'baguazhen', target: '八卦陣' },
  { source: 'duel', target: '決鬥' },
  { source: 'lebusishu', target: '樂不思蜀' },
  { source: 'jiedaosharen', target: '借刀殺人' },
  { source: 'taoyuanjieyi', target: '桃園結義' },
  { source: 'wugufengdeng', target: '五穀豐登' },
  { source: 'guanshifu', target: '貫石斧' },
  { source: 'zhangbashemao', target: '丈八蛇矛' },
  { source: 'fangtianhuaji', target: '方天畫戟' },
  { source: 'qinglongyanyuedao', target: '青龍偃月刀' },
  { source: 'qilingong', target: '麒麟弓' },
  { source: 'cixiongjian', target: '雌雄雙股劍' },
  { source: 'renwangdun', target: '仁王盾' },
  { source: 'hanbingjian', target: '寒冰劍' },
  { source: 'fire_slash', target: '火殺' },
  { source: 'thunder_slash', target: '雷殺' },
  { source: 'fire_attack', target: '火攻' },
  { source: 'muniuliuma', target: '木牛流馬' },
  { source: '#muniuliuma', target: '木牛流馬' },
  { source: 'bingliangcunduan', target: '兵糧寸斷' },
  { source: 'gudingdao', target: '古錠刀' },
  { source: 'zhuqueyushan', target: '朱雀羽扇' },
  { source: 'tengjia', target: '藤甲' },
  { source: 'baiyinshizi', target: '白銀獅子' },
  { source: 'hualiu', target: '驊騮' },
  { source: 'tiesuolianhuan', target: '鐵索連環' },
];

export const cardDescriptions: Word[] = [
  {
    source: 'slash_description',
    target: '出牌階段限一次，對你攻擊範圍內的一名其他角色使用。你對目標角色造成1點傷害。',
  },
  {
    source: 'fire_slash_description',
    target: '出牌階段限一次，對你攻擊範圍內的一名其他角色使用。你對目標角色造成1點【火屬性】傷害。',
  },
  {
    source: 'thunder_slash_description',
    target: '出牌階段限一次，對你攻擊範圍內的一名其他角色使用。你對目標角色造成1點【雷屬性】傷害。',
  },
  {
    source: 'jink_description',
    target: '當【殺】對你生效前，對此【殺】使用。抵消目標【殺】。',
  },
  {
    source: 'peach_description',
    target:
      '<b style="color:red">出牌階段</b>/<b style="color:green">當一名角色進入瀕死狀態時</b>，對已受傷的<b style="color:red">你</b>/<b style="color:green">該角色</b>使用。目標角色回複1點體力',
  },
  {
    source: 'alcohol_description',
    target: `①出牌階段，對本回合內為以此效果使用過【酒】的你使用。目標角色於此回合內使用的下一張【殺】的傷害基數+1。<br />
      ②當你處於瀕死狀態時，對你使用。目標角色回複1點體力。`,
  },
  {
    source: 'bingliangcunduan_description',
    target: '出牌階段，對你距離為1的一名其他角色使用。目標角色判定，若不為梅花，其跳過本回合的下個摸牌階段。',
  },
  {
    source: 'guohechaiqiao_description',
    target: '出牌階段，對區域內有牌的一名其他角色使用。你棄置目標角色區域裏的一張牌。',
  },
  {
    source: 'fire_attack_description',
    target:
      '出牌階段，對一名有手牌的角色使用。目標角色展示其一張手牌，然後你可以棄置與展示牌花色相同的一張手牌，對其造成1點火焰傷害。',
  },
  {
    source: 'muniuliuma_description',
    target:
      '出牌階段限一次，你可將一張手牌移出遊戲並扣置於【木牛流馬】下，稱為“輜”，若如此做，你可將裝備區裏的【木牛流馬】置入一名其他角色的裝備區；你能將“輜”如手牌般使用或打出。',
  },
  {
    source: 'jiedaosharen_description',
    target:
      '出牌階段，對一名裝備區裏有武器牌的其他角色使用。目標角色需對其攻擊範圍內由你選擇的另一名角色使用一張【殺】，否則其將裝備區裏的武器牌交給你。',
  },
  {
    source: 'duel_description',
    target:
      '出牌階段，對一名其他角色使用。由目標角色開始，你與其輪流打出一張【殺】，直到一名角色未打出【殺】，然後該角色受到另一名角色造成的1點傷害。',
  },
  {
    source: 'lebusishu_description',
    target: '出牌階段，對一名其他角色使用。目標角色判定，若不為紅桃，其跳過本回合的下一個出牌階段。',
  },
  {
    source: 'nanmanruqing_description',
    target: '出牌階段，對所有其他角色使用。目標角色需打出一張【殺】，否則受到你造成的1點傷害。',
  },
  {
    source: 'lightning_description',
    target: '出牌階段，對你使用。目標角色判定，若為黑桃2~9，其受到3點無來源的雷電傷害。',
  },
  {
    source: 'shunshouqianyang_description',
    target: '出牌階段，對距離為一且區域內有牌的一名其他角色使用。你獲得目標角色區域內的一張牌。',
  },
  {
    source: 'taoyuanjieyi_description',
    target: '出牌階段，對所有角色使用。目標角色回複1點體力。',
  },
  {
    source: 'tiesuolianhuan_description',
    target: '出牌階段，對一至兩名角色使用。目標角色橫置/重置其武將牌。（此牌可重鑄）',
  },
  {
    source: 'wanjianqifa_description',
    target: '出牌階段，對所有其他角色使用。目標角色需打出一張【閃】，否則其受到你造成的1點傷害。',
  },
  {
    source: 'wuxiekeji_description',
    target: '當錦囊牌對你生效前，對此錦囊牌使用。抵消目標錦囊牌。',
  },
  {
    source: 'wuzhongshengyou_description',
    target: '出牌階段，對你使用。目標角色摸兩張牌。',
  },
  {
    source: 'wugufengdeng_description',
    target: '出牌階段，對所有角色使用。亮出牌堆頂等同於目標數的牌，目標角色依次獲得其中一張牌。',
  },
  {
    source: 'cixiongjian_description',
    target: '當你使用【殺】指定目標後，若其性別與你不同，你可以令其選擇一項：1.棄置一張手牌；2.令你摸一張牌。',
  },
  {
    source: 'fangtianhuaji_description',
    target: '<b>鎖定技</b>，你使用對應實體牌為你所有手牌的【殺】的目標上限+2。',
  },
  {
    source: 'gudingdao_description',
    target: '<b>鎖定技</b>，當你使用【殺】對目標角色造成傷害時，若其冇有手牌，此傷害+1。',
  },
  {
    source: 'guanshifu_description',
    target: '當你使用的【殺】被目標角色抵消後，你可以棄置兩張牌，使此【殺】依然生效。',
  },
  {
    source: 'hanbingjian_description',
    target: '當你使用【殺】對目標角色造成傷害時，若其有牌，你可以防止此傷害，然後依次棄置其兩張牌。',
  },
  {
    source: 'qilingong_description',
    target: '當你使用【殺】對目標角色造成傷害時，你可以棄置其裝備區裏的一張坐騎牌。',
  },
  {
    source: 'qinggang_description',
    target: '<b>鎖定技</b>，當你使用【殺】指定目標後，無視其防具。',
  },
  {
    source: 'qinglongyanyuedao_description',
    target: '當你使用的【殺】被目標角色抵消後，你可以對其使用一張【殺】（無距離限製）。',
  },
  {
    source: 'zhangbashemao_description',
    target: '你可以將兩張手牌當【殺】使用或打出。',
  },
  {
    source: 'zhugeliannu_description',
    target: '<b>鎖定技</b>，你使用【殺】無次數限製。',
  },
  {
    source: 'zhuqueyushan_description',
    target: '你可以將普【殺】當火【殺】使用。',
  },
  {
    source: 'baguazhen_description',
    target: '當你需要使用或打出【閃】時，你可以判定，若為紅色，你視為使用或打出一張【閃】。',
  },
  {
    source: 'baiyinshizi_description',
    target: '當你受到傷害時，若傷害值大於1，你將傷害值改為1；當你失去裝備區裏的此牌後，你回複1點體力。',
  },
  {
    source: 'renwangdun_description',
    target: '<b>鎖定技</b>，黑色【殺】對你無效。',
  },
  {
    source: 'tengjia_description',
    target: '<b>鎖定技</b>，【南蠻入侵】、【萬箭齊發】和普【殺】對你無效；當你受到火焰傷害時，此傷害+1。',
  },
  {
    source: 'tengjia_description',
    target: '<b>鎖定技</b>，【南蠻入侵】、【萬箭齊發】和普【殺】對你無效；當你受到火焰傷害時，此傷害+1。',
  },
  {
    source: 'zixing_description',
    target: '你計算與其他角色的距離-1。',
  },
  {
    source: 'dayuan_description',
    target: '你計算與其他角色的距離-1。',
  },
  {
    source: 'jueying_description',
    target: '其他角色計算與你的距離+1。',
  },
  {
    source: 'chitu_description',
    target: '你計算與其他角色的距離-1。',
  },
  {
    source: 'dilu_description',
    target: '其他角色計算與你的距離+1。',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: '其他角色計算與你的距離+1。',
  },
  {
    source: 'zhuahuangfeidian_description',
    target: '其他角色計算與你的距離+1。',
  },
  {
    source: 'hualiu_description',
    target: '其他角色計算與你的距離+1。',
  },
  { source: 'do you wish to deliver muniuliuma to another player?', target: '是否將木牛流馬移動至其他角色的裝備區？' },
  {
    source: '{0} used card {1} to {2} and announced {3} as pending target',
    target: '{0} 使用了一張 {1}，目標是 {2}，其需要殺的目標是 {3}',
  },
];
