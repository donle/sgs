import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import styles from './background.module.css';

export type BackgroundProps = {
  imageLoader: ImageLoader;
};

export const Background = ({ imageLoader }: BackgroundProps) => {
  const image = imageLoader.getBackgroundImage();
  return <img className={styles.bg} alt={image.alt} src={image.src} />;
};
