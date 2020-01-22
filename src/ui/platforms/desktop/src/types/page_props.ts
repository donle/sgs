import { HostConfigProps } from 'core/game/host.config';

export type PagePropsWithHostConfig<T> = T & {
  config: HostConfigProps;
};
