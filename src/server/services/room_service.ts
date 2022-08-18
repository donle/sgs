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
import { System } from 'core/shares/libs/system';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { WaitingRoomInfo } from 'core/shares/types/waiting_room_info';
import { WaitingRoomSocket } from 'server/channels/waiting_room';
import SocketIO from 'socket.io';

export class RoomService {
  private rooms: ServerRoom[] = [];
  private waitingRooms: WaitingRoomInfo[] = [];
  private waitingRoomMaps: Map<number | string, WaitingRoomSocket> = new Map();

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
      waitingRoomInfo: { roomInfo: TemporaryRoomCreationInfo; roomId: number },
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
      this.waitingRooms.find(room => room.roomId === roomId && !room.isPlaying) !== undefined
    );
  }

  getRoomsInfo(): ReadonlyArray<RoomInfo> {
    return [
      ...this.rooms.map(room => room.getRoomInfo()),
      ...this.waitingRooms.filter(room => !room.isPlaying).map(room => this.getWaitingRoomInfo(room)),
    ];
  }

  private getWaitingRoomInfo(room: WaitingRoomInfo): RoomInfo {
    const { roomInfo, players, roomId } = room;
    return {
      name: roomInfo.roomName,
      activePlayers: players.length,
      totalPlayers: roomInfo.numberOfPlayers,
      status: 'waiting',
      packages: roomInfo.characterExtensions,
      id: roomId,
      gameMode: roomInfo.gameMode,
      passcode: roomInfo.passcode,
    };
  }

  createRoom(
    gameInfo: GameInfo,
    roomInfo: TemporaryRoomCreationInfo & { roomId?: number },
    waitingRoomId: number,
  ): { roomId: RoomId; gameInfo: GameInfo } {
    const roomId = roomInfo.roomId || Date.now();
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
      { roomInfo, roomId: waitingRoomId },
    );

    room.onClosed(async () => {
      this.rooms = this.rooms.filter(r => r !== room);

      /**
       * To wait for players joining waiting room and room info being updated
       */
      await System.MainThread.sleep(1500);

      const waitingRoomIndex = this.waitingRooms.findIndex(r => r.roomId === room.WaitingRoomInfo.roomId);
      const waitingRoom = this.waitingRooms[waitingRoomIndex];

      if (waitingRoom?.players.length === 0) {
        this.waitingRooms.splice(waitingRoomIndex, 1);
        this.waitingRoomMaps.delete(waitingRoom.roomId);
      } else if (waitingRoom && waitingRoom.players.find(p => p.playerId === waitingRoom.hostPlayerId) == null) {
        this.waitingRoomMaps
          .get(waitingRoom.roomId)
          ?.reassigHost(waitingRoom.hostPlayerId, waitingRoom.players[0].playerId);
      }
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

  createWaitingRoom(roomInfo: TemporaryRoomCreationInfo & { roomId?: number }) {
    const room = this.createGameWaitingRoom(roomInfo, roomInfo.roomId || Date.now());
    const roomSocket = this.createWaitingRoomSocket(this.lobbySocket.of(`/waiting-room-${room.roomId}`), room);
    this.waitingRoomMaps.set(room.roomId, roomSocket);

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
