import styles from './section.module.css';
import classNames from 'classnames';
import * as React from 'react';
import { Spacing } from 'ui/layout/spacing';

export const enum SectionVariant {
  FULL_WIDTH = 'fullWidth',
  CONTAINED = 'contained',
}

export type SectionProps = {
  className?: string;
  variant?: SectionVariant;
  topSpacing?: Spacing;
  bottomSpacing?: Spacing;
  children?: React.ReactNode;
};

export const Section = ({ variant = SectionVariant.CONTAINED, ...props }: SectionProps) => (
  <div
    className={classNames(styles.section, props.className, styles[variant], {
      [styles['topSpacing' + props.topSpacing]]: props.topSpacing !== undefined,
      [styles['bottomSpacing' + props.bottomSpacing]]: props.bottomSpacing !== undefined,
    })}
  >
    {props.children}
  </div>
);
