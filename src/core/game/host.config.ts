export const enum DevMode {
  Dev = 'dev',
  Prod = 'prod',
}

export type ServerConfigProps = {
  [M in DevMode]: HostConfigProps;
};

export type HostConfigProps = {
  port: number;
  host: string;
  protocal: 'http' | 'https';
};

export const hostConfig: ServerConfigProps = {
  [DevMode.Dev]: {
    port: 6000,
    host: 'localhost',
    protocal: 'http',
  },
  [DevMode.Prod]: {
    port: 6000,
    host: '127.0.0.1',
    protocal: 'http',
  },
};
