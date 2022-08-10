import { WaitingRoomClientEventFinder, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';
import { ChatPacketObject } from 'services/connection_service/connection_service';

export class WaitingRoomSender {
  constructor(private socket: SocketIOClient.Socket) {}

  broadcast<I extends WaitingRoomEvent>(identifier: I, event: WaitingRoomClientEventFinder<I>) {
    this.socket.emit(identifier, event);
  }

  sendChat(from: string, message: string) {
    this.socket.emit(WaitingRoomEvent.PlayerChatMessage, {
      from,
      messageContent: message,
    });
  }

  onReceivingChatMessage(receiver: (msg: ChatPacketObject) => void) {
    this.socket.on(
      WaitingRoomEvent.PlayerChatMessage,
      (evt: WaitingRoomServerEventFinder<WaitingRoomEvent.PlayerChatMessage>) => {
        receiver({
          from: evt.from,
          message: evt.messageContent,
          timestamp: evt.timestamp,
        });
      },
    );
  }

  getReady(playerId: PlayerId, ready: boolean) {
    this.socket.emit(WaitingRoomEvent.PlayerReady, {
      readyPlayerId: playerId,
      isReady: ready,
    });
  }

  requestGameStart(roomInfo: WaitingRoomClientEventFinder<WaitingRoomEvent.GameStart>['roomInfo']) {
    this.socket.emit(WaitingRoomEvent.GameStart, { roomInfo });
  }

  kickPlayerOrCloseSeat(seatId: number, close: boolean, kickedPlayerId?: PlayerId) {
    const closeSeatEvent: WaitingRoomClientEventFinder<WaitingRoomEvent.SeatDisabled> = {
      seatId,
      disabled: close,
      kickedPlayerId,
    };

    this.socket.emit(WaitingRoomEvent.SeatDisabled, closeSeatEvent);
  }
}
