import { app, BrowserWindow, BrowserWindowConstructorOptions, protocol } from 'electron';
import * as MouseTrap from 'mousetrap';
import * as path from 'path';
import * as url from 'url';

app.setPath('userData', __dirname);

app.whenReady().then(() => {
  // tslint:disable-next-line:no-empty
  MouseTrap.bind(['command+r', 'ctrl+r'], () => {});
  // tslint:disable-next-line:no-empty
  MouseTrap.bind(['f5'], () => {});
});

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
  constructor(windowOptions?: BrowserWindowConstructorOptions) {
    this.windowInstance = new BrowserWindow(windowOptions);
  }

  public getInstance() {
    return this.windowInstance;
  }

  public releaseInstance() {
    this.windowInstance = undefined;
  }

  public onClose(callbackFn: () => void) {
    if (this.windowInstance === undefined) {
      return;
    }

    this.windowInstance.on('closed', callbackFn);
  }
}

export function main(env = process.env.NODE_ENV || 'development') {
  const WEB_FOLDER = 'web';
  const PROTOCOL = 'file';

  protocol.interceptFileProtocol(PROTOCOL, (request, callback) => {
    let url = request.url.substr(PROTOCOL.length + 1);
    url = path.join(__dirname, WEB_FOLDER, url);
    url = path.normalize(url);
    callback(url);
  });

  const winApp = new AppWindow({
    minWidth: 768,
    minHeight: 600,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
    },
  });
  const winAppInstance = winApp.getInstance();

  if (!winAppInstance) {
    return;
  }

  winAppInstance.webContents.openDevTools();
  winAppInstance.setMenu(null);
  env === 'development'
    ? winAppInstance.loadURL('http://localhost:3000/')
    : winAppInstance.loadURL(
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
