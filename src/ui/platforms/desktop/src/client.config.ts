import {
  DevMode,
  hostConfig,
  HostConfigProps,
} from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';

type UiConfigTypes = {
  language: Languages;
};

const uiConfig: UiConfigTypes = {
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
