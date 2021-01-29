import classNames from 'classnames';
import * as React from 'react';
import { Dialog } from 'ui/dialog/dialog';
import styles from './base_dialog.module.css';

export const BaseDialog = (props: { className?: string; title?: string | JSX.Element; children?: React.ReactNode }) => {
  const { title, children, className } = props;
  return (
    <Dialog className={classNames(styles.selectorDialog, className)}>
      {title &&
        (typeof title === 'string' ? (
          <h4 className={styles.selectorTitle} dangerouslySetInnerHTML={{ __html: title }} />
        ) : (
          <h4 className={styles.selectorTitle}>{title}</h4>
        ))}
      {children}
    </Dialog>
  );
};
