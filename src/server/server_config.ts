import { Languages } from 'core/translations/translation_json_tool';

export type ServerConfig = {
  language: Languages;
};

export const serverConfig: ServerConfig = {
  language: Languages.ZH_CN,
};
