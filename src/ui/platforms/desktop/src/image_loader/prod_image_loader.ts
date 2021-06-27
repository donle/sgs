import { PlayerId, PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { GameMode } from 'core/shares/types/room_props';
import { SkillType } from 'core/skills/skill';
import { ImageLoader } from './image_loader';
import { getLobbyButtonImage, getSkillButtonImages } from './prod_button_image_loader';

import { LobbyButton } from 'props/game_props';
import cardBackImage from './images/cards/cardback.webp';
import BingLiangCunDuanIcon from './images/delayed_tricks/bingliangcunduan.png';
import LeBuSiShuIcon from './images/delayed_tricks/lebusishu.png';
import LightningIcon from './images/delayed_tricks/lightning.png';
import oneVersusTwoModeIcon from './images/lobby/1v2_mode.png';
import twoVersusTwoModeIcon from './images/lobby/2v2_mode.png';
import lobbyBackgroundImage from './images/lobby/background_autumn.png';
import createRoomImage from './images/lobby/create.png';
import generalModeIcon from './images/lobby/general_mode.png';
import hegemonyModeIcon from './images/lobby/hegemony_mode.png';
import roomListImage from './images/lobby/room_list.png';
import acknowledgementImage from './images/system/acknowledge.png';
import backgroundImage from './images/system/background.jpg';
import cardNumberBg from './images/system/cardNumBg.png';
import chainImage from './images/system/chain.png';
import dialogBackgroundImage from './images/system/dialog_background.png';
import emptySeatImage from './images/system/empty_seat.png';
import feedbackImage from './images/system/feedback.png';
import gameLogBoardImage from './images/system/game_log_board.png';
import unknownCharacterImage from './images/system/player_seat.png';
import turnedOverCoverImage from './images/system/turn_over.png';
import { CharacterSkinInfo } from 'skins/skins';

import illustraion1 from './images/lobby/illustration1.png';
import illustraion2 from './images/lobby/illustration2.png';
import illustraion3 from './images/lobby/illustration3.png';
import illustraion4 from './images/lobby/illustration4.png';
import illustraion5 from './images/lobby/illustration5.png';
import illustraion6 from './images/lobby/illustration6.png';
import illustraion7 from './images/lobby/illustration7.png';
import illustraion8 from './images/lobby/illustration8.png';

const gameModeIcons = {
  [GameMode.Standard]: generalModeIcon,
  [GameMode.OneVersusTwo]: oneVersusTwoModeIcon,
  [GameMode.TwoVersusTwo]: twoVersusTwoModeIcon,
  [GameMode.Hegemony]: hegemonyModeIcon,
};
const lobbyIllustrations = [
  illustraion1,
  illustraion2,
  illustraion3,
  illustraion4,
  illustraion5,
  illustraion6,
  illustraion7,
  illustraion8,
];

export class ProdImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    const image: string = (await import(`./images/cards/${name}.webp`)).default;
    return {
      alt: name,
      src: image,
    };
  }

  public getCardBack() {
    return { alt: 'New QSanguosha', src: cardBackImage };
  }

  public getBackgroundImage() {
    return { src: backgroundImage, alt: '' };
  }

  getUnknownCharacterImage() {
    return { src: unknownCharacterImage, alt: '' };
  }
  public getEmptySeatImage() {
    return { src: emptySeatImage, alt: '' };
  }

  public getCardNumberBgImage() {
    return { src: cardNumberBg, alt: '' };
  }

  getTurnedOverCover() {
    return { src: turnedOverCoverImage, alt: '' };
  }

  public getChainImage() {
    return { alt: '', src: chainImage };
  }

  public getDelayedTricksImage(cardName: string) {
    if (cardName === 'lebusishu') {
      return { alt: cardName, src: LeBuSiShuIcon };
    }
    if (cardName === 'bingliangcunduan') {
      return { alt: cardName, src: BingLiangCunDuanIcon };
    }
    if (cardName === 'lightning') {
      return { alt: cardName, src: LightningIcon };
    }

    return { alt: cardName };
  }

  public getSkillButtonImage(skillType: SkillType, size: 'wide' | 'normal') {
    return getSkillButtonImages(skillType, size);
  }

  public async getOthersEquipCard(cardName: string) {
    const image: string = (await import(`./images/others_equips/${cardName}.png`)).default;
    return { alt: cardName, src: image };
  }

  public async getPlayerRoleCard(role: PlayerRole, gameMode: GameMode) {
    const roleName = [GameMode.OneVersusTwo, GameMode.TwoVersusTwo].includes(gameMode)
      ? 'unknown'
      : Functional.getPlayerRoleRawText(role, gameMode);
    const image: string = (await import(`./images/system/death/${roleName}.png`)).default;
    return { src: image, alt: roleName };
  }

  public async getSlimEquipCard(cardName: string) {
    const image: string = (await import(`./images/slim_equips/${cardName}.png`)).default;
    return { alt: 'Slim Equip Card', src: image };
  }

  public async getSlimCard(cardName: string) {
    const image: string = (await import(`./images/slim_cards/${cardName}.png`)).default;
    return { alt: 'Slim Card', src: image };
  }

  public async getCharacterImage(characterName: string) {
    const image: string = (await import(`./images/characters/${characterName}.png`)).default;
    return { alt: characterName, src: image };
  }
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

  public getGameModeIcon(mode: GameMode) {
    return { src: gameModeIcons[mode], alt: '' };
  }
  public getRandomLobbyIllustration() {
    const index = Math.floor(Math.random() * lobbyIllustrations.length);
    return { src: lobbyIllustrations[index], alt: '' };
  }
  public getLobbyBackgroundImage() {
    return { src: lobbyBackgroundImage, alt: '' };
  }
  public getLobbyButtonImage(buttonVariant: LobbyButton) {
    return { src: getLobbyButtonImage(buttonVariant), alt: '' };
  }
  public getCreateRoomButtonImage() {
    return { src: createRoomImage, alt: '' };
  }
  public getRoomListBackgroundImage() {
    return { src: roomListImage, alt: '' };
  }
  public getDialogBackgroundImage() {
    return { src: dialogBackgroundImage, alt: '' };
  }
  public getAcknowledgementImage() {
    return { src: acknowledgementImage, alt: '' };
  }
  public getGameLogBoradImage() {
    return { src: gameLogBoardImage, alt: '' };
  }
  public getFeedbackImage() {
    return { src: feedbackImage, alt: '' };
  }
}
