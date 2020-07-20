import { ClientConfig } from 'props/config_props';
import { RouteComponentProps } from 'react-router-dom';

export type PagePropsWithConfig<T = {}> = T &
  RouteComponentProps & {
    config: ClientConfig;
  };
