import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ClientFlavor } from 'props/config_props';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { App } from './app';

test('renders learn react link', () => {
  const appDocument = (
    <App
      config={{
        ui: {
          language: Languages.EN_US,
        },
        flavor: ClientFlavor.Dev,
        host: {
          mode: Flavor.Dev,
          port: 1,
          host: 'localhost',
          protocol: 'http',
        },
      }}
      translator={ClientTranslationModule.setup(Languages.EN_US)}
    />
  );
  expect(renderer.create(appDocument).toJSON()).toMatchSnapshot();
});
