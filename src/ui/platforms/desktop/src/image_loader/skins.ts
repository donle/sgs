import { PlayerId } from 'core/player/player_props';
export type CharacterSkinInfo = {
  character: string;
  infos: SkinInfo[];
};

export type SkinInfo = {
  quality: string;
  images: Images[];
  voices: Voices[];
};
export type Images = {
  name: string;
  illustrator: string;
  title: string;
  seat: string;
  big: string;
  origin: string;
};
export type Voices = {
  skill: string;
  detail: Location[];
};
export type Location = {
  location: string;
  lines: string;
};

export class SkinLoader {
  public async getCharacterSkinPlay(
    characterName: string,
    skinData: CharacterSkinInfo[],
    playerId?: PlayerId,
    skinName?: string,
  ) {
    let image: string;
    if (skinName !== characterName && skinData !== undefined) {
      const skin = skinData
        .find(skinInfo => skinInfo.character === characterName)
        ?.infos.find(skinInfo => skinInfo.images?.find(imagesInfo => imagesInfo.name === skinName));
      if (skin) {
        image = process.env.PUBLIC_URL + '/' + skin?.images.find(imagesInfo => imagesInfo.name === skinName)?.big;
      } else {
        image = (await import(`./images/characters/${characterName}.png`)).default;
      }
    } else {
      image = (await import(`./images/characters/${characterName}.png`)).default;
    }
    return { alt: characterName, src: image };
  }
}
