import classNames from 'classnames';
import * as React from 'react';
import styles from './status_badge.module.css';

export const StatusBadge = React.memo(({ text, className }: { className?: string; text: string }) => {
  return <div className={classNames(styles.statusBadge, className)}>{text}</div>;
});
