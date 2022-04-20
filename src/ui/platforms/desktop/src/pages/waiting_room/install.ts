import { AudioLoader } from 'audio_loader/audio_loader';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { ImageLoader } from 'image_loader/image_loader';
import { installAudioPlayerService } from 'ui/audio/install';
import { RoomAvatarService } from './services/avatar_service';
import { WaitingRoomSender } from './services/sender_service';
import { WaitingRoomProcessor } from './waiting_room_processor';

export function installServices(
  socket: SocketIOClient.Socket,
  translator: ClientTranslationModule,
  imageLoader: ImageLoader,
  audioLoader: AudioLoader,
  electronLoader: ElectronLoader,
) {
  return {
    avatarService: new RoomAvatarService(imageLoader),
    roomProcessorService: new WaitingRoomProcessor(socket, translator),
    audioService: installAudioPlayerService(audioLoader, electronLoader),
    eventSenderService: new WaitingRoomSender(socket),
  };
}
