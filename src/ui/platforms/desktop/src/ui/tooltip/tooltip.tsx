import styles from './tooltip.module.css';
import classNames from 'classnames';
import * as React from 'react';

export type TooltipProps = {
  children?: React.ReactNode;
  className?: string;
  closeAfter?: number;
  closeCallback?(): void;
  autoAnimation?: boolean;
  position:
    | ('left' | 'right' | 'top' | 'bottom' | 'center' | 'slightTop' | 'slightBottom')[]
    | {
        top?: number;
        left?: number;
        right?: number;
        bottom?: number;
      };
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
  const tooltipStyles: React.CSSProperties = {};
  if (position instanceof Array) {
    for (const pos of position) {
      divClassName[styles[pos]] = true;
    }
  } else {
    tooltipStyles.position = 'fixed';
    for (const key of Object.keys(position)) {
      tooltipStyles[key] = `${position[key]}px`;
    }
  }

  return (
    <div
      style={tooltipStyles}
      className={classNames(styles.tooltip, className, { ...divClassName, [styles.shining]: autoAnimation })}
    >
      {children}
    </div>
  );
};
