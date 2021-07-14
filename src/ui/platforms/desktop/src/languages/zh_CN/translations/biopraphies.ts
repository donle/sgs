import { Word } from 'languages';

export const characterDictionary: Word[] = [
  { source: 'biographies', target: '武将列传' },

  { source: 'xushao', target: '许劭' },
  { source: 'pingjian', target: '评荐' },
  { source: '#pingjian', target: '评荐' },
];

export const skillDescriptions: Word[] = [
  {
    source: 'pingjian_description',
    target:
      '出牌阶段限一次，结束阶段开始时或当你受到伤害后，你可以观看三个可于当前时机发动的技能，你选择其中一个技能并可发动该技能（每个技能限发动一次）。',
  },
];

export const promptDescriptions: Word[] = [
  {
    source: '{0}: please choose pingjian options',
    target: '{0}：请选择一项技能，然后你可发动所选技能',
  },
];
