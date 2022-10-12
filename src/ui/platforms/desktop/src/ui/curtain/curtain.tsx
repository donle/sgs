import styles from './curtain.module.css';
import * as React from 'react';

export const Curtain = (props: { onCancel(): void; children?: React.ReactNode }) => (
  <>
    <div className={styles.Curtain} onClick={props.onCancel}></div>
    {props.children}
  </>
);
