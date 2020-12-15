import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';
import { getTranslations, Language } from './languages';
import { Replay, ReplayOtherInfo } from './replay';
import { Store } from './store';

export const FLASH_WINDOW = 'flashWindow';
export const SET_DATA = 'setData';
export const GET_ALL_DATA = 'getAllData';
export const DELETE_DATA = 'deleteData';

export const GAME_EVENT_FLOW = 'gameEventFlow';
export const SAVE_REPLAY = 'saveReplay';
export const READ_REPLAY = 'readReplay';

app.setPath('userData', __dirname);

class AppWindow {
  public static onReady(callbackFn: () => void) {
    app.on('ready', callbackFn);
  }

  public static onWindowAllClosed(callbackFn: () => void) {
    app.on('window-all-closed', callbackFn);
  }

  public static onActivate(callbackFn: () => void) {
    app.on('activate', callbackFn);
  }

  private windowInstance: BrowserWindow | undefined;
  private store = new Store();
  private replay = new Replay();
  private translation = getTranslations(Language.ZH_CN);

  constructor(windowOptions?: BrowserWindowConstructorOptions) {
    this.windowInstance = new BrowserWindow(windowOptions);
    this.installIpcListener();
    this.windowInstance.webContents.openDevTools();
  }

  private installIpcListener() {
    this.windowInstance!.once('focus', () => {
      this.windowInstance!.flashFrame(false);
    });

    ipcMain.on(FLASH_WINDOW, () => {
      if (this.windowInstance && !this.windowInstance.isFocused()) {
        this.windowInstance.flashFrame(true);
      }
    });

    ipcMain.on(SET_DATA, (event, { key, value }: { key: string; value: any }) => {
      this.store.set(key, value);
    });
    ipcMain.on(GET_ALL_DATA, () => {
      const saveData = this.store.getSaveData();
      this.windowInstance!.webContents.send(GET_ALL_DATA, saveData);
    });
    ipcMain.on(DELETE_DATA, (event, { key }: { key: string }) => {
      this.store.remove(key);
    });

    ipcMain.on(GAME_EVENT_FLOW, (event, content, otherInfo?: ReplayOtherInfo) => {
      this.replay.push(content);
      if (otherInfo) {
        this.replay.OtherInfo = otherInfo;
      }
    });

    ipcMain.on(SAVE_REPLAY, async () => {
      const savePath = dialog.showSaveDialogSync(this.windowInstance!, {
        filters: [{ name: 'DSanguosha Replay File', extensions: ['dsgs'] }],
        properties: ['createDirectory'],
      });
      if (!savePath) {
        return;
      }

      fs.writeFileSync(savePath, this.replay.toString(), 'utf-8');
    });

    ipcMain.on(READ_REPLAY, (event, clientCoreVersion: string) => {
      const filePath = dialog.showOpenDialogSync(this.windowInstance!, {
        filters: [{ name: 'DSanguosha Replay File', extensions: ['dsgs'] }],
        properties: ['openFile'],
      });
      if (!filePath || filePath.length === 0) {
        return;
      }

      const rawReplay = fs.readFileSync(filePath[0], 'utf-8');
      const parseReplay = this.replay.parse(rawReplay) as { events: object[]; otherInfo: ReplayOtherInfo };
      if (parseReplay.otherInfo.version !== clientCoreVersion) {
        dialog
          .showMessageBox(this.windowInstance!, {
            buttons: [this.translation.Yes, this.translation.Cancel],
            defaultId: 0,
            title: this.translation.MismatchVersionTitle,
            message: this.translation.MismatchVersionMessage(parseReplay.otherInfo.version, clientCoreVersion),
          })
          .then(({ response }) => {
            this.windowInstance!.webContents.send(
              READ_REPLAY,
              response === 0 ? { events: parseReplay.events, ...parseReplay.otherInfo } : undefined,
            );
          });
      } else {
        this.windowInstance!.webContents.send(READ_REPLAY, { events: parseReplay.events, ...parseReplay.otherInfo });
      }
    });
  }

  public getInstance() {
    return this.windowInstance!;
  }

  public releaseInstance() {
    this.windowInstance = undefined;
  }

  public onClose(callbackFn: () => void) {
    if (this.windowInstance === undefined) {
      return;
    }

    this.windowInstance.on('closed', () => {
      this.store.save();
      callbackFn();
    });
  }
}

export function main() {
  const winApp = new AppWindow({
    icon: path.join(__dirname, 'favicon.ico'),
    minWidth: 1366,
    minHeight: 768,
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
    },
  });
  const winAppInstance = winApp.getInstance();

  if (!winAppInstance) {
    return;
  }

  winAppInstance.setMenu(null);
  winAppInstance.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );
  winApp.onClose(() => winApp.releaseInstance());
  return winAppInstance;
}

let appInstance: BrowserWindow | undefined;
AppWindow.onReady(() => {
  appInstance = main();
});
AppWindow.onWindowAllClosed(() => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
AppWindow.onActivate(() => {
  if (!appInstance) {
    appInstance = main();
  }
});
