import classNames from 'classnames';
import * as React from 'react';
import damagedMagatama from './images/damaged.webp';
import dangerMagatama from './images/danger.webp';
import dyingMagatama from './images/dying.webp';
import healthyMagatama from './images/healthy.webp';
import styles from './magatama.module.css';

export type HealthyStatusType = 'damaged' | 'dying' | 'danger' | 'healthy';

const magatamaImageMap: { [K in HealthyStatusType]: string } = {
  damaged: damagedMagatama,
  dying: dyingMagatama,
  danger: dangerMagatama,
  healthy: healthyMagatama,
};

export type MagatamaProps = {
  status: HealthyStatusType;
  size: 'regular' | 'small';
  className?: string;
};

export const Magatama = (props: MagatamaProps) => {
  const { status, size, className } = props;
  return (
    <img
      className={classNames(styles.magatama, className, {
        [styles.regular]: size === 'regular',
        [styles.small]: size === 'small',
      })}
      src={magatamaImageMap[status]}
      alt={''}
    />
  );
};

export const DamagedMagatama = (props: { size: 'regular' | 'small' }) => (
  <Magatama className={styles.damaged} size={props.size} status={'damaged'} />
);
