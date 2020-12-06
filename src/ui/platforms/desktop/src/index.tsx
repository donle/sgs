import { getClientConfig } from 'client.config';
import { Sanguosha } from 'core/game/engine';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { SimplifiedChinese } from 'languages';
import { ClientFlavor } from 'props/config_props';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';
import { App } from './app';
import { emojiLoader } from './emoji_loader/emoji_loader';
import './index.css';
import * as serviceWorker from './serviceWorker';

const mode = (process.env.DEV_MODE as ClientFlavor) || Flavor.Dev;
const config = getClientConfig(mode);

const translator = ClientTranslationModule.setup(config.ui.language, [Languages.ZH_CN, SimplifiedChinese]);
emojiLoader(translator);

if (config.flavor === ClientFlavor.Desktop) {
  import('./index.module.css');
}

Sanguosha.initialize();

ReactDOM.render(
  <MemoryRouter>
    <App config={config} translator={translator} />
  </MemoryRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
