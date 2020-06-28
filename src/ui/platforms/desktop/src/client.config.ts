import { DevMode, hostConfig } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
import { ClientConfigTypes, ClientFlavor, UiConfigTypes } from 'props/config_props';

const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

const clientFlavorMap: { [M in DevMode]: ClientFlavor } = {
  [DevMode.Dev]: ClientFlavor.Dev,
  [DevMode.Prod]: ClientFlavor.Prod,
};

export const getClientConfg = (mode: DevMode): ClientConfigTypes => ({
  ui: uiConfig,
  host: hostConfig[mode],
  flavor: clientFlavorMap[mode],
});
