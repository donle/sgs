import { app, BrowserWindow, BrowserWindowConstructorOptions, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { Store } from './store';

const FLASH_WINDOW = 'flashWindow';
const SET_DATA = 'setData';
const GET_ALL_DATA = 'getAllData';
const DELETE_DATA = 'deleteData';

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
  constructor(windowOptions?: BrowserWindowConstructorOptions) {
    this.windowInstance = new BrowserWindow(windowOptions);
    this.installIpcListener();
    // this.windowInstance.webContents.openDevTools();
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
