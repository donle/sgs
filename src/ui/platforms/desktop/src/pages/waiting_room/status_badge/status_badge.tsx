import styles from './status_badge.module.css';
import classNames from 'classnames';
import * as React from 'react';

export const StatusBadge = React.memo(({ text, className }: { className?: string; text: string }) => (
  <div className={classNames(styles.statusBadge, className)}>{text}</div>
));
