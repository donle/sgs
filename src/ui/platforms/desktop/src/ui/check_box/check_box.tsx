import styles from './check_box.module.css';
import classNames from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

export type CheckBoxProps<Value = string | number> = {
  onChecked?(checked: boolean): void;
  checked: boolean;
  label: string;
  id: Value;
  disabled?: boolean;
  className?: string;
};

export const CheckBox = observer((props: CheckBoxProps) => {
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
});
