import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfig, ClientFlavor, ServiceConfig, UiConfigTypes, ServerHostTag } from 'props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

export const getClientConfig = (mode: ClientFlavor): ClientConfig => {
  let host: ServiceConfig[];

  switch (mode) {
    case ClientFlavor.Dev:
      host = [
        {
          port: 2020,
          host: 'localhost',
          protocol: 'http',
          hostTag: ServerHostTag.Localhost,
        },
      ];
      break;
    case ClientFlavor.Web:
    case ClientFlavor.Desktop:
      host = [
        {
          port: 2020,
          host: '49.232.190.61',
          protocol: 'http',
          hostTag: ServerHostTag.BeiJing,
        },
        {
          port: 2020,
          host: '146.56.218.109',
          protocol: 'http',
          hostTag: ServerHostTag.NanJing,
        },
      ];
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
