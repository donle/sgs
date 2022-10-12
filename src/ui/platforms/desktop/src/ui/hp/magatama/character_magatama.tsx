import classNames from 'classnames';
import { CharacterNationality } from 'core/characters/character';
import * as React from 'react';
import emptyMagatama from './images/empty.png';
import lordMagatama from './images/lord.png';
import qunMagatama from './images/qun.png';
import shuMagatama from './images/shu.png';
import weiMagatama from './images/wei.png';
import wuMagatama from './images/wu.png';
import styles from './magatama.module.css';

const magatamaImageMap: { [K in CharacterNationality]: string } = {
  [CharacterNationality.Wei]: weiMagatama,
  [CharacterNationality.Shu]: shuMagatama,
  [CharacterNationality.Wu]: wuMagatama,
  [CharacterNationality.Qun]: qunMagatama,
  [CharacterNationality.God]: lordMagatama,
};

export type MagatamaProps = {
  nationality: CharacterNationality;
  isLord?: boolean;
  className?: string;
  emptyHp?: boolean;
};

export const CharaterMagatama = (props: MagatamaProps) => {
  const { nationality, isLord, className, emptyHp } = props;
  return (
    <img
      className={classNames(styles.magatama, className)}
      src={emptyHp ? emptyMagatama : magatamaImageMap[isLord ? CharacterNationality.God : nationality]}
      alt={''}
    />
  );
};
