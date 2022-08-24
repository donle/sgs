import { Flavor } from 'core/shares/types/host_config';
import { ClientLogger } from './client_logger';
import { Logger } from './logger';
import { ServerLogger } from './server_logger';

export const createLogger = (flavor: Flavor): Logger => {
  if (typeof window !== 'undefined') {
    return new ClientLogger(flavor);
  } else {
    return new ServerLogger(flavor);
  }
};
