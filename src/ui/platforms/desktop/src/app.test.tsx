import { App } from './app';
import { ClientLogger } from 'core/shares/libs/logger/client_logger';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { FakeElectronLoader } from 'electron_loader/fake_electron_loader';
import { ClientFlavor, ServerHostTag } from 'props/config_props';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

test('renders learn react link', () => {
  const appDocument = (
    <App
      electronLoader={new FakeElectronLoader()}
      logger={new ClientLogger()}
      config={{
        ui: {
          language: Languages.EN_US,
        },
        flavor: ClientFlavor.Dev,
        host: [
          {
            hostTag: ServerHostTag.Localhost,
            port: 1,
            host: 'localhost',
            protocol: 'http',
          },
        ],
      }}
      translator={ClientTranslationModule.setup(Languages.EN_US)}
    />
  );
  expect(renderer.create(appDocument).toJSON()).toMatchSnapshot();
});
