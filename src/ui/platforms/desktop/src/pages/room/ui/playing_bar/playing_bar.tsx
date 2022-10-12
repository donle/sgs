import classNames from 'classnames';
import * as React from 'react';
import styles from './playing_bar.module.css';

export const PlayingBar = (props: { playTime?: number; className?: string }) => {
  const processingStyle: React.CSSProperties = {
    animationDuration: `${props.playTime || 60}s`,
  };
  return (
    <div className={classNames(styles.playingBar, props.className)}>
      <span className={styles.innerBar} style={processingStyle} />
    </div>
  );
};
