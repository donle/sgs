import classNames from 'classnames';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import styles from './create_room_button.module.css';

export const CreateRoomButton = ({
  image,
  onClick,
  className,
  disabled,
  imageLoader,
}: {
  imageLoader: ImageLoader;
  className?: string;
  image: string;
  onClick(): void;
  disabled?: boolean;
}) => {
  return (
    <button className={classNames(styles.creatRoomButton, className)} onClick={onClick} disabled={disabled}>
      <img src={imageLoader.getCreateRoomButtonImage().src} alt={''} className={styles.buttonImage} />
    </button>
  );
};
