import { PlayerId } from 'core/player/player_props';
import { gameSkinInfo } from './skin_data';
export class SkinLoader {
  public async getCharacterSkinPlay(characterName: string, playerId?: PlayerId, skinName?: string) {
    let image: string;
    if (skinName !== characterName) {
      const skin = gameSkinInfo
        .find(skinInfo => skinInfo.characterName === characterName)
        ?.skinInfo.find(skinInfo => skinInfo.skinName === skinName);
      if (skin?.skinName !== undefined && skin.skinLocation) {
        image = process.env.PUBLIC_URL + '/' + skin?.skinLocation;
      } else {
        image = (await import(`./images/characters/${characterName}.png`)).default;
      }
    } else {
      image = (await import(`./images/characters/${characterName}.png`)).default;
    }
    return { alt: characterName, src: image };
  }
}
