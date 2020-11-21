import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfig, ClientFlavor, ServiceConfig, UiConfigTypes } from 'props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

const clientFlavorMap: { [M in Flavor]: ClientFlavor } = {
  [Flavor.Dev]: ClientFlavor.Dev,
  [Flavor.Prod]: ClientFlavor.Prod,
};

export const getClientConfig = (mode: Flavor): ClientConfig => {
  let host: ServiceConfig;

  switch (mode) {
    case Flavor.Dev:
      host = {
        mode: Flavor.Dev,
        port: 2020,
        host: 'localhost',
        protocol: 'http',
      };
      break;
    case Flavor.Prod:
      host = {
        mode: Flavor.Prod,
        port: 2020,
        host: '49.232.190.61', // '134.175.232.188',
        protocol: 'http',
      };
      break;
    default:
      throw Precondition.UnreachableError(mode);
  }
  return {
    ui: uiConfig,
    host,
    flavor: clientFlavorMap[mode],
  };
};
