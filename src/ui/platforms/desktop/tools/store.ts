import { app } from 'electron';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export class Store {
  private savFileDir: string;

  private saveJson: any = {
    language: app.getLocale(),
  };
  constructor(saveDir: string) {
    if (process.platform === 'win32') {
      this.savFileDir = saveDir;
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      this.savFileDir = path.join(os.homedir(), 'sgs', saveDir);
    }

    if (!fs.existsSync(this.savFileDir)) {
      fs.writeFileSync(this.savFileDir, JSON.stringify(this.saveJson));
    } else {
      this.saveJson = JSON.parse(fs.readFileSync(this.savFileDir, 'utf-8'));
    }
  }

  public getSaveData() {
    return this.saveJson;
  }

  public set<T = unknown>(key: string, value: T) {
    this.saveJson[key] = value;
  }

  public save() {
    fs.writeFileSync(this.savFileDir, JSON.stringify(this.saveJson), 'utf-8');
  }

  public get<T = any>(key: string): T | undefined {
    return this.saveJson[key];
  }

  public remove(key: string) {
    delete this.saveJson[key];
  }
}
