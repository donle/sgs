import { PlayerId } from 'core/player/player_props';
import { ImageProps } from 'props/image_props';
import { gameSkinInfo } from './skin_data';

export type HistoryCharacterSkin = {
  playerId: PlayerId;
  historyCharacterName: string;
  historyTime: number;
  historySkinPath: string;
};

export interface SkinImage {
  getCharacterSkin(characterName: string, playerId?: PlayerId | undefined): Promise<ImageProps>;
}

export class SkinLoader implements SkinImage {
  private skinCharacterList: string[] = [];
  private historyCharacterSkinInfo: HistoryCharacterSkin[] = [];

  constructor() {
    fetch('http://localhost:8086/sgs/gameSkinInfo')
      .then(response => response.json())
      .then(myJson => console.log(myJson));

    for (const characterSkinInfo of gameSkinInfo) {
      this.skinCharacterList.push(characterSkinInfo.characterName);
      console.log(this.skinCharacterList);
    }
  }

  public async getCharacterSkin(characterName: string, playerId?: PlayerId) {
    let image: string;
    if (playerId === undefined) {
      image = (await import(`./images/characters/${characterName}.png`)).default;
      return { alt: characterName, src: image };
    }

    if (this.skinCharacterList.includes(characterName)) {
      const index: number = this.skinCharacterList.indexOf(characterName);
      const characterSkinInfo = gameSkinInfo[index];

      const newTime = new Date().getTime();
      let imagePath: string = '';
      for (const history of this.historyCharacterSkinInfo) {
        if (history.historyCharacterName === characterName && history.playerId === playerId) {
          if (newTime >= history.historyTime + (Math.random() * 5 + 5) * 1000) {
            const skinPath =
              characterSkinInfo.skinInfo[Math.floor(Math.random() * characterSkinInfo.skinInfo.length)].skinLocation;
            history.historySkinPath = './images/skins/' + skinPath;
            imagePath = history.historySkinPath;
            history.historyTime = newTime;
            break;
          } else {
            imagePath = history.historySkinPath;
          }
        }
      }
      // logic for not history skin
      if (imagePath === '') {
        imagePath =
          './images/skins/' +
          characterSkinInfo.skinInfo[Math.floor(Math.random() * characterSkinInfo.skinInfo.length)].skinLocation;
        const historyCharacterSkin: HistoryCharacterSkin = {
          playerId,
          historyCharacterName: characterName,
          historySkinPath: imagePath,
          historyTime: newTime,
        };

        this.historyCharacterSkinInfo.push(historyCharacterSkin);
      }
      console.log('imagePath is ' + imagePath);
      // ./images/skins/diaochan/1.png
      image = (await import(`${imagePath}`)).default;
    } else {
      // don't have skin
      image = (await import(`./images/characters/${characterName}.png`)).default;
    }

    return { alt: characterName, src: image };
  }
}
