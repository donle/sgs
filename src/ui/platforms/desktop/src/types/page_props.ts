import { HostConfigProps } from 'core/shares/types/host_config';
import { RouteComponentProps } from 'react-router-dom';

export type PagePropsWithHostConfig<T = {}> = T &
  RouteComponentProps & {
    config: HostConfigProps;
  };
