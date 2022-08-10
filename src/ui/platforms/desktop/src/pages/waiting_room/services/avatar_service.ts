import { Sanguosha } from 'core/game/engine';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ImageLoader } from 'image_loader/image_loader';

export class RoomAvatarService {
  constructor(private imageLoader: ImageLoader) {}

  private readonly avatarIndexMap = Sanguosha.getAllCharacters().map(character => character.Name);

  public getAvatarIndexByName(name: string) {
    return this.avatarIndexMap.findIndex(avatarName => avatarName === name);
  }

  public getAvatarByIndex(index: number) {
    Precondition.assert(index < this.avatarIndexMap.length, 'unacceptable avatar index');

    return this.imageLoader.getCharacterImage(this.avatarIndexMap[index]);
  }

  public getRandomAvatar() {
    return this.imageLoader.getCharacterImage(
      this.avatarIndexMap[Math.floor(Math.random() * this.avatarIndexMap.length)],
    );
  }

  public getRandomAvatarIndex() {
    return Math.floor(Math.random() * this.avatarIndexMap.length);
  }
}
