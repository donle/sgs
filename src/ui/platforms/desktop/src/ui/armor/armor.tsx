import styles from './armor.module.css';
import armorImage from './images/armor.png';
import classNames from 'classnames';
import React from 'react';
import { Picture } from 'ui/picture/picture';
import { Text } from 'ui/text/text';

export const Armor = (props: { amount: number; imgClassName?: string; className?: string }) =>
  props.amount > 0 ? (
    <div className={classNames(styles.armorLabel, props.className)}>
      <Picture image={{ src: armorImage, alt: '' }} className={classNames(styles.background, props.imgClassName)} />
      <Text variant="bold" color="white" className={styles.armorText}>
        {props.amount}
      </Text>
    </div>
  ) : (
    <></>
  );
