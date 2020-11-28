import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
// import * as MouseTrap from 'mousetrap';
import * as path from 'path';
import * as url from 'url';

app.setPath('userData', __dirname);

// app.whenReady().then(() => {
//   // tslint:disable-next-line:no-empty
//   MouseTrap.bind(['command+r', 'ctrl+r'], () => {});
//   // tslint:disable-next-line:no-empty
//   MouseTrap.bind(['f5'], () => {});
// });

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

export function main() {
  const winApp = new AppWindow({
    icon: path.join(__dirname, 'favicon.ico'),
    minWidth: 1366,
    minHeight: 768,
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: false,
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
