export const enum Flavor {
  Dev = 'dev',
  Prod = 'prod',
}

export type ServerConfigProps = {
  [M in Flavor]: HostConfigProps;
};

export type HostConfigProps = {
  mode: Flavor;
  port: number;
  host: string;
  protocol: 'http' | 'https';
};

export const hostConfig: ServerConfigProps = {
  [Flavor.Dev]: {
    mode: Flavor.Dev,
    port: 2020,
    host: 'localhost',
    protocol: 'http',
  },
  [Flavor.Prod]: {
    mode: Flavor.Prod,
    port: 2020,
    host: '134.175.232.188',
    protocol: 'http',
  },
};
