import * as React from 'react';
import styles from './base_dialog.module.css';

export const BaseDialog = (props: { title: string | JSX.Element, children?: React.ReactNode }) => {
  const { title, children } = props;
  return (
    <div className={styles.selectorDialog}>
      {typeof title === 'string' ? (
        <h4 className={styles.selectorTitle} dangerouslySetInnerHTML={{ __html: title }} />
      ) : (
        <h4 className={styles.selectorTitle}>{title}</h4>
      )}
      {children}
    </div>
  );
};
