import * as fs from 'fs';

export class Store {
  private savFileDir: string = './savedata.json';
  private saveJson: any = {};
  constructor() {
    if (!fs.existsSync(this.savFileDir)) {
      fs.writeFileSync(this.savFileDir, '{}');
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

  public get<T = any>(key: string): T | unknown {
    return this.saveJson[key];
  }

  public remove(key: string) {
    delete this.saveJson[key];
  }
}
