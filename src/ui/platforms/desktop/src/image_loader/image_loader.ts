import { PlayerRole } from 'core/player/player_props';
import { PlayerId } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import { SkillType } from 'core/skills/skill';
import { LobbyButton } from 'props/game_props';
import { ImageProps } from 'props/image_props';

export type SkillButtonImageSize = {
  wide: SkillButtonImageProps;
  normal: SkillButtonImageProps;
};

export type SkillButtonImageProps = {
  default: string;
  hover: string;
  down: string;
  disabled: string;
};

export interface ImageLoader {
  getCardImage(name: string): Promise<ImageProps>;
  getCharacterImage(name: string, roomId?: PlayerId | undefined): Promise<ImageProps>;
  getOthersEquipCard(cardName: string): Promise<ImageProps>;
  getSlimEquipCard(cardName: string): Promise<ImageProps>;
  getSlimCard(cardName: string): Promise<ImageProps>;
  getPlayerRoleCard(role: PlayerRole, gameMode: GameMode): Promise<ImageProps>;
  getCharacterSkinPlay(characterName: string, skinName?: string): Promise<ImageProps>;

  getSkillButtonImage(skillType: SkillType, size: 'wide' | 'normal'): SkillButtonImageProps | undefined;

  getCardBack(): ImageProps;
  getBackgroundImage(): ImageProps;
  getEmptySeatImage(): ImageProps;
  getUnknownCharacterImage(): ImageProps;
  getCardNumberBgImage(): ImageProps;
  getTurnedOverCover(): ImageProps;
  getChainImage(): ImageProps;
  getDelayedTricksImage(cardName: string): ImageProps;

  getGameLogBoradImage(): ImageProps;
  getDialogBackgroundImage(): ImageProps;
  getGameModeIcon(mode: GameMode): ImageProps;
  getRandomLobbyIllustration(): ImageProps;
  getLobbyBackgroundImage(): ImageProps;
  getLobbyButtonImage(buttonVariant: LobbyButton): ImageProps;
  getCreateRoomButtonImage(): ImageProps;
  getRoomListBackgroundImage(): ImageProps;
  getAcknowledgementImage(): ImageProps;
  getFeedbackImage(): ImageProps;
}
