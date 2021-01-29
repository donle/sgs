import { PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { GameMode } from 'core/shares/types/room_props';
import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { getSkillButtonImages } from './dev_button_image_loader';
import { ImageLoader } from './image_loader';

const remoteRoot: string = 'http://doublebit.gitee.io/pictest/backup_remote';

export class DevImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    return {
      src: `${remoteRoot}/images/cards/${name}.webp`,
      alt: name,
    };
  }

  public async getCharacterImage(characterName: string) {
    return {
      src: `${remoteRoot}/images/characters/${characterName}.png`,
      alt: characterName,
    };
  }

  public getCardBack() {
    return { src: `${remoteRoot}/images/cards/cardback.webp`, alt: 'New QSanguosha' };
  }

  getDelayedTricksImage(cardName: string) {
    return { src: `${remoteRoot}/images/delayed_tricks/${cardName}.png`, alt: cardName };
  }

  public getSkillButtonImage(skillType: SkillType, size: 'wide' | 'normal') {
    return getSkillButtonImages(skillType, size, remoteRoot);
  }

  public async getPlayerRoleCard(roleName: PlayerRole) {
    const roleText = Functional.getPlayerRoleRawText(roleName);
    return {
      src: `${remoteRoot}/images/system/death/${roleText}.png`,
      alt: roleText,
    };
  }
  public async getOthersEquipCard(cardName: string) {
    return { src: `${remoteRoot}/images/others_equips/${cardName}.png`, alt: cardName };
  }

  public getChainImage() {
    return { alt: '', src: `${remoteRoot}/images/system/chain.png` };
  }

  public getBackgroundImage() {
    return { alt: '', src: 'https://s1.ax1x.com/2020/06/20/NM7tQs.jpg' };
  }

  public getEmptySeatImage() {
    return { src: `${remoteRoot}/images/system/empty_seat.png`, alt: '' };
  }

  public getUnknownCharacterImage() {
    return { src: `${remoteRoot}/images/system/player_seat.png`, alt: '' };
  }

  public async getSlimEquipCard(cardName: string) {
    return { src: `${remoteRoot}/images/slim_equips/${cardName}.png`, alt: 'Slim Equip Card' };
  }

  public async getSlimCard(cardName: string) {
    return { src: `${remoteRoot}/images/slim_cards/${cardName}.png`, alt: 'Slim Card' };
  }

  public getCardNumberBgImage() {
    return { src: `${remoteRoot}/images/system/cardNumBg.png`, alt: '' };
  }

  public getTurnedOverCover() {
    return { src: `${remoteRoot}/images/system/turn_over.png`, alt: '' };
  }

  public getGameModeIcon(mode: GameMode) {
    return { src: '', alt: '' };
  }
  public getRandomLobbyIllustration() {
    return { src: '', alt: '' };
  }
  public getLobbyBackgroundImage() {
    return { src: '', alt: '' };
  }
  public getLobbyButtonImage(buttonVariant: LobbyButton) {
    return { src: '', alt: '' };
  }
  public getCreateRoomButtonImage() {
    return { src: '', alt: '' };
  }
  public getRoomListBackgroundImage() {
    return { src: '', alt: '' };
  }
  public getDialogBackgroundImage() {
    return { src: '', alt: '' };
  }
  public getAcknowledgementImage() {
    return { src: '', alt: '' };
  }
}
