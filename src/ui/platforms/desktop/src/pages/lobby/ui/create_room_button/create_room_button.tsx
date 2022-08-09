import classNames from 'classnames';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';
import styles from './create_room_button.module.css';

export const CreateRoomButton = ({
  onClick,
  className,
  disabled,
  imageLoader,
}: {
  imageLoader: ImageLoader;
  className?: string;
  onClick(): void;
  disabled?: boolean;
}) => {
  return (
    <button className={classNames(styles.createRoomButton, className)} onClick={onClick} disabled={disabled}>
      <Picture image={imageLoader.getCreateRoomButtonImage()} className={styles.buttonImage} />
    </button>
  );
};
