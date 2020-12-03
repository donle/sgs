import { Flavor } from 'core/shares/types/host_config';
import { Languages } from 'core/translations/translation_json_tool';

export type UiConfigTypes = {
  language: Languages;
};

export const enum ClientFlavor {
  Dev = 'dev',
  Web = 'web',
  Desktop = 'desktop',
}

export type ServiceConfig = {
  mode: Flavor;
  port: number;
  host: string;
  protocol: 'http' | 'https';
};

export type ClientConfig = {
  ui: UiConfigTypes;
  host: ServiceConfig;
  flavor: ClientFlavor;
};
