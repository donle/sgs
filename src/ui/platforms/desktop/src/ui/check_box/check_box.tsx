import classNames from 'classnames';
import * as React from 'react';
import styles from './check_box.module.css';

export type CheckBoxProps = {
  onChecked?(checked: boolean): void;
  checked: boolean;
  label: string;
  id: number | string;
  disabled?: boolean;
  className?: string;
};

export const CheckBox = (props: CheckBoxProps) => {
  const onChange = () => {
    props.onChecked?.(!props.checked);
  };

  return (
    <div className={classNames(styles.checkbox, props.className)}>
      <input
        id={props.id.toString()}
        type="checkbox"
        className={styles.input}
        disabled={props.disabled}
        checked={props.checked}
        onChange={onChange}
      />
      <label htmlFor={props.id.toString()} className={styles.label}>
        {props.label}
      </label>
    </div>
  );
};
