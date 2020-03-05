import { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'slash', target: '杀' },
  { source: 'jink', target: '闪' },
  { source: 'peach', target: '桃' },
  { source: 'wine', target: '酒' },
  { source: 'qinggang', target: '青钢剑' },
  { source: 'zixin', target: '紫骍' },
  { source: 'nanmanruqing', target: '南蛮入侵' },
  { source: 'wanjianqifa', target: '万箭齐发' },
  { source: 'lightning', target: '闪电' },
  { source: 'zhugeliannu', target: '诸葛连弩' },
];

export const characterDictionary: Word[] = [
  { source: 'caocao', target: '曹操' },
  { source: 'hujia', target: '护驾' },
  { source: 'jianxiong', target: '奸雄' },
  { source: 'liubei', target: '刘备' },
  { source: 'rende', target: '仁德' },
  { source: 'jijiang', target: '激将' },
  { source: 'sunquan', target: '孙权' },
  { source: 'zhiheng', target: '制衡' },
  { source: 'jiuyuan', target: '救援' },
  { source: 'huangyueying', target: '黄月英' },
];

export const generalDictionary: Word[] = [
  { source: 'standard', target: '标准版' },
  { source: 'wei', target: '魏' },
  { source: 'shu', target: '蜀' },
  { source: 'wu', target: '吴' },
  { source: 'qun', target: '群' },
  { source: 'god', target: '神' },
  { source: 'unknown', target: '未知' },
  { source: 'lord', target: '主公' },
  { source: 'loyalist', target: '忠诚' },
  { source: 'rebel', target: '反贼' },
  { source: 'renegade', target: '内奸' },
];

export const eventDictionary: Word[] = [
  {
    source: '{0} draws {1} cards',
    target: '{0} 摸了 {1} 张牌',
  },
  {
    source: 'your role is {0}, please choose a lord',
    target: '你的身份是 {0}, 请选择一名武将做为主公',
  },
  {
    source: 'lord is {0}, your role is {1}, please choose a character',
    target: '主公是【{0}】, 你的身份是 {1}, 请选择一名武将',
  },
  {
    source: 'please choose a character',
    target: '请选择一名武将',
  },
  { source: '{0} activates skill {1}', target: '{0} 发动了技能【{1}】' },
  {
    source: '{0} hurts {1} for {2} {3} hp',
    target: '{0} 对 {1} 造成了 {2} 点【{3}】伤害',
  },
  {
    source: '{0} got hits by {1} {2} hp',
    target: '{0} 受到了 {1} 点【{2}】伤害',
  },
  { source: '{0} droppes cards {1}', target: '{0} 弃置了 {1}' },
  { source: '{0} cards are dropped', target: '{0} 进入了弃牌堆' },
  { source: '{0} used card {1}', target: '{0} 使用了一张【{1}】' },
  { source: '{0} equipped {1}', target: '{0} 装备了【{1}】' },
  {
    source: '{0} used card {1} to {2}',
    target: '{0} 对 {2} 使用了一张【{1}】',
  },
  { source: '{0} obtains card {1}', target: '{0} 获得了【{1}】' },
  {
    source: '{0} uses card {2} to {1}',
    target: '{0} 对 {1} 使用了一张【{2}】',
  },
  { source: '{0} responses card {1}', target: '{0} 打出了一张【{0}】' },
  { source: 'please drop {0} cards', target: '请弃置 {0} 张牌' },
  {
    source: '{0} asks for a peach',
    target: '{0} 处于濒死阶段，是否对其使用一个【桃】？',
  },
  { source: '{0} recovers {1} hp', target: '{0} 恢复了 {1} 点体力' },
  { source: ',', target: '，' },
  { source: 'normal_propery', target: '普通' },
  { source: 'thunder_propery', target: '雷属性' },
  { source: 'fire_propery', target: '火属性' },
  {
    source: '{0} got hits from {1} by {2} {3} hp',
    target: '{0} 受到了来自 {1} 的 {2} 点【{3}】伤害',
  },
  {
    source: 'do you want to use nullification to {1} from {0}',
    target: '是否对 {0} 的【{1}】使用【无懈可击】',
  },
  {
    source: 'player {0} join in the room',
    target: '玩家 {0} 进入了房间',
  },
  {
    source: 'player {0} has left the room',
    target: '玩家 {0} 退出了房间',
  },
  {
    source: 'game will start within 3 seconds',
    target: '游戏将在3秒后开始',
  },
];

export const UiDictionary = [
  { source: 'No rooms at the moment', target: '还没有玩家创建房间' },
  { source: 'Create a room', target: '创建信房间' },
  { source: 'waiting', target: '等待中' },
  { source: 'playing', target: '游戏中' },
  {
    source: 'Unmatched core version, please update your application',
    target: '内核版本不匹配，请升级你的客户端版本',
  },
  {
    source: 'New QSanguosha',
    target: '新神杀',
  },
  {
    source: 'confirm',
    target: '确定',
  },
  {
    source: 'cancel',
    target: '取消',
  },
  {
    source: 'finish',
    target: '结束',
  },
];
