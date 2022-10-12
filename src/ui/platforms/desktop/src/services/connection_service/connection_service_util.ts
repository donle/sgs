import { ClientConfig } from 'props/config_props';
import { FakeConnectionService } from './fake_connection_service';
import { RealConnectionService } from './real_connection_service';

export function getConnectionService(config: ClientConfig, isReplayMode?: boolean) {
  return isReplayMode ? new FakeConnectionService(config) : new RealConnectionService(config);
}
