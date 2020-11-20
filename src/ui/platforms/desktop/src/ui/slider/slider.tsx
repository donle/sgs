import classNames from 'classnames';
import * as React from 'react';
import styles from './slider.module.css';

export type SliderProps = {
  onChange(value: number): void;
  label?: string;
  className?: string;
  defaultValue: number;
};

export const Slider = (props: SliderProps) => {
  const [volume, setVolume] = React.useState(props.defaultValue);
  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(volume);
    setVolume(Number.parseInt(event.currentTarget.value, 10));
  };

  const onMouseDown = (event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    event.stopPropagation();
  }

  return (
    <div className={classNames(styles.slider, props.className)}>
      {props.label && <label className={styles.label}>{props.label}</label>}
      <div className={styles.innerSlider}>
        <input
          className={styles.sliderInput}
          type="range"
          min={0}
          max={100}
          defaultValue={props.defaultValue}
          onChange={onValueChange}
          onMouseDown={onMouseDown}
        />
        <span className={styles.bar} />
        <span className={styles.dot} style={{ left: `calc(${volume}% - 8px)` }} />
        <span className={styles.activeBar} style={{ width: volume + '%' }} />
      </div>
    </div>
  );
};
