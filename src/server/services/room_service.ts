import { WorkPlace } from 'core/event/event';
import { GameProcessor } from 'core/game/game_processor/game_processor';
import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { ServerSocket } from 'core/network/socket.server';
import { RoomId } from 'core/room/room';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { Logger } from 'core/shares/libs/logger/logger';
import { System } from 'core/shares/libs/system';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { RoomInfo } from 'core/shares/types/server_types';
import { WaitingRoomInfo } from 'core/shares/types/waiting_room_info';
import { WaitingRoomSocket } from 'server/channels/waiting_room';
import SocketIO from 'socket.io';
import { RoomThread } from './room_thread';
import { ThreadManager } from './thread_manager';

export class RoomService {
  private rooms: ServerRoom[] = [];
  private waitingRooms: WaitingRoomInfo[] = [];
  private hostPlayerIps: Map<string, number> = new Map();
  private waitingRoomMaps: Map<number | string, WaitingRoomSocket> = new Map();

  constructor(
    private readonly mode: Flavor,
    private readonly lobbySocket: SocketIO.Server,
    private readonly logger: Logger,
  ) {}

  checkRoomExist(roomId: RoomId) {
    return (
      this.rooms.find(room => room.RoomId === roomId) !== undefined ||
      this.waitingRooms.find(room => room.roomId === roomId && !room.isPlaying) !== undefined
    );
  }

  getRoomsInfo(): readonly RoomInfo[] {
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
      allowObserver: !!roomInfo.allowObserver,
    };
  }

  createRoom(
    gameInfo: GameInfo,
    roomInfo: TemporaryRoomCreationInfo & { roomId?: number },
    waitingRoomId: number,
  ): { roomId: RoomId; gameInfo: GameInfo } {
    const roomId = roomInfo.roomId || Date.now();
    const roomSocket = new ServerSocket(this.lobbySocket.of(`/room-${roomId}`), roomId, this.logger);
    const roomThread = new RoomThread(this.mode, gameInfo, roomId, roomInfo, waitingRoomId);

    const roomWorker = ThreadManager.createRoomThread({ gameInfo, roomId, roomInfo, waitingRoomId, mode: this.mode });
    const room = new ServerRoom(
      Date.now(),
      gameInfo,
      roomSocket,
      this.createDifferentModeGameProcessor(gameInfo.gameMode),
      new RecordAnalytics(),
      [],
      gameInfo.flavor,
      this.logger,
      gameInfo.gameMode,
      new GameCommonRules(),
      new RoomEventStacker<WorkPlace.Server>(),
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

  createWaitingRoom(roomInfo: TemporaryRoomCreationInfo & { roomId: number }, hostIp: string) {
    const room = {
      roomId: roomInfo.roomId,
      roomInfo,
      closedSeats: [],
      players: [],
      hostPlayerId: roomInfo.hostPlayerId,
      isPlaying: false,
    };
    const roomSocket = new WaitingRoomSocket(
      this,
      this.lobbySocket.of(`/waiting-room-${room.roomId}`),
      this.mode,
      this.logger,
      room,
    );
    this.waitingRoomMaps.set(room.roomId, roomSocket);

    roomSocket.onClosed(() => {
      this.waitingRooms = this.waitingRooms.filter(r => r !== room);
      const createdRooms = this.hostPlayerIps.get(hostIp) || 0;
      if (createdRooms > 0) {
        this.hostPlayerIps.set(hostIp, createdRooms - 1);
      }
    });

    roomSocket.onGameStarting(() => {
      const createdRooms = this.hostPlayerIps.get(hostIp) || 0;
      if (createdRooms > 0) {
        this.hostPlayerIps.set(hostIp, createdRooms - 1);
      }
    });

    this.waitingRooms.push(room);
    const createdRooms = this.hostPlayerIps.get(hostIp) || 0;
    this.hostPlayerIps.set(hostIp, createdRooms + 1);

    return {
      roomId: room.roomId,
      roomInfo,
    };
  }

  isValidToCreateWaitingRoom(playerIp: string): boolean {
    return this.hostPlayerIps.get(playerIp) === undefined || this.hostPlayerIps.get(playerIp)! < 2;
  }
}
