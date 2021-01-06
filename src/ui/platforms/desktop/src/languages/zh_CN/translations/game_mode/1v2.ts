import { Word } from 'languages';

export const dictionary: Word[] = [
  { source: 'landowners', target: '地主' },
  { source: 'peasant', target: '农民' },
  { source: 'feiyang', target: '飞扬' },
  {
    source: 'feiyang_description',
    target: '判定阶段开始时，若你的判定区有牌，则你可以弃置两张手牌，然后弃置你判定区的一张牌。每回合限一次。',
  },
  { source: 'bahu', target: '跋扈' },
  {
    source: 'bahu_description',
    target: '<b>锁定技</b>，准备阶段开始时，你摸一张牌。出牌阶段，你可以多使用一张【杀】。',
  },
  { source: 'please drop a judge card', target: '请弃置一张判定牌' },
  { source: 'your role is {0}, please choose a character', target: '你的身份是 {0}，请选择一个你的武将' },
];
