import { getClientConfig } from 'client.config';
import { Sanguosha } from 'core/game/engine';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { getElectronLoader } from 'electron_loader/electron_loader_util';
import { SimplifiedChinese, TraditionalChinese } from 'languages';
import { ClientFlavor } from 'props/config_props';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { App } from './app';
import { emojiLoader } from './emoji_loader/emoji_loader';
import './index.css';
import * as serviceWorker from './serviceWorker';

const mode = (process.env.REACT_APP_DEV_MODE as ClientFlavor) || ClientFlavor.Dev;
console.log(process.env.REACT_APP_DEV_MODE);
const config = getClientConfig(mode);

if (config.flavor !== ClientFlavor.Web) {
  import('./index.module.css');
}

let translator: ClientTranslationModule;
let electronLoader: ElectronLoader;

getElectronLoader(config.flavor)
  .then(loader => {
    electronLoader = loader;
    translator = ClientTranslationModule.setup(
      electronLoader.getData('language'),
      [Languages.ZH_CN, SimplifiedChinese],
      [Languages.ZH_HK, TraditionalChinese],
      [Languages.ZH_TW, TraditionalChinese],
    );
    emojiLoader(translator);
    Sanguosha.initialize();
  })
  .then(() => {
    ReactDOM.render(
      <MemoryRouter>
        <App config={config} electronLoader={electronLoader} translator={translator} />
      </MemoryRouter>,
      document.getElementById('root'),
    );
  });

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
