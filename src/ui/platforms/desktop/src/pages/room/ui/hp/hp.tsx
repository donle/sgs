import * as React from 'react';
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
    <span>{`${hp}/${maxHp}`}</span>
  ) : (
    <div className={className}>
      {getMagatama(maxHp - hp, size, 'damaged', status)}
      {getMagatama(hp, size, status)}
    </div>
  );
};
