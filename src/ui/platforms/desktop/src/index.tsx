import { getClientConfg, uiConfig } from 'client.config';
import { Sanguosha } from 'core/game/engine';
import { DevMode } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { SimplifiedChinese } from 'languages';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { App } from './app';
import './index.css';
import * as serviceWorker from './serviceWorker';

import './emoji_loader';

const mode = (process.env.DEV_MODE as DevMode) || DevMode.Dev;

Sanguosha.initialize();

const translator = ClientTranslationModule.setup(uiConfig.language, [
  Languages.ZH_CN,
  SimplifiedChinese,
]);

const config = getClientConfg(mode);

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
