import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfig, ClientFlavor, ServiceConfig, UiConfigTypes } from 'props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

export const getClientConfig = (mode: ClientFlavor): ClientConfig => {
  let host: ServiceConfig;

  switch (mode) {
    case ClientFlavor.Dev:
      host = {
        mode: Flavor.Dev,
        port: 2020,
        host: 'localhost',
        protocol: 'http',
      };
      break;
    case ClientFlavor.Web:
    case ClientFlavor.Desktop:
      host = {
        mode: Flavor.Prod,
        port: 2020,
        host: '49.232.190.61',
        protocol: 'http',
      };
      break;
    default:
      throw Precondition.UnreachableError(mode);
  }
  return {
    ui: uiConfig,
    host,
    flavor: mode,
  };
};
