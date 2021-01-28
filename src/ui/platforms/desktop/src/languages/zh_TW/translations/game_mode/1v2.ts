import { Word } from 'languages';

export const dictionary: Word[] = [
  { source: 'landowners', target: '地主' },
  { source: 'peasant', target: '農民' },
  { source: 'feiyang', target: '飛揚' },
  {
    source: 'feiyang_description',
    target: '判定階段開始時，若你的判定區有牌，則你可以棄置兩張手牌，然後棄置你判定區的一張牌。每回合限一次。',
  },
  { source: 'bahu', target: '跋扈' },
  {
    source: 'bahu_description',
    target: '<b>鎖定技</b>，準備階段開始時，你摸一張牌。出牌階段，你可以多使用一張【殺】。',
  },
  { source: 'please drop a judge card', target: '請棄置一張判定牌' },
  { source: 'your role is {0}, please choose a character', target: '你的身份是 {0}，請選擇一個你的武將' },
];
