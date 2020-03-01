import {
  DevMode,
  hostConfig,
  HostConfigProps,
} from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';
export { hostConfig } from 'core/shares/types/host_config';

export type UiConfigTypes = {
  language: Languages;
};

export const uiConfig: UiConfigTypes = {
  language: Languages.ZH_CN,
};

export type ClientConfigTypes = {
  ui: UiConfigTypes;
  host: HostConfigProps;
};

export const getClientConfg = (mode: DevMode): ClientConfigTypes => ({
  ui: uiConfig,
  host: hostConfig[mode],
});
