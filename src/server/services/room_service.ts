import { WorkPlace } from 'core/event/event';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ServerSocket } from 'core/network/socket.server';
import { Player } from 'core/player/player';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { WaitingRoomInfo } from 'core/room/waiting_room';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { WaitingRoomSocket } from 'server/channels/waiting_room';
import SocketIO from 'socket.io';

export class RoomService {
  private rooms: ServerRoom[] = [];
  private waitingRooms: WaitingRoomInfo[] = [];

  constructor(
    private readonly lobbySocket: SocketIO.Server,
    private createGameServerSocket: (roomChannel: SocketIO.Namespace, roomId: RoomId) => ServerSocket,
    private createServerRoom: (
      roomId: RoomId,
      gameInfo: GameInfo,
      socket: ServerSocket,
      gameProcessor: GameProcessor,
      analytics: RecordAnalytics,
      players: Player[],
      flavor: Flavor,
      gameMode: GameMode,
      gameCommonRules: GameCommonRules,
      eventStack: RoomEventStacker<WorkPlace.Server>,
    ) => ServerRoom,
    private createRecordAnalytics: () => RecordAnalytics,
    private createGameCommonRules: () => GameCommonRules,
    private createRoomEventStacker: () => RoomEventStacker<WorkPlace.Server>,
    private createGameWaitingRoom: (info: TemporaryRoomCreationInfo, roomId: RoomId) => WaitingRoomInfo,
    private createWaitingRoomSocket: (socket: SocketIO.Namespace, roomInfo: WaitingRoomInfo) => WaitingRoomSocket,
    private createDifferentModeGameProcessor: (gameMode: GameMode) => GameProcessor,
  ) {}

  checkRoomExist(roomId: RoomId) {
    return (
      this.rooms.find(room => room.RoomId === roomId) !== undefined ||
      this.waitingRooms.find(room => room.roomId === roomId) !== undefined
    );
  }

  getRoomsInfo(): ReadonlyArray<RoomInfo> {
    return [
      ...this.rooms.map(room => room.getRoomInfo()),
      ...this.waitingRooms.map(room => this.getWaitingRoomInfo(room)),
    ];
  }

  private getWaitingRoomInfo(room: WaitingRoomInfo): RoomInfo {
    const { roomInfo, players, closedSeats, roomId } = room;
    return {
      name: roomInfo.roomName,
      activePlayers: players.length,
      totalPlayers: roomInfo.numberOfPlayers - closedSeats.length,
      status: 'waiting',
      packages: roomInfo.characterExtensions,
      id: roomId,
      gameMode: roomInfo.gameMode,
      passcode: roomInfo.passcode,
    };
  }

  createRoom(gameInfo: GameInfo): { roomId: RoomId; gameInfo: GameInfo } {
    const roomId = Date.now();
    const roomSocket = this.createGameServerSocket(this.lobbySocket.of(`/room-${roomId}`), roomId);
    const room = this.createServerRoom(
      roomId,
      gameInfo,
      roomSocket,
      this.createDifferentModeGameProcessor(gameInfo.gameMode),
      this.createRecordAnalytics(),
      [],
      gameInfo.flavor,
      gameInfo.gameMode,
      this.createGameCommonRules(),
      this.createRoomEventStacker(),
    );

    room.onClosed(() => {
      this.rooms = this.rooms.filter(r => r !== room);
    });

    this.rooms.push(room);

    return {
      roomId,
      gameInfo: {
        ...gameInfo,
        campaignMode: !!gameInfo.campaignMode,
      },
    };
  }

  createWaitingRoom(roomInfo: TemporaryRoomCreationInfo) {
    const room = this.createGameWaitingRoom(roomInfo, Date.now());
    const roomSocket = this.createWaitingRoomSocket(this.lobbySocket.of(`/waiting-room-${room.roomId}`), room);

    roomSocket.onClosed(() => {
      this.waitingRooms = this.waitingRooms.filter(r => r !== room);
    });

    this.waitingRooms.push(room);

    return {
      roomId: room.roomId,
      roomInfo,
    };
  }
}
