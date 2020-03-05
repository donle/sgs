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

export type ClientConfigTypes = {
  ui: UiConfigTypes;
  host: HostConfigProps;
};

const uiConfig: UiConfigTypes = {
  language: Languages.EN_US,
};

export const getClientConfg = (mode: DevMode): ClientConfigTypes => ({
  ui: uiConfig,
  host: hostConfig[mode],
});
