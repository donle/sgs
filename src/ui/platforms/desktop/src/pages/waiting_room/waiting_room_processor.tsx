import { activeWaitingRoomListeningEvents, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ClientTranslationModule } from 'core/translations/translation_module.client';

export class WaitingRoomProcessor {
  constructor(private socket: SocketIOClient.Socket, private translator: ClientTranslationModule) {}

  initWaitingRoomConnectionListeners() {
    activeWaitingRoomListeningEvents.forEach(identifier => {
      this.socket.on(identifier, (evt: WaitingRoomServerEventFinder<WaitingRoomEvent>) => {
        switch (identifier) {
          case WaitingRoomEvent.GameInfoUpdate:
            this.onGameInfoUpdate(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.GameInfoUpdate>);
            return;
          case WaitingRoomEvent.GameStart:
            this.onGameStart(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.GameStart>);
            return;
          case WaitingRoomEvent.PlayerChatMessage:
            this.onPlayerChat(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerChatMessage>);
            return;
          case WaitingRoomEvent.PlayerEnter:
            this.onPlayerEnter(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>);
            return;
          case WaitingRoomEvent.PlayerLeave:
            this.onPlayerLeave(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerLeave>);
            return;
          case WaitingRoomEvent.PlayerReady:
            this.onPlayerReady(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerReady>);
            return;
          case WaitingRoomEvent.RoomCreated:
            this.onRoomCreated(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.RoomCreated>);
            return;
          case WaitingRoomEvent.SeatDisabled:
            this.onSeatDisabled(evt as WaitingRoomServerEventFinder<WaitingRoomEvent.SeatDisabled>);
            return;
          default:
            throw Precondition.UnreachableError(identifier);
        }
      });
    });
  }

  private onPlayerEnter(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerEnter>) {}

  private onGameInfoUpdate(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.GameInfoUpdate>) {}

  private onGameStart(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.GameStart>) {}

  private onPlayerChat(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerChatMessage>) {}

  private onPlayerLeave(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerLeave>) {}

  private onPlayerReady(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerReady>) {}

  private onRoomCreated(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.RoomCreated>) {}

  private onSeatDisabled(evt: WaitingRoomServerEventFinder<WaitingRoomEvent.SeatDisabled>) {}
}
