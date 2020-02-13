import { Languages } from './languages';

export type ServerConfig = {
  language: Languages;
};

export const serverConfig: ServerConfig = {
  language: Languages.EN_AU,
};
