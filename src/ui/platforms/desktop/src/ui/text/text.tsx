import classNames from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Spacing } from 'ui/layout/spacing';
import styles from './text.module.css';

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
        props.topSpacing && styles['topSpacing' + props.topSpacing],
        props.bottomSpacing && styles['bottomSpacing' + props.bottomSpacing],
      ),
    },
    props.children,
  );
});
