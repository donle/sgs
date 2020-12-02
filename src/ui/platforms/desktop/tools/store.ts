// import { app } from 'electron';
import * as fs from 'fs';
// import * as path from 'path';

export class Store {
  private savFileDir: string = './savedata.json';
  private saveJson: any = {};
  constructor() {
    if (!fs.existsSync(this.savFileDir)) {
      fs.writeFileSync(this.savFileDir, '');
    } else {
      this.saveJson = JSON.parse(fs.readFileSync(this.savFileDir, 'utf-8'));
    }
  }

  public set<T = unknown>(key: string, value: T) {
    this.saveJson[key] = value;
    fs.writeFileSync(this.savFileDir, JSON.stringify(this.saveJson), 'utf-8');
  }

  public get<T = any>(key: string): T | unknown {
    return this.saveJson[key];
  }

  public remove(key: string) {
    delete this.saveJson[key];
  }
}
