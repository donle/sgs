import { Languages } from 'core/translations/translation_json_tool';

export type UiConfigTypes = {
  language: Languages;
};

export const enum ClientFlavor {
  Dev = 'dev',
  Web = 'web',
  Desktop = 'desktop',
}

export const enum ServerHostTag {
  Localhost = 'localhost',
  ShenZhen = 'shenzhen',
  NanJing = 'nanjing',
  HangZhou = 'hangzhou'
}

export type ServiceConfig = {
  port: number;
  host: string;
  protocol: 'http' | 'https';
  hostTag: ServerHostTag;
};

export type ClientConfig = {
  ui: UiConfigTypes;
  host: ServiceConfig[];
  flavor: ClientFlavor;
};
