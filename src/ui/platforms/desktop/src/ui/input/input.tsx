import classNames from 'classnames';
import * as React from 'react';
import styles from './input.module.css';

export type InputProps = {
  className?: string;
  onChange?(value: string): void;
  type?: HTMLInputElement['type'];
  min?: number;
  max?: number;
  value?: string;
  placeholder?: string;
  suffix?: string;
  disabled?: boolean;
  transparency?: number;
};

export const Input = (props: InputProps) => {
  const { className, onChange, value, placeholder, type, min, max, suffix, disabled, transparency } = props;

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.value);
  };

  return (
    <div className={styles.inputContainer}>
      <input
        placeholder={placeholder}
        className={classNames(styles.input, className)}
        onChange={onInputChange}
        disabled={disabled}
        value={value}
        min={min}
        max={max}
        type={type}
        style={transparency != null ? { backgroundColor: `rgba(0,0,0,${transparency})` } : undefined}
      />
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </div>
  );
};
