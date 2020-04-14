import classNames from 'classnames';
import * as React from 'react';
import styles from './magatama.module.css';
export type StatusType = 'damaged' | 'dying' | 'danger' | 'healthy';

export type MagatamaProps = {
  status: StatusType;
  size: 'regular' | 'small';
  className?: string;
};

export const Magatama = (props: MagatamaProps) => {
  const { status, size, className } = props;
  return (
    <div
      className={classNames(styles.magatama, className, {
        [styles.regular]: size === 'regular',
        [styles.small]: size === 'small',
        [styles.dying]: status === 'dying',
        [styles.danger]: status === 'danger',
        [styles.healthy]: status === 'healthy',
      })}
    />
  );
};

export const DamagedMagatama = (props: { size: 'regular' | 'small'; playerStatus: StatusType }) => (
  <Magatama className={styles.damaged} size={props.size} status={props.playerStatus} />
);
