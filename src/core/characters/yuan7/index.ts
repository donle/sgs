import { JiKang } from './jikang';
import { XueZong } from './xuezong';
import { XuShi } from './xushi';
import { Character } from '../character';

export const Yuan7Package: (index: number) => Character[] = index => [
  new JiKang(index++),

  new XuShi(index++),
  new XueZong(index++),
];
