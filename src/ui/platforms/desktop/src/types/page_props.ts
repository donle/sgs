import { HostConfigProps } from 'core/shares/types/host_config';
import { ClientFlavor } from 'props/config_props';
import { RouteComponentProps } from 'react-router-dom';

export type PagePropsWithHostConfig<T = {}> = T &
  RouteComponentProps & {
    config: HostConfigProps;
    flavor: ClientFlavor;
  };
