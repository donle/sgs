import classNames from 'classnames';
import * as React from 'react';
import { OptionButtonProps } from './button';
import styles from './button.module.css';

export const LinkButton = (props: Pick<OptionButtonProps, Exclude<keyof OptionButtonProps, 'variant' | 'type'>>) => {
  return (
    <button
      className={classNames(styles.linkButton, props.className)}
      onClick={props.onClick}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};
