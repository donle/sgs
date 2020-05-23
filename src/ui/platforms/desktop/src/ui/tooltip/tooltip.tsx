import classNames from 'classnames';
import * as React from 'react';
import styles from './tooltip.module.css';

export type TooltipProps = {
  children?: React.ReactNode;
  className?: string;
  position: ('left' | 'right' | 'top' | 'bottom')[];
};

export const Tooltip = (props: TooltipProps) => {
  const { children, position, className } = props;
  return (
    <div
      className={classNames(styles.tooltip, className, {
        [styles.top]: position.includes('top'),
        [styles.bottom]: position.includes('bottom'),
        [styles.left]: position.includes('left'),
        [styles.right]: position.includes('right'),
      })}
    >
      {children}
    </div>
  );
};
