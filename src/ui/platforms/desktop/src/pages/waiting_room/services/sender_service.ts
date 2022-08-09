import { WaitingRoomClientEventFinder, WaitingRoomEvent } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';

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

  kickPlayerOrCloseSeat(seatId: number, close: boolean, kickedPlayerId?: PlayerId) {
    const closeSeatEvent: WaitingRoomClientEventFinder<WaitingRoomEvent.SeatDisabled> = {
      seatId,
      disabled: close,
      kickedPlayerId,
    };

    this.socket.emit(WaitingRoomEvent.SeatDisabled, closeSeatEvent);
  }
}
