import classNames from 'classnames';
import * as React from 'react';
import styles from './tooltip.module.css';

export type TooltipProps = {
  children?: React.ReactNode;
  className?: string;
  closeAfter?: number;
  closeCallback?(): void;
  position: ('left' | 'right' | 'top' | 'bottom')[];
};

let timer: NodeJS.Timer | undefined;

export const Tooltip = (props: TooltipProps) => {
  const { closeCallback, children, position, className, closeAfter } = props;

  React.useEffect(() => {
    if (closeAfter === undefined) {
      return;
    }

    timer !== undefined && clearTimeout(timer);
    timer = setTimeout(() => {
      closeCallback && closeCallback();
    }, closeAfter * 1000);
  });

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
