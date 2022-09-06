import { Word } from 'languages';

export const cardDictionary: Word[] = [
  { source: 'qizhengxiangsheng', target: '奇正相生' },
  {
    source: 'qizhengxiangsheng_description',
    target:
      '<b style="color:red">出牌階段</b>，對一名其他角色使用。你選擇“<b style="color:green">奇兵</b>”或“<b style="color:green">正兵</b>”（僅你可見），然後目標角色可以打出一張【殺】或【閃】。若你是“<b style="color:green">奇兵</b>”且目標角色沒有打出【殺】，你對其造成1點傷害；若你是“<b style="color:green">正兵</b>”且目標角色沒有打出【閃】，你獲得其一張牌。',
  },
  {
    source: '{0} used {1} to you, please response a {2} or {3} card',
    target: '{0} 對你使用了 {1}, 打出一張 【{2}】或 【{3}】來響應',
  },
  { source: 'please response a {0} or {1} card', target: '是否打出一張 【{0}】或 【{1}】響應' },
  { source: 'qibing', target: '奇兵' },
  { source: 'zhengbing', target: '正兵' },
];
