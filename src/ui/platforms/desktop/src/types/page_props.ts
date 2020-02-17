import { HostConfigProps } from 'core/shares/types/host_config';

export type PagePropsWithHostConfig<T> = T & {
  config: HostConfigProps;
};
