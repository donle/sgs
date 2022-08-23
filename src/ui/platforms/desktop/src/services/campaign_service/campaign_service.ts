import { GameProcessor } from 'core/game/game_processor/game_processor';
import { OneVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.1v2';
import { TwoVersusTwoGameProcessor } from 'core/game/game_processor/game_processor.2v2';
import { PveLongshenGameProcessor } from 'core/game/game_processor/game_processor.pve_longshen';
import { PveClassicGameProcessor } from 'core/game/game_processor/game_processor.pve_classic';
import { StandardGameProcessor } from 'core/game/game_processor/game_processor.standard';
import { GameCardExtensions } from 'core/game/game_props';
import { TemporaryRoomCreationInfo } from 'core/game/game_props';
import { GameCommonRules } from 'core/game/game_rules';
import { RecordAnalytics } from 'core/game/record_analytics';
import { StageProcessor } from 'core/game/stage_processor';
import { LocalServerEmitter } from 'core/network/local/local_emitter.server';
import { ServerSocket } from 'core/network/socket.server';
import { ServerRoom } from 'core/room/room.server';
import { RoomEventStacker } from 'core/room/utils/room_event_stack';
import { ClientLogger } from 'core/shares/libs/logger/client_logger';
import { Flavor } from 'core/shares/types/host_config';
import { GameMode } from 'core/shares/types/room_props';
import { ClientFlavor, ServerHostTag } from 'props/config_props';
import { CreateGameListenerResponse } from 'services/connection_service/connection_service';

export class CampaignService {
  private campaginRooms: {
    [K: string]: ServerRoom;
  } = {};
  constructor(private logger: ClientLogger, private flavor: ClientFlavor) {}

  private readonly createDifferentModeGameProcessor = (
    roomInfo: {
      cardExtensions: GameCardExtensions[];
    } & TemporaryRoomCreationInfo,
  ): GameProcessor => {
    switch (roomInfo.gameMode) {
      case GameMode.Pve:
        if (roomInfo.numberOfPlayers <= 3) {
          return new PveLongshenGameProcessor(new StageProcessor(this.logger), this.logger);
        } else if (roomInfo.numberOfPlayers <= 5) {
          return new PveClassicGameProcessor(new StageProcessor(this.logger), this.logger);
        } else {
          throw new Error('Pve Player Number Abnormal ');
        }
      case GameMode.OneVersusTwo:
        return new OneVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.TwoVersusTwo:
        return new TwoVersusTwoGameProcessor(new StageProcessor(this.logger), this.logger);
      case GameMode.Standard:
      default:
        return new StandardGameProcessor(new StageProcessor(this.logger), this.logger);
    }
  };

  createRoom(
    flavor: ClientFlavor,
    roomInfo: TemporaryRoomCreationInfo,
    callback: (evt: CreateGameListenerResponse) => void,
  ) {
    const roomId = Date.now();
    const socket = new LocalServerEmitter((window as any).eventEmitter);
    const room = new ServerRoom(
      roomId,
      {
        ...roomInfo,
        campaignMode: !!roomInfo.campaignMode,
        flavor: this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
      },
      (socket as unknown) as ServerSocket,
      this.createDifferentModeGameProcessor(roomInfo),
      new RecordAnalytics(),
      [],
      this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
      this.logger,
      roomInfo.gameMode,
      new GameCommonRules(),
      new RoomEventStacker(),
      { roomInfo, roomId: 1 },
    );
    this.campaginRooms[roomId] = room;

    room.onClosed(() => {
      delete this.campaginRooms[roomId];
    });

    callback({
      packet: {
        roomId,
        roomInfo: {
          ...roomInfo,
          campaignMode: !!roomInfo.campaignMode,
          flavor: this.flavor === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod,
        },
      },
      hostTag: ServerHostTag.Localhost,
      ping: 0,
    });
  }
}
