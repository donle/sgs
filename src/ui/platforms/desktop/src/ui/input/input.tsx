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
  suffix?: React.ReactNode;
  disabled?: boolean;
  transparency?: number;
};

export const Input = (props: InputProps) => {
  const { className, onChange, value, placeholder, type, min, max, suffix, disabled, transparency } = props;

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (props.type === 'number') {
      const value = parseInt(event.target.value, 10);
      if (isNaN(value)) {
        onChange?.(props.min ? props.min.toString() : '0');
      } else if (props.min && value < props.min) {
        onChange?.(props.min.toString());
      } else if (props.max && value > props.max) {
        onChange?.(props.max.toString());
      }
    }

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
