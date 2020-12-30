import classNames from 'classnames';
import { Character } from 'core/characters/character';
import * as React from 'react';
import styles from './hp.module.css';
import { CharaterMagatama } from './magatama/character_magatama';
import { DamagedMagatama, HealthyStatusType, Magatama } from './magatama/magatama';

const getStatus = (hp: number, maxHp: number): HealthyStatusType => {
  if (maxHp === hp) {
    return 'healthy';
  } else if (hp === 1) {
    return 'dying';
  } else if ((maxHp - hp) / maxHp >= 1 / 3) {
    return 'danger';
  }

  return 'healthy';
};

const getMagatama = (amount: number, size: 'regular' | 'small', status: HealthyStatusType) => {
  const magatamas: JSX.Element[] = [];
  for (let i = 0; i < amount; i++) {
    magatamas.push(
      status === 'damaged' ? <DamagedMagatama key={i} size={size} /> : <Magatama key={i} size={size} status={status} />,
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
      {getMagatama(Math.min(maxHp, maxHp - hp), size, 'damaged')}
      {getMagatama(hp, size, status)}
    </div>
  );
};

export const CharacterHp = (props: { character: Character; className?: string }) => {
  const { character, className } = props;

  const getMagatama = () => {
    const magatamas: JSX.Element[] = [];
    for (let i = 0; i < character.Hp; i++) {
      magatamas.push(
        <CharaterMagatama
          key={`${i}-maxhp-${character.Id}`}
          className={styles.characterMagatama}
          isLord={character.isLord()}
          nationality={character.Nationality}
        />,
      );
    }
    for (let i = 0; i < character.MaxHp - character.Hp; i++) {
      magatamas.push(
        <CharaterMagatama
          key={`${i}-${character.Id}`}
          className={styles.characterMagatama}
          isLord={character.isLord()}
          nationality={character.Nationality}
          emptyHp={true}
        />,
      );
    }

    return magatamas;
  };

  return <div className={classNames(styles.characterHpLabel, className)}>{getMagatama()}</div>;
};
