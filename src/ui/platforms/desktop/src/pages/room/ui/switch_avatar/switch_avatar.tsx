import classNames from 'classnames';
import * as React from 'react';
import styles from './switch_avatar.module.css';

export type SwitchAvatarProps = {
  mainImage?: string;
  sideImage?: string;
  className?: string;
};

export const SwitchAvatar = (props: SwitchAvatarProps) => {
  return (
    <div className={classNames(styles.switchAvatar, props.className)}>
      {props.sideImage && <img alt="" src={props.sideImage} className={styles.sideImage} />}
      <img
        alt=""
        src={props.mainImage}
        className={classNames(styles.mainImage, {
          [styles.dynamicMainImage]: props.sideImage !== undefined,
        })}
      />
    </div>
  );
};
