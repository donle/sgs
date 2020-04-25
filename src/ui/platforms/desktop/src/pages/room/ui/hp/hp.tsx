import classNames from 'classnames';
import * as React from 'react';
import styles from './hp.module.css';
import { DamagedMagatama, Magatama, StatusType } from './magatama/magatama';

const getStatus = (hp: number, maxHp: number): StatusType => {
  if (maxHp === hp) {
    return 'healthy';
  } else if (hp === 1) {
    return 'dying';
  } else if ((maxHp - hp) / maxHp >= 1 / 3) {
    return 'danger';
  }

  return 'healthy';
};

const getMagatama = (
  amount: number,
  size: 'regular' | 'small',
  status: StatusType,
  playerStatus: StatusType = status,
) => {
  const magatamas: JSX.Element[] = [];
  for (let i = 0; i < amount; i++) {
    magatamas.push(
      status === 'damaged' ? (
        <DamagedMagatama key={i} size={size} playerStatus={playerStatus} />
      ) : (
        <Magatama key={i} size={size} status={status} />
      ),
    );
  }
  return <>{magatamas}</>;
};

export const Hp = (props: { hp: number; maxHp: number; size: 'regular' | 'small'; className?: string }) => {
  const { hp, maxHp, className, size } = props;
  const status = getStatus(hp, maxHp);

  return maxHp > 5 ? (
    <div className={styles.textHpLabel}>
      <span
        className={classNames(styles.textHp, {
          [styles.dying]: status === 'dying',
          [styles.danger]: status === 'danger',
          [styles.healthy]: status === 'healthy',
        })}
      >{`${hp}/${maxHp}`}</span>
      <Magatama size={size} status={status} />
    </div>
  ) : (
    <div className={className}>
      {getMagatama(Math.min(maxHp, maxHp - hp), size, 'damaged', status)}
      {getMagatama(hp, size, status)}
    </div>
  );
};
