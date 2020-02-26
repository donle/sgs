import { Sanguosha } from 'core/game/engine';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { uiConfig } from 'ui.config';
import { App } from './app';
import './index.css';
import * as serviceWorker from './serviceWorker';

Sanguosha.initialize();

ReactDOM.render(
  <BrowserRouter>
    <App config={uiConfig} />
  </BrowserRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
