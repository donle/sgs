import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain, shell } from 'electron';
import Extract from 'extract-zip';
import fetch from 'node-fetch';
import * as fs from 'original-fs';
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
export const GAME_EVENT_FLOW_REFRESH = 'gameEventFlowRefresh';
export const SAVE_REPLAY = 'saveReplay';
export const READ_REPLAY = 'readReplay';
export const DO_UPDATE = 'doUpdate';
export const REQUEST_CORE_VERSION = 'requestCoreVersion';
export const RESTART_CLIENT = 'restartClient';

app.setPath('userData', __dirname);
class AppWindow {
  public static readonly GameReleaseApi = 'https://gitee.com/api/v5/repos/doublebit/PicTest/releases/latest';
  public static onReady(callbackFn: () => void) {
    app.on('ready', callbackFn);
  }

  public static onWindowAllClosed(callbackFn: (e: Electron.Event) => void) {
    app.on('window-all-closed', callbackFn);
  }

  public static onActivate(callbackFn: () => void) {
    app.on('activate', callbackFn);
  }

  public static onClosing(callbackFn: (e: Electron.Event) => void) {
    app.on('before-quit', e => {
      if (continuouslyRequesting) {
        clearInterval(continuouslyRequesting);
      }
      if (syncUpdateStatusTimer) {
        clearInterval(syncUpdateStatusTimer);
      }
      callbackFn(e);
    });
  }

  private windowInstance: BrowserWindow | undefined;
  private store = new Store();
  private replay = new Replay();
  private translation = getTranslations(Language.ZH_CN);

  constructor(windowOptions?: BrowserWindowConstructorOptions) {
    this.windowInstance = new BrowserWindow(windowOptions);
    this.installIpcListener();
    // this.windowInstance.webContents.openDevTools();
    this.windowInstance.webContents.on('will-navigate', this.handleRedirect);
    this.windowInstance.webContents.on('new-window', this.handleRedirect);
  }

  private readonly handleRedirect = (e, url) => {
    if (url !== this.windowInstance!.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };

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

    ipcMain.on(GAME_EVENT_FLOW_REFRESH, () => {
      this.replay.clear();
    });

    ipcMain.on(SAVE_REPLAY, async () => {
      const savePath = dialog.showSaveDialogSync(this.windowInstance!, {
        filters: [{ name: 'DSanguosha Replay File', extensions: ['dsgs'] }],
        properties: ['createDirectory'],
      });
      if (!savePath) {
        return;
      }

      fs.writeFileSync(savePath, await this.replay.toString(), 'utf-8');
    });

    ipcMain.on(READ_REPLAY, async (event, clientCoreVersion: string) => {
      const filePath = dialog.showOpenDialogSync(this.windowInstance!, {
        filters: [{ name: 'DSanguosha Replay File', extensions: ['dsgs'] }],
        properties: ['openFile'],
      });
      if (!filePath || filePath.length === 0) {
        return;
      }

      const rawReplay = fs.readFileSync(filePath[0], 'utf-8');
      const parseReplay = (await this.replay.parse(rawReplay)) as { events: object[]; otherInfo: ReplayOtherInfo };
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

  public get Translations() {
    return this.translation;
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

let syncUpdateStatusTimer: NodeJS.Timeout;
let continuouslyRequesting: NodeJS.Timeout;
async function requestUpdate(window: BrowserWindow) {
  const requestCurrentVersion = new Promise<string>(resolve => {
    continuouslyRequesting = setInterval(() => window.webContents.send(REQUEST_CORE_VERSION), 3000);
    ipcMain.on(REQUEST_CORE_VERSION, (evt, currentVersion: string) => {
      clearInterval(continuouslyRequesting);
      resolve(currentVersion);
    });
  });

  const appPath = app.getPath('exe');
  const response = await fetch(AppWindow.GameReleaseApi).then(res => res.json());
  const nextVersion = response.tag_name.replace(/[^\d.]+/g, '');
  const currentVersion = await requestCurrentVersion;

  if (nextVersion !== currentVersion) {
    window.webContents.send(DO_UPDATE, { nextVersion, progress: 0 });
    AppWindow.onClosing(e => {
      dialog
        .showMessageBox(appInstance, {
          title: winApp.Translations.UpdateTitle,
          message: winApp.Translations.UpdateMessage,
          buttons: [winApp.Translations.Yes, winApp.Translations.Cancel],
          defaultId: 1,
        })
        .then(({ response }) => {
          if (response === 1) {
            e.preventDefault();
          }
        });
    });

    const downloadInfos = response.assets.filter(asset => asset.name && asset.name.includes('core')) as {
      browser_download_url: string;
      name: string;
    }[];
    if (downloadInfos.length === 0) {
      return;
    }

    let totalSize = 0;
    let currentSize = 0;
    syncUpdateStatusTimer = setInterval(() => {
      window.webContents.send(DO_UPDATE, { nextVersion, progress: currentSize / totalSize });
    }, 1000);
    for (const downloadInfo of downloadInfos) {
      const downloadUrl = `${downloadInfo.browser_download_url}/${downloadInfo.name}`;
      const dataStream = await fetch(downloadUrl).then(res => {
        totalSize += (res.headers.get('content-length') as unknown) as number;
        return res.body;
      });
      const downloadFile = fs.createWriteStream(path.join(appPath, '../update', downloadInfo.name));
      dataStream.pipe(downloadFile);
      dataStream.on('data', res => {
        currentSize += res.length;
      });
      dataStream.on('end', () => {
        clearInterval(syncUpdateStatusTimer);
        window.webContents.send(DO_UPDATE, { nextVersion, progress: 1, complete: true });
        // tslint:disable-next-line:no-empty
        AppWindow.onClosing(() => {});
      });
    }
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

  winAppInstance.setMenu(null);
  winAppInstance.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    }),
  );
  winApp.onClose(() => winApp.releaseInstance());
  return { winAppInstance, winApp };
}

function beforeLaunch(callback: Function) {
  const appPath = app.getPath('exe');
  const updateFolder = path.join(appPath, '../update');
  if (!fs.existsSync(updateFolder)) {
    fs.mkdirSync(updateFolder);
    return callback();
  } else {
    const updateZipFile = path.join(updateFolder, './core.zip');
    if (!fs.existsSync(updateZipFile)) {
      return callback();
    }

    Extract(updateZipFile, { dir: updateFolder })
      .then(() => {
        const destDirectory = path.join(appPath, '../resources/app.asar');
        const updateFile = path.join(updateFolder, './app.asar.bak');
        if (fs.existsSync(updateFile)) {
          fs.copyFileSync(updateFile, destDirectory);
          fs.unlinkSync(updateFile);
          fs.unlinkSync(updateZipFile);
        }
        callback();
      })
      .catch(err => {
        if (err) {
          if (fs.existsSync(updateZipFile)) {
            fs.unlinkSync(updateZipFile);
          }
          return callback(err);
        }
      });
  }
}

let appInstance: BrowserWindow;
let winApp: AppWindow;
AppWindow.onReady(() => {
  beforeLaunch(err => {
    const { winAppInstance, winApp: _winApp } = main();
    if (err) {
      dialog.showMessageBox(winAppInstance, {
        message: JSON.stringify(err),
      });
    }
    appInstance = winAppInstance;
    winApp = _winApp;
    requestUpdate(appInstance).then();
  });
});
AppWindow.onWindowAllClosed(() => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
