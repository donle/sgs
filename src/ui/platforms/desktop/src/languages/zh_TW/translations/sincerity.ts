import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'sincerity', target: '信包' },

  { source: 'xin_xinpi', target: '信辛毗' },
  { source: 'xin_yinju', target: '引裾' },
  { source: 'xin_chijie', target: '持節' },

  { source: 'wangling', target: '王凌' },
  { source: 'mouli', target: '謀立' },
  { source: '~side_mouli', target: '謀立' },
  { source: 'mouli:li', target: '立' },
  { source: 'zifu', target: '自縛' },

  { source: 'mifuren', target: '糜夫人' },
  { source: 'cunsi', target: '存嗣' },
  { source: 'cunsi damage: {0}', target: '存嗣[{0}]' },
  { source: 'guixiu', target: '閨秀' },

  { source: 'wangfuzhaolei', target: '王甫趙累' },
  { source: 'xunyi', target: '殉義' },
  { source: 'xunyi:yi', target: '義' },

  { source: 'wujing', target: '吳景' },
  { source: 'heji', target: '合擊' },

  { source: 'zhouchu', target: '周處' },
  { source: 'xianghai', target: '鄉害' },
  { source: 'chuhai', target: '除害' },

  { source: 'kongrong', target: '孔融' },
  { source: 'mingshi', target: '名士' },
  { source: 'lirang', target: '禮讓' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'mouli_description',
    target:
      '出牌階段限一次，你可以交給一名其他角色一張手牌，其獲得“立”標記並擁有以下效果直到你的下個回合開始：其可以將一張黑色牌當【殺】使用，或將一張紅色牌當【閃】使用；當其下一次使用【殺】或【閃】結算結束後，你摸三張牌。',
  },
  {
    source: 'zifu_description',
    target: '<b>鎖定技</b>，當擁有“立”標記的角色死亡後，你減2點體力上限。',
  },

  {
    source: 'xunyi_description',
    target:
      '遊戲開始時，你可以選擇一名其他角色，其獲得“義”標記：當你或其造成傷害後，對方摸一張牌；當你或其受到傷害後，對方棄置一張牌（你和其對對方造成的傷害除外）。當其死亡時，你可以移動此“義”。',
  },

  {
    source: 'cunsi_description',
    target:
      '出牌階段限一次，你可以將武將牌翻至背面朝上，並令一名角色從牌堆和棄牌堆中隨機獲得一張【殺】，且其使用的下一張【殺】傷害基數+1。',
  },
  {
    source: 'guixiu_description',
    target: '<b>鎖定技</b>，當你受到傷害後，你將武將牌翻至正面朝上；當你的武將牌翻至正面朝上後，你摸一張牌。',
  },

  {
    source: 'heji_description',
    target:
      '當一名角色使用紅色【殺】或紅色【決鬥】結算結束後，若目標數為1，你可對此目標使用一張【殺】或【決鬥】（無距離限制）。若你以此法使用的牌不為轉化牌，當此牌使用時，你隨機獲得牌堆裡的一張紅色牌。',
  },

  {
    source: 'xianghai_description',
    target: '<b>鎖定技</b>，其他角色的手牌上限-1；你手牌中的裝備牌均視為【酒】。',
  },
  {
    source: 'chuhai_description',
    target:
      '出牌階段限一次，你可以摸一張牌並與一名角色拼點。若你贏，你觀看其手牌，從牌堆或棄牌堆隨機獲得其手牌中擁有的所有類別的牌各一張，且你於此階段內對其造成傷害後，你從牌堆或棄牌堆中隨機將一張你裝備區裡沒有的副類別的裝備牌置入你的裝備區。',
  },

  {
    source: 'mingshi_description',
    target: '<b>鎖定技</b>，當你受到1點傷害後，傷害來源棄置一張牌。',
  },
  {
    source: 'lirang_description',
    target: '出牌階段限一次，你可以棄置所有手牌，將其中一至X張牌交給一名其他角色（X為你的體力值），然後你摸一張牌。',
  },
];

export const skillAudios: Word[] = [
  /*  {
      source: '$xin_yinju:1',
      target: '據理直諫，吾人臣本分。',
    },
    {
      source: '$xin_yinju:2',
      target: '遷徙之計，危涉萬民。',
    },
    {
      source: '$xin_chijie:1',
      target: '持節阻戰，奉帝賜詔。',
    },
    {
      source: '$xin_chijie:2',
      target: '此戰不在急，請仲達明瞭。',
    },*/

  {
    source: '$yinju:1',
    target: '據理直諫，吾人臣本分。',
  },
  {
    source: '$yinju:2',
    target: '遷徙之計，危涉萬民。',
  },
  {
    source: '$chijie:1',
    target: '持節阻戰，奉帝賜詔。',
  },
  {
    source: '$chijie:2',
    target: '此戰不在急，請仲達明瞭。',
  },

  {
    source: '$mouli:1',
    target: '司馬氏雖權尊勢重，吾等徐圖亦無不可。',
  },
  {
    source: '$mouli:2',
    target: '先謀後事者昌，先事後謀者亡！',
  },
  {
    source: '$zifu:1',
    target: '有心無力，請罪願降。',
  },
  {
    source: '$zifu:2',
    target: '輿櫬自縛，只求太傅開恩。',
  },

  {
    source: '$cunsi:1',
    target: '子龍，定要保吾兒平安。',
  },
  {
    source: '$cunsi:2',
    target: '將軍護禪兒，快快突圍！',
  },
  {
    source: '$guixiu:1',
    target: '通兒女之情意，曉亂世之冷暖。',
  },
  {
    source: '$guixiu:2',
    target: '深閨藏英秀，獨憐亂世秋。',
  },

  {
    source: '$xunyi:1',
    target: '古有死恩之士，今有殉義之人。',
  },
  {
    source: '$xunyi:2',
    target: '捨身殉義，爲君效死。',
  },

  {
    source: '$heji:1',
    target: '你我合勢而擊之，區區賊寇，豈會費力？',
  },
  {
    source: '$heji:2',
    target: '伯符，今日之戰吾必全力攻之。',
  },

  {
    source: '$xianghai:1',
    target: '快快閃開，傷到你們可就不好了，哈哈…',
  },
  {
    source: '$xianghai:2',
    target: '你自己撞上來的，這可怪不得小爺我。',
  },
  {
    source: '$chuhai:1',
    target: '有我在此，安敢爲害？',
  },
  {
    source: '$chuhai:2',
    target: '小小孽畜，還不伏誅？',
  },

  {
    source: '$mingshi:1',
    target: '縱有強權在側，亦不可失吾風骨。',
  },
  {
    source: '$mingshi:2',
    target: '黜邪崇正，何懼之有？',
  },
  {
    source: '$lirang:1',
    target: '仁之所至，禮之所及。',
  },
  {
    source: '$lirang:2',
    target: '施之以禮，還之以德。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: do you want to use a slash or duel to {1} ?',
    target: '{0}：你可以對 {1} 使用一張【殺】或【決鬥】',
  },

  {
    source: 'lirang: please choose a target to give cards',
    target: '禮讓：請選擇一名其他角色，將所選牌交給他',
  },

  {
    source: '{0}: do you want to choose a target to gain 1 ‘Yi’?',
    target: '{0}：你可以令一名其他角色獲得一枚“義”',
  },
];
