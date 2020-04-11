import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './card.module.css';

export const CardSlot = (props: { width?: number; translator: ClientTranslationModule; className?: string }) => {
  const { width = 120 } = props;
  const height = (width / 3) * 4;
  return (
    <div
      className={classNames(styles.cardSlot, classNames)}
      style={{
        width,
        height,
      }}
    >
      {props.translator.tr('card slot')}
    </div>
  );
};
