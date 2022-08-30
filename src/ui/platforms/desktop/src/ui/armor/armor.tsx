import classNames from 'classnames';
import React from 'react';
import styles from './armor.module.css';

export const Armor = (props: { amount: number, className?: string }) => {
  return props.amount > 0 ? (
    <div className={classNames(styles.armorLabel, props.className)}>
        <span className={classNames(styles.armorText)}>{props.amount}</span>
    </div>
  ) : (
    <></>
  );
};
