import { Precondition } from 'core/shares/libs/precondition/precondition';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfig, ClientFlavor, ServerHostTag, ServiceConfig, UiConfigTypes } from 'props/config_props';

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
    case ClientFlavor.Mobile:
      host = [
        {
          port: 2020,
          host: '146.56.218.109',
          protocol: 'http',
          hostTag: ServerHostTag.NanJing,
        },
        {
          port: 2020,
          host: '124.220.218.22',
          protocol: 'http',
          hostTag: ServerHostTag.ShangHai,
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
