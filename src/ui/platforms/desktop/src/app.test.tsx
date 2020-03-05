import { DevMode } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
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
        host: {
          mode: DevMode.Dev,
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
