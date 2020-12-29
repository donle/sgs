import classNames from 'classnames';
import * as React from 'react';
import styles from './tooltip.module.css';

export type TooltipProps = {
  children?: React.ReactNode;
  className?: string;
  closeAfter?: number;
  closeCallback?(): void;
  autoAnimation?: boolean;
  position: ('left' | 'right' | 'top' | 'bottom' | 'center' | 'slightTop' | 'slightBottom')[];
};

let timer: NodeJS.Timer | undefined;

export const Tooltip = (props: TooltipProps) => {
  const { closeCallback, children, position, className, closeAfter, autoAnimation } = props;

  React.useEffect(() => {
    if (closeAfter === undefined) {
      return;
    }

    timer !== undefined && clearTimeout(timer);
    timer = setTimeout(() => {
      closeCallback && closeCallback();
    }, closeAfter * 1000);
  });

  const divClassName: any = {};
  for (const pos of position) {
    divClassName[styles[pos]] = true;
  }

  return (
    <div className={classNames(styles.tooltip, className, { ...divClassName, [styles.shining]: autoAnimation })}>
      {children}
    </div>
  );
};
