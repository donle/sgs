import classNames from 'classnames';
import * as React from 'react';
import styles from './input.module.css';

export type InputProps = {
  className?: string;
  onChange?(value: string): void;
  value?: string;
  placeholder?: string;
};

export const Input = (props: InputProps) => {
  const { className, onChange, value, placeholder } = props;

  const onInputChnage = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange && onChange(event.target.value);
  };

  return (
    <input
      placeholder={placeholder}
      className={classNames(styles.input, className)}
      onChange={onInputChnage}
      value={value}
    />
  );
};
