import * as express from 'express';
import * as childProcess from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { getClientConfig } from '../src/client.config';
import { ClientConfig, ClientFlavor, ServerHostTag } from '../src/props/config_props';

class App {
  private app: express.Express = express();
  private config: ClientConfig = getClientConfig(ClientFlavor.Web);
  private clientServerConfig = this.config.host.find(host => host.hostTag === ServerHostTag.GuangZhou);

  constructor() {
    this.app.get('/update/server', (req, res) => {
      const serverDir = path.join(__dirname, '../../../../server');

      if (os.platform() === 'win32') {
        childProcess.exec(`cd ${serverDir} && yarn build:win && forever restartall`, error => {
          res.status(200).send();
        });
      } else {
        childProcess.exec(`cd ${serverDir} && yarn build && forever restartall`, error => {
          res.status(200).send();
        });
      }
    });

    this.app.get('/update/client', (req, res) => {
      const clientDir = path.join(__dirname, '..');
      if (os.platform() === 'win32') {
        childProcess.exec(`cd ${clientDir} && yarn build:win`, error => {
          res.status(200).send();
        });
      } else {
        childProcess.exec(`cd ${clientDir} && yarn build:mac &&`, error => {
          res.status(200).send();
        });
      }
    });
  }

  public start() {
    this.app.listen(4115);
  }
}

new App().start();
