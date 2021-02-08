import classNames from 'classnames';
import * as React from 'react';
import { ConnectionService } from 'services/connection_service/connection_service';
import { Tooltip } from 'ui/tooltip/tooltip';
import styles from './signal_bar.module.css';

let queryingPing = false;

export const SignalBar = ({
  className,
  connectionService,
}: {
  className?: string;
  connectionService: ConnectionService;
}) => {
  const [showPing, enablePing] = React.useState<boolean>(false);
  const [ping, setPing] = React.useState<number>(999);
  const signal = {
    [styles.strong]: ping < 200,
    [styles.medium]: ping >= 200 && ping < 400,
    [styles.weak]: ping >= 400,
  };

  React.useEffect(() => {
    connectionService.Lobby.ping(_ping => {
      queryingPing = false;
      setPing(_ping);
    });
  }, [connectionService.Lobby]);

  const onHover = () => {
    enablePing(true);
  };
  const onLeave = () => {
    enablePing(false);
  };

  const onClick = () => {
    if (queryingPing) {
      return;
    }

    queryingPing = true;
    connectionService.Lobby.checkCoreVersion();
  };

  return (
    <div
      className={classNames(className, styles.signalBar)}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      {showPing && (
        <Tooltip className={styles.text} position={['left', 'bottom']}>
          {ping}ms
        </Tooltip>
      )}
      <span className={classNames(styles.barOne, signal)} />
      <span className={classNames(styles.barTwo, signal)} />
      <span className={classNames(styles.barThree, signal)} />
    </div>
  );
};
