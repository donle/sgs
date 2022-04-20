import { WaitingRoomClientEventFinder, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { PlayerId } from 'core/player/player_props';

export class WaitingRoomSender {
  constructor(private socket: SocketIOClient.Socket) {}

  broadcast<I extends WaitingRoomEvent>(identifier: I, event: WaitingRoomClientEventFinder<I>) {
    this.socket.emit(identifier, event);
  }

  sendChat(from: PlayerId, message: string) {
    this.socket.emit(WaitingRoomEvent.PlayerChatMessage, {
      fromId: from,
      messageContent: message,
    });
  }

  kickPlayerOrCloseSeat(seatId: number, close: boolean) {
    const closeSeatEvent: WaitingRoomClientEventFinder<WaitingRoomEvent.SeatDisabled> = {
      seatId,
      disabled: close,
    };

    this.socket.emit(WaitingRoomEvent.SeatDisabled, closeSeatEvent);
  }
}
