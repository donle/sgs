import * as React from 'react';
import { observer } from 'mobx-react';
import styles from './text.module.css';
import classNames from 'classnames';

export const enum Spacing {
  Spacing_8 = 'spacing8',
  Spacing_16 = 'spacing16',
  Spacing_32 = 'spacing32',
  Spacing_48 = 'spacing48',
  Spacing_64 = 'spacing64',
  Spacing_96 = 'spacing96',
}

export type TextProps = {
  className?: string;
  children?: React.ReactNode;
  tag?: 'div' | 'span' | 'h1' | 'h2' | 'h3';
  topSpacing?: Spacing;
  bottomSpacing?: Spacing;
  alignment?: 'start' | 'center' | 'end';
  variant?: 'bold' | 'semiBold' | 'normal';
  color?: 'white' | 'grey' | 'highlight' | 'black';
};

export const Text = observer((props: TextProps) => {
  return React.createElement(
    props.tag || 'span',
    {
      className: classNames(
        props.className,
        styles.text,
        styles[props.alignment || 'start'],
        styles[props.variant || 'normal'],
        styles[props.color || 'highlight'],
        props.topSpacing && styles['top_' + props.topSpacing],
        props.bottomSpacing && styles['bottom_' + props.bottomSpacing],
      ),
    },
    props.children,
  );
});
