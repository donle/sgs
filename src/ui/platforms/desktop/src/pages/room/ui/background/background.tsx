import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';
import styles from './background.module.css';

export type BackgroundProps = {
  imageLoader: ImageLoader;
};

export const Background = ({ imageLoader }: BackgroundProps) => {
  return <Picture className={styles.bg} image={imageLoader.getBackgroundImage()} />;
};
