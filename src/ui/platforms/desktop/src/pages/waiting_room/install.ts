import { RoomAvatarService } from './services/avatar_service';
import { WaitingRoomSender } from './services/sender_service';
import { WaitingRoomPresenter } from './waiting_room.presenter';
import { WaitingRoomStore } from './waiting_room.store';
import { WaitingRoomProcessor } from './waiting_room_processor';
import { AudioLoader } from 'audio_loader/audio_loader';
import { GameInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import { installAudioPlayerService } from 'ui/audio/install';

export function installServices(
  socket: SocketIOClient.Socket,
  translator: ClientTranslationModule,
  imageLoader: ImageLoader,
  audioLoader: AudioLoader,
  electronLoader: ElectronLoader,
  presenter: WaitingRoomPresenter,
  store: WaitingRoomStore,
  selectedPlayerName: string,
  accessRejectedHandler: () => void,
  joinIntoTheGame: (roomId: RoomId, roomInfo: GameInfo) => void,
) {
  const avatarService = new RoomAvatarService(imageLoader);
  return {
    avatarService,
    roomProcessorService: new WaitingRoomProcessor(
      socket,
      avatarService,
      translator,
      electronLoader,
      presenter,
      store,
      selectedPlayerName,
      accessRejectedHandler,
      joinIntoTheGame,
    ),
    audioService: installAudioPlayerService(audioLoader, electronLoader),
    eventSenderService: new WaitingRoomSender(socket),
  };
}
