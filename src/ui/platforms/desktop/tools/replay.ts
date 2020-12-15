import * as crypto from 'crypto';

export type ReplayOtherInfo = {
  gameInfo: object;
  playersInfo: {
    Id: string;
    Name: string;
    Position: number;
  }[];
  roomId: number;
  viewerId: string;
  viewerName: string;
  version: string;
};

export class Replay {
  private gameEvents: object[] = [];
  private static readonly algorithm = 'aes-256-cbc';
  private static readonly key = '__sgs_replay_signature_algorithm';
  private static readonly iv = '__sgs_replay_iv_';
  private otherInfo: ReplayOtherInfo;

  public set OtherInfo(info: ReplayOtherInfo) {
    this.otherInfo = info;
  }

  public toString() {
    const cipher = crypto.createCipheriv(Replay.algorithm, Buffer.from(Replay.key), Replay.iv);
    let encryptedVersion = cipher.update(this.otherInfo.version);
    encryptedVersion = Buffer.concat([encryptedVersion, cipher.final()]);
    this.otherInfo.version = encryptedVersion.toString('hex');
    return JSON.stringify({
      events: this.gameEvents,
      otherInfo: this.otherInfo,
    });
  }

  public parse(rawData: string): object {
    const data = JSON.parse(rawData);
    const iv = Buffer.from(Replay.iv, 'utf-8');
    const encryptedText = Buffer.from(data.otherInfo.version, 'hex');
    const decipher = crypto.createDecipheriv(Replay.algorithm, Buffer.from(Replay.key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    data.otherInfo.version = decrypted.toString();
    return data;
  }

  public push<T extends object>(e: T) {
    this.gameEvents.push(e);
  }
}
