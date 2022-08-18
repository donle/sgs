import { WaitingRoomClientEventFinder, WaitingRoomEvent, WaitingRoomServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { WaitingRoomGameSettings } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { ChatPacketObject } from 'services/connection_service/connection_service';
export class WaitingRoomSender {
  constructor(private socket: SocketIOClient.Socket) {}

  broadcast<I extends WaitingRoomEvent>(identifier: I, event: WaitingRoomClientEventFinder<I>) {
    this.socket.emit(identifier, event);
  }

  saveSettings(settings: WaitingRoomGameSettings) {
    this.socket.emit(WaitingRoomEvent.GameInfoUpdate, { roomInfo: settings });
  }

  sendChat(from: string, message: string) {
    this.socket.emit(WaitingRoomEvent.PlayerChatMessage, {
      from,
      messageContent: message,
    });
  }

  giveHostTo(from: PlayerId, to: PlayerId) {
    this.socket.emit(WaitingRoomEvent.ChangeHost, { prevHostPlayerId: from, newHostPlayerId: to });
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

  enterRoom(playerId: PlayerId, avatarId: number, playerName: string, isHost: boolean) {
    this.socket.emit(WaitingRoomEvent.PlayerEnter, {
      playerInfo: { playerId, avatarId, playerName },
      isHost,
      coreVersion: Sanguosha.Version,
    });
  }

  leaveRoom(playerId: PlayerId) {
    this.socket.emit(WaitingRoomEvent.PlayerLeave, {
      leftPlayerId: playerId,
    });
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
