import * as express from 'express';
import * as path from 'path';

class App {
  private app: express.Express = express();

  constructor() {
    this.app
      .get('/sgs', (req, res) => {
        res.sendfile(path.join(__dirname, '../build/home/index.html'));
      })
      .get('/', (req, res) => {
        res.sendfile(path.join(__dirname, '../build/index.html'), { maxAge: '180d' });
      })
      .use((req, res, next) => {
        if (/\/[^?]*$/.test(req.url)) {
          res.sendfile(path.join(__dirname, `../build/${req.url}`), { maxAge: '180d' });
        } else {
          next();
        }
      });

    this.setViewEngine('ejs');
  }

  private setViewEngine(view: string) {
    this.app.set('views', 'public');
    this.app.set('view engine', view);
  }

  public start() {
    this.app.listen(80);
  }
}

new App().start();
