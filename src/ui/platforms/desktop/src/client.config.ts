import { Flavor, hostConfig } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfigTypes, ClientFlavor, UiConfigTypes } from 'props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

const clientFlavorMap: { [M in Flavor]: ClientFlavor } = {
  [Flavor.Dev]: ClientFlavor.Dev,
  [Flavor.Prod]: ClientFlavor.Prod,
};

export const getClientConfg = (mode: Flavor): ClientConfigTypes => ({
  ui: uiConfig,
  host: hostConfig[mode],
  flavor: clientFlavorMap[mode],
});
