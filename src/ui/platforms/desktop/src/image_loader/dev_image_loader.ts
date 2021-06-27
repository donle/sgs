import { PlayerRole } from 'core/player/player_props';
import { PlayerId } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { GameMode } from 'core/shares/types/room_props';
import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { getSkillButtonImages } from './dev_button_image_loader';
import { getLobbyButtonImage } from './dev_button_image_loader';
import { ImageLoader } from './image_loader';
import { SkinLoader, CharacterSkinInfo } from './skins';

const remoteRoot: string = 'http://doublebit.gitee.io/pictest/backup_remote';

const gameModeIcons = {
  [GameMode.Standard]: 'general_mode',
  [GameMode.OneVersusTwo]: '1v2_mode',
  [GameMode.TwoVersusTwo]: '2v2_mode',
  [GameMode.Hegemony]: 'hegemony_mode',
  [GameMode.Pve]: 'pve_mode',
};

export class DevImageLoader implements ImageLoader {
  private skinLoader: SkinLoader = new SkinLoader();
  public async getCardImage(name: string) {
    return {
      src: `${remoteRoot}/images/cards/${name}.webp`,
      alt: name,
    };
  }
  public async getCharacterSkinPlay(
    characterName: string,
    skinData: CharacterSkinInfo[],
    playerId?: PlayerId,
    skinName?: string,
  ) {
    return this.skinLoader.getCharacterSkinPlay(characterName, skinData, playerId, skinName);
  }
  public async getCharacterImage(characterName: string) {
    const image: string = (await import(`./images/characters/${characterName}.png`)).default;
    return { alt: characterName, src: image };
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

  public async getPlayerRoleCard(roleName: PlayerRole, gameMode: GameMode) {
    const roleText = Functional.getPlayerRoleRawText(roleName, gameMode);
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
    return { src: `${remoteRoot}/images/lobby/${gameModeIcons[mode]}.png`, alt: '' };
  }

  public getRandomLobbyIllustration() {
    const index = Math.floor(Math.random() * 8) + 1;
    return { src: `${remoteRoot}/images/lobby/illustration${index}.png`, alt: '' };
  }

  public getLobbyBackgroundImage() {
    return { src: `${remoteRoot}/images/lobby/background.png`, alt: '' };
  }

  public getLobbyButtonImage(buttonVariant: LobbyButton) {
    return { src: getLobbyButtonImage(buttonVariant, remoteRoot), alt: '' };
  }

  public getCreateRoomButtonImage() {
    return { src: `${remoteRoot}/images/lobby/create.png`, alt: '' };
  }

  public getRoomListBackgroundImage() {
    return { src: `${remoteRoot}/images/lobby/room_list.png`, alt: '' };
  }

  public getDialogBackgroundImage() {
    return { src: `${remoteRoot}/images/system/dialog_background.png`, alt: '' };
  }

  public getAcknowledgementImage() {
    return { src: `${remoteRoot}/images/system/acknowledge.png`, alt: '' };
  }
  public getGameLogBoradImage() {
    return { src: `${remoteRoot}/images/system/game_log_board.png`, alt: '' };
  }
  public getFeedbackImage() {
    return { src: `${remoteRoot}/images/system/feedback.png`, alt: '' };
  }
}
