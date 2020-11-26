import * as React from 'react';
import styles from './shadow_mask.module.css';

export const ShadowMask = (props: { onCancel(): void; children?: React.ReactNode }) => {
  return (
    <>
      <div className={styles.shadowMask} onClick={props.onCancel}></div>
      {props.children}
    </>
  );
};
