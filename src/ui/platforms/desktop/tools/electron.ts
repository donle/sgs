import { app, BrowserWindow, BrowserWindowConstructorOptions, dialog, ipcMain, shell } from 'electron';
import Extract from 'extract-zip';
import fetch from 'node-fetch';
import * as fs from 'original-fs';
import * as os from 'os';
import * as path from 'path';
import * as url from 'url';
import { FileSplitter } from './file_splitter';
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

type Flavor = 'dev' | 'prod';
function formatFlavor(flavor: string | undefined): Flavor {
  if (flavor === 'development') {
    return 'dev';
  } else if (flavor === 'production') {
    return 'prod';
  }

  return 'prod';
}
const flavor = formatFlavor(process.env.NODE_ENV);
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
  private store = new Store('./savedata.json');
  private replay = new Replay();
  private translation = getTranslations(this.store.get<Language>('language'));

  constructor(windowOptions?: BrowserWindowConstructorOptions) {
    this.windowInstance = new BrowserWindow(windowOptions);
    this.installIpcListener();
    if (flavor === 'dev') {
      this.windowInstance.webContents.openDevTools();
    }
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

    ipcMain.on(GAME_EVENT_FLOW, (event, props: { event: any; otherInfo: ReplayOtherInfo }) => {
      this.replay.push(props.event);
      if (props.otherInfo && !this.replay.OtherInfo) {
        this.replay.OtherInfo = props.otherInfo;
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
        dialog.showMessageBox(this.windowInstance!, {
          defaultId: 0,
          title: this.translation.ReplayFile,
          message: this.translation.ReadReplayExceptions(Replay.ErrorCode.FileNotFound),
        });

        return;
      }

      const rawReplay = fs.readFileSync(filePath[0], 'utf-8');
      try {
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
      } catch {
        dialog.showMessageBox(this.windowInstance!, {
          defaultId: 0,
          title: this.translation.ReplayFile,
          message: this.translation.ReadReplayExceptions(Replay.ErrorCode.FileUnparsable),
        });
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

    for (let i = 0; i < downloadInfos.length; i++) {
      const downloadInfo = downloadInfos[i];
      await downloadFile(window, nextVersion, downloadInfo, i + 1, downloadInfos.length);
    }

    // tslint:disable-next-line:no-empty
    AppWindow.onClosing(() => {});
  }
}

async function downloadFile(
  window: BrowserWindow,
  downloadVersion: string,
  downloadInfo: {
    browser_download_url: string;
    name: string;
  },
  currentDownload: number,
  totalDownloads: number,
) {
  const appPath = app.getPath('exe');

  let totalSize = 0;
  let currentSize = 0;
  syncUpdateStatusTimer = setInterval(() => {
    window.webContents.send(DO_UPDATE, {
      nextVersion: downloadVersion,
      progress: currentSize / totalSize,
      totalFiles: totalDownloads,
    });
  }, 1000);

  const downloadUrl = `${downloadInfo.browser_download_url}/${downloadInfo.name}`;
  const dataStream = await fetch(downloadUrl).then(res => {
    totalSize += (res.headers.get('content-length') as unknown) as number;
    return res.body;
  });

  return new Promise<void>(resolve => {
    const downloadFile = fs.createWriteStream(path.join(appPath, '../update', downloadInfo.name));
    dataStream.pipe(downloadFile);
    dataStream.on('data', res => {
      currentSize += res.length;
    });
    dataStream.on('end', () => {
      clearInterval(syncUpdateStatusTimer);
      window.webContents.send(DO_UPDATE, {
        nextVersion: downloadVersion,
        progress: 1,
        complete: true,
        downloadingFile: currentDownload,
        totalFiles: totalDownloads,
      });

      resolve();
    });
  });
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
    flavor === 'dev'
      ? 'http://localhost:3000'
      : url.format({
          pathname: path.join(__dirname, './index.html'),
          protocol: 'file:',
          slashes: true,
        }),
  );
  winApp.onClose(() => winApp.releaseInstance());
  return { winAppInstance, winApp };
}

async function mergeFiles(downloadDir: string) {
  const files = fs.readdirSync(downloadDir);
  if (files.length > 0) {
    await FileSplitter.mergeFiles(
      files.map(file => path.join(downloadDir, file)),
      path.join(downloadDir, 'core.zip'),
    );
  }

  return files;
}

async function beforeLaunchOnWindows() {
  const appPath = app.getPath('exe');
  const updateFolder = path.join(appPath, '../update');
  if (!fs.existsSync(updateFolder)) {
    fs.mkdirSync(updateFolder);
    return;
  } else {
    await mergeFiles(updateFolder);

    const updateZipFile = path.join(updateFolder, './core.zip');
    if (!fs.existsSync(updateZipFile)) {
      return;
    }

    await Extract(updateZipFile, { dir: updateFolder });

    const destDirectory = path.join(appPath, '../resources/app.asar');
    const updateFile = path.join(updateFolder, './app.asar.bak');
    fs.copyFileSync(updateFile, destDirectory);

    const files = fs.readdirSync(updateFolder);
    for (const file of files) {
      fs.unlinkSync(path.join(updateFolder, file));
    }
  }
}

async function beforeLaunchOnMac() {
  const homePath = path.join(os.homedir(), 'sgs');
  if (!fs.existsSync(homePath)) {
    fs.mkdirSync(homePath);
  }
  // Auto update is not available on Mac
}

async function beforeLaunch() {
  if (process.platform === 'win32') {
    return beforeLaunchOnWindows();
  } else if (process.platform === 'darwin' || process.platform === 'linux') {
    return beforeLaunchOnMac();
  }
}

let appInstance: BrowserWindow;
let winApp: AppWindow;
AppWindow.onReady(async () => {
  try {
    await beforeLaunch();
  } catch (e) {
    dialog.showMessageBox({
      message: JSON.stringify(e),
    });
  }

  const { winAppInstance, winApp: _winApp } = main();
  appInstance = winAppInstance;
  winApp = _winApp;
  requestUpdate(appInstance).then();
});
AppWindow.onWindowAllClosed(() => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
