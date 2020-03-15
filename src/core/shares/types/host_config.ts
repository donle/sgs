export const enum DevMode {
  Dev = 'dev',
  Prod = 'prod',
}

export type ServerConfigProps = {
  [M in DevMode]: HostConfigProps;
};

export type HostConfigProps = {
  mode: DevMode;
  port: number;
  host: string;
  protocol: 'http' | 'https';
};

export const hostConfig: ServerConfigProps = {
  [DevMode.Dev]: {
    mode: DevMode.Dev,
    port: 2020,
    host: '127.0.0.1',
    protocol: 'http',
  },
  [DevMode.Prod]: {
    mode: DevMode.Prod,
    port: 2020,
    host: '127.0.0.1',
    protocol: 'http',
  },
};
