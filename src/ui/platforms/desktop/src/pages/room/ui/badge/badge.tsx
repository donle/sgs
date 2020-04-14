import classNames from 'classnames';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './badge.module.css';

export type BadgeProps = {
  blur?: boolean;
  vertical?: boolean;
  className?: string;
  children?: React.ReactNode;

  variant: 'wei' | 'shu' | 'wu' | 'qun' | 'god';
  translator: ClientTranslationModule;
};

export const Badge = (props: BadgeProps) => {
  const { blur = 'none', vertical = false, children, className, variant, translator } = props;
  return (
    <div
      className={classNames(styles.badge, className, {
        [styles.blur]: blur,
        [styles.vertical]: vertical,
        [styles.wei]: variant === 'wei',
        [styles.shu]: variant === 'shu',
        [styles.wu]: variant === 'wu',
        [styles.qun]: variant === 'qun',
        [styles.god]: variant === 'god',
      })}
    >
      <span className={styles.nationality}>{translator.tr(variant)}</span>
      {children}
    </div>
  );
};
