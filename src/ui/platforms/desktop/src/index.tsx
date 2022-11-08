import { getClientConfig } from 'client.config';
import { Sanguosha } from 'core/game/engine';
import { createLogger } from 'core/shares/libs/logger/create';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ElectronData } from 'electron_loader/electron_data';
import { ElectronLoader } from 'electron_loader/electron_loader';
import { getElectronLoader } from 'electron_loader/electron_loader_util';
import { English, SimplifiedChinese, TraditionalChinese } from 'languages';
import { ClientFlavor } from 'props/config_props';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { App } from './app';
import { emojiLoader } from './emoji_loader/emoji_loader';
import * as serviceWorker from './serviceWorker';
import './index.css';

const mode = (process.env.REACT_APP_DEV_MODE as ClientFlavor) || ClientFlavor.Dev;
const config = getClientConfig(mode);
const logger = createLogger(mode === ClientFlavor.Dev ? Flavor.Dev : Flavor.Prod);

if (config.flavor !== ClientFlavor.Web) {
  import('./index.module.css');
}

let translator: ClientTranslationModule;
let electronLoader: ElectronLoader;

async function onDeviceReady() {
  const loader = await getElectronLoader(config.flavor);
  electronLoader = loader;
  translator = ClientTranslationModule.setup(
    electronLoader.getData(ElectronData.Language),
    [Languages.EN_US, English],
    [Languages.ZH_CN, SimplifiedChinese],
    [Languages.ZH_HK, TraditionalChinese],
    [Languages.ZH_TW, TraditionalChinese],
  );
  emojiLoader(translator);
  Sanguosha.initialize();

  ReactDOM.render(
    <MemoryRouter>
      <App config={config} electronLoader={electronLoader} translator={translator} logger={logger} />
    </MemoryRouter>,
    document.getElementById('root'),
  );
}

if (mode === ClientFlavor.Mobile) {
  document.addEventListener('deviceready', onDeviceReady, false);
} else {
  onDeviceReady();
}
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
