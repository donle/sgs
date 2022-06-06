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
      host = [
        {
          port: 2020,
          host: '146.56.218.109',
          protocol: 'http',
          hostTag: ServerHostTag.NanJing,
        },
        {
          port: 2020,
          host: '1.12.67.228',
          protocol: 'http',
          hostTag: ServerHostTag.GuangZhou,
        },
        {
          port: 2020,
          host: '121.41.167.150',
          protocol: 'http',
          hostTag: ServerHostTag.HangZhou,
        },
      ];
      break;
    case ClientFlavor.Desktop:
      host = [
        {
          port: 2020,
          host: '1.12.67.228',
          protocol: 'http',
          hostTag: ServerHostTag.GuangZhou,
        },
        {
          port: 2020,
          host: '146.56.218.109',
          protocol: 'http',
          hostTag: ServerHostTag.NanJing,
        },
        {
          port: 2020,
          host: '121.41.167.150',
          protocol: 'http',
          hostTag: ServerHostTag.HangZhou,
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
