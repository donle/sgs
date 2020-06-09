import { HostConfigProps } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';

export type UiConfigTypes = {
  language: Languages;
};

export const enum ClientFlavor {
  Dev,
  Prod,
}

export type ClientConfigTypes = {
  ui: UiConfigTypes;
  host: HostConfigProps;
  flavor: ClientFlavor;
};
