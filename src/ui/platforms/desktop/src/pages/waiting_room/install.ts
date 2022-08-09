import { AudioLoader } from 'audio_loader/audio_loader';
import { GameInfo } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { RoomId } from 'core/room/room';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import { installAudioPlayerService } from 'ui/audio/install';
import { RoomAvatarService } from './services/avatar_service';
import { WaitingRoomSender } from './services/sender_service';
import { WaitingRoomPresenter } from './waiting_room.presenter';
import { WaitingRoomStore } from './waiting_room.store';
import { WaitingRoomProcessor } from './waiting_room_processor';

export function installServices(
  socket: SocketIOClient.Socket,
  translator: ClientTranslationModule,
  imageLoader: ImageLoader,
  audioLoader: AudioLoader,
  electronLoader: ElectronLoader,
  presenter: WaitingRoomPresenter,
  store: WaitingRoomStore,
  selfPlayerId: PlayerId,
  accessRejectedHandler: () => void,
  joinIntoTheGame: (roomId: RoomId, roomInfo: GameInfo) => void,
) {
  return {
    avatarService: new RoomAvatarService(imageLoader),
    roomProcessorService: new WaitingRoomProcessor(
      socket,
      translator,
      presenter,
      store,
      selfPlayerId,
      accessRejectedHandler,
      joinIntoTheGame,
    ),
    audioService: installAudioPlayerService(audioLoader, electronLoader),
    eventSenderService: new WaitingRoomSender(socket),
  };
}
