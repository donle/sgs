import { getClientConfg } from 'client.config';
import { Sanguosha } from 'core/game/engine';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { SimplifiedChinese } from 'languages';
import { ClientFlavor } from 'props/config_props';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import { emojiLoader } from './emoji_loader/emoji_loader';
import './index.css';
import * as serviceWorker from './serviceWorker';

const mode = (process.env.DEV_MODE as Flavor) || Flavor.Dev;
const config = getClientConfg(mode);

const translator = ClientTranslationModule.setup(config.ui.language, [Languages.ZH_CN, SimplifiedChinese]);
emojiLoader(translator);

if (config.flavor === ClientFlavor.Prod) {
  import('./index.module.css');
}

const header = document.getElementsByTagName('head')[0];
const baseDirElement = document.createElement('base');
baseDirElement.setAttribute(
  'href',
  `${config.host.protocol}://${config.host.host}${config.flavor === ClientFlavor.Dev ? ':3000' : ''}/`,
);
header.append(baseDirElement);

Sanguosha.initialize();

ReactDOM.render(
  <BrowserRouter>
    <App config={config} translator={translator} />
  </BrowserRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
