import classNames from 'classnames';
import * as React from 'react';
import styles from './section.module.css';

export const enum SectionSpacing {
  Spacing_8 = 8,
  Spacing_16 = 16,
  Spacing_24 = 24,
  Spacing_32 = 32,
  Spacing_40 = 40,
  Spacing_48 = 48,
  Spacing_96 = 96,
}

export const enum SectionVariant {
  FULL_WIDTH = 'fullWidth',
  CONTAINED = 'contained',
}

export type SectionProps = {
  className?: string;
  variant?: SectionVariant;
  topSpacing?: SectionSpacing;
  bottomSpacing?: SectionSpacing;
  children?: React.ReactNode;
};

export const Section = ({ variant = SectionVariant.CONTAINED, ...props }: SectionProps) => {
  return (
    <div
      className={classNames(styles.section, props.className, styles[variant], {
        [styles['topSpacing' + props.topSpacing]]: props.topSpacing !== undefined,
        [styles['bottomSpacing' + props.bottomSpacing]]: props.bottomSpacing !== undefined,
      })}
    >
      {props.children}
    </div>
  );
};
