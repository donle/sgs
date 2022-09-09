import type { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'qizhengxiangsheng', target: '奇正相生' },
  {
    source: 'qizhengxiangsheng_description',
    target:
      '<b style="color:red">出牌阶段</b>，对一名其他角色使用。你选择“<b style="color:green">奇兵</b>”或“<b style="color:green">正兵</b>”（仅你可见），然后目标角色可以打出一张【杀】或【闪】。若你是“<b style="color:green">奇兵</b>”且目标角色没有打出【杀】，你对其造成1点伤害；若你是“<b style="color:green">正兵</b>”且目标角色没有打出【闪】，你获得其一张牌。',
  },
  {
    source: '{0} used {1} to you, please response a {2} or {3} card',
    target: '{0} 对你使用了 {1}, 打出一张 【{2}】或 【{3}】来响应',
  },
  { source: 'please response a {0} or {1} card', target: '是否打出一张 【{0}】或 【{1}】响应' },
  { source: 'qibing', target: '奇兵' },
  { source: 'zhengbing', target: '正兵' },
];
