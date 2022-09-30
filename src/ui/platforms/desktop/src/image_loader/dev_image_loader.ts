import { CharacterEquipSections } from 'core/characters/character';
import { PlayerRole } from 'core/player/player_props';
import { PlayerId } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { GameMode } from 'core/shares/types/room_props';
import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { CharacterSkinInfo } from 'skins/skins';
import { getSkillButtonImages } from './dev_button_image_loader';
import { getLobbyButtonImage } from './dev_button_image_loader';
import { ImageLoader } from './image_loader';

const baseHost: string = '/cdn';
const cosRepo: string = 'https://sgs-static-1256205614.cos.ap-nanjing.myqcloud.com/backup_remote';

const gameModeIcons = {
  [GameMode.Standard]: 'general_mode',
  [GameMode.OneVersusTwo]: '1v2_mode',
  [GameMode.TwoVersusTwo]: '2v2_mode',
  [GameMode.Hegemony]: 'hegemony_mode',
  [GameMode.Pve]: 'pve_mode',
};

export class DevImageLoader implements ImageLoader {
  public async getCardImage(name: string) {
    return {
      src: `${cosRepo}/images/cards/${name}.webp`,
      alt: name,
    };
  }

  public async getCharacterSkinPlay(
    characterName: string,
    skinData?: CharacterSkinInfo[],
    playerId?: PlayerId,
    skinName?: string,
  ) {
    return {
      src: `${baseHost}/images/characters/${characterName}.png`,
      alt: characterName,
    };
  }

  public async getCharacterImage(characterName: string) {
    return {
      src: `${baseHost}/images/characters/${characterName}.png`,
      alt: characterName,
    };
  }

  public getCardBack() {
    return { src: `${cosRepo}/images/cards/cardback.webp`, alt: 'New QSanguosha' };
  }

  getDelayedTricksImage(cardName: string) {
    return { src: `${cosRepo}/images/delayed_tricks/${cardName}.png`, alt: cardName };
  }

  public getSkillButtonImage(skillType: SkillType, size: 'wide' | 'normal') {
    return getSkillButtonImages(skillType, size, cosRepo);
  }

  public async getPlayerRoleCard(role: PlayerRole, gameMode: GameMode, selfRole?: PlayerRole) {
    const roleName =
      gameMode === GameMode.TwoVersusTwo && selfRole !== undefined
        ? role === selfRole
          ? 'ally'
          : 'enemy'
        : Functional.getPlayerRoleRawText(role, gameMode);

    return {
      src: `${cosRepo}/images/system/death/${roleName}.png`,
      alt: roleName,
    };
  }

  public async getOthersEquipCard(cardName: string) {
    return { src: `${cosRepo}/images/others_equips/${cardName}.png`, alt: cardName };
  }
  public async getOthersAbortedEquipCard() {
    return { src: `${cosRepo}/images/slim_equips/aborted.png`, alt: 'aborted' };
  }

  public getChainImage() {
    return { alt: '', src: `${cosRepo}/images/system/chain.png` };
  }

  public getBackgroundImage() {
    return { alt: '', src: 'https://s1.ax1x.com/2020/06/20/NM7tQs.jpg' };
  }

  public getWaitingRoomBackgroundImage() {
    return { alt: '', src: `${cosRepo}/images/system/waiting_room_background.jpg` };
  }

  public getEmptySeatImage() {
    return { src: `${cosRepo}/images/system/empty_seat.png`, alt: '' };
  }

  public getUnknownCharacterImage() {
    return { src: `${cosRepo}/images/system/player_seat.png`, alt: '' };
  }

  public async getSlimAbortedEquipSection(section: CharacterEquipSections) {
    let sectionName: string | undefined;
    switch (section) {
      case CharacterEquipSections.Weapon:
        sectionName = 'aborted_weapon';
        break;
      case CharacterEquipSections.Shield:
        sectionName = 'aborted_shield';
        break;
      case CharacterEquipSections.DefenseRide:
        sectionName = 'aborted_defense_ride';
        break;
      case CharacterEquipSections.OffenseRide:
        sectionName = 'aborted_offense_ride';
        break;
      case CharacterEquipSections.Precious:
        sectionName = 'aborted_precious';
        break;
      default:
        throw Precondition.UnreachableError(section);
    }

    const image: string = (await import(`${cosRepo}/images/slim_equips/${sectionName}.png`)).default;
    return { alt: 'Aborted Slim Equip Card', src: image };
  }

  public async getSlimEquipCard(cardName: string) {
    return { src: `${cosRepo}/images/slim_equips/${cardName}.png`, alt: 'Slim Equip Card' };
  }

  public async getSlimCard(cardName: string) {
    return { src: `${cosRepo}/images/slim_cards/${cardName}.png`, alt: 'Slim Card' };
  }

  public getCardNumberBgImage() {
    return { src: `${cosRepo}/images/system/cardNumBg.png`, alt: '' };
  }

  public getTurnedOverCover() {
    return { src: `${cosRepo}/images/system/turn_over.png`, alt: '' };
  }

  public getGameModeIcon(mode: GameMode) {
    return { src: `${cosRepo}/images/lobby/${gameModeIcons[mode]}.png`, alt: '' };
  }

  public getRandomLobbyIllustration() {
    const index = Math.floor(Math.random() * 8) + 1;
    return { src: `${cosRepo}/images/lobby/illustration${index}.png`, alt: '' };
  }

  public getLobbyBackgroundImage() {
    return { src: `${cosRepo}/images/lobby/background.png`, alt: '' };
  }

  public getLobbyButtonImage(buttonVariant: LobbyButton) {
    return { src: getLobbyButtonImage(buttonVariant, cosRepo), alt: '' };
  }

  public getCreateRoomButtonImage() {
    return { src: `${cosRepo}/images/lobby/create.png`, alt: '' };
  }

  public getRoomListBackgroundImage() {
    return { src: `${cosRepo}/images/lobby/room_list.png`, alt: '' };
  }

  public getDialogBackgroundImage() {
    return { src: `${cosRepo}/images/system/dialog_background.png`, alt: '' };
  }

  public getAcknowledgementImage() {
    return { src: `${cosRepo}/images/system/acknowledge.png`, alt: '' };
  }
  public getGameLogBoradImage() {
    return { src: `${cosRepo}/images/system/game_log_board.png`, alt: '' };
  }
  public getFeedbackImage() {
    return { src: `${cosRepo}/images/system/feedback.png`, alt: '' };
  }
}
