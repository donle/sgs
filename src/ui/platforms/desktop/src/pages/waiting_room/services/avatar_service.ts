import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ImageLoader } from 'image_loader/image_loader';

export class RoomAvatarService {
  constructor(private imageLoader: ImageLoader) {}

  private readonly avatarIndexMap = [
    'sunquan',
    'liubei',
    'sunshangxiang',
    'xiaoqiao',
    'wuguotai',
    'zhouyu',
    'god_liubei',
  ];

  public getAvatarIndexByName(name: string) {
    return this.avatarIndexMap.findIndex(avatarName => avatarName === name);
  }

  public getAvatarByIndex(index: number) {
    Precondition.assert(index < this.avatarIndexMap.length, 'unacceptable avatar index');

    return this.imageLoader.getCharacterImage(this.avatarIndexMap[index]);
  }

  public getRandomAvatar() {
    this.imageLoader.getCharacterImage(this.avatarIndexMap[Math.floor(Math.random() * this.avatarIndexMap.length)]);
  }
}
