import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';

export type ServerConfig = {
  mode: Flavor;
  language: Languages;
  port: number;
};

export function getServerConfig(flavor: Flavor): ServerConfig {
  switch (flavor) {
    case Flavor.Dev:
      return {
        mode: Flavor.Dev,
        port: 2020,
        language: Languages.ZH_CN,
      };
    case Flavor.Prod:
      return {
        mode: Flavor.Prod,
        port: 2020,
        language: Languages.ZH_CN,
      };
    default:
      throw Error(`invalid flavor: ${flavor}`);
  }
}
