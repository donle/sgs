import { GameInfo, TemporaryRoomCreationInfo } from 'core/game/game_props';
import { RoomId } from 'core/room/room';
import { Flavor } from 'core/shares/types/host_config';
import { Worker } from 'worker_threads';

export type RoomThreadOptions = {
  mode: Flavor;
  gameInfo: GameInfo;
  roomId: RoomId;
  roomInfo: TemporaryRoomCreationInfo & { roomId?: number };
  waitingRoomId: number;
};

export class ThreadManager {
  private static threads: Promise<Worker>[] = [];
  public static createRoomThread(opts: RoomThreadOptions) {
    const thread = new Promise<Worker>((resolve, reject) => {
      const worker = new Worker('./services/room_thread.js', { workerData: opts });
      worker.on('message', resolve);
      worker.on('error', reject);

      worker.on('exit', code => {
        if (code !== 0) {
          reject(new Error(`stopped with ${code} exit code`));
        }
      });

      return worker;
    });

    this.threads.push(thread);

    return thread;
  }
}
