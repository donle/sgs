import { ImageProps } from 'props/image_props';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';
import styles from './background.module.css';

export type BackgroundProps = {
  image: ImageProps;
};

export const Background = ({ image }: BackgroundProps) => {
  return <Picture className={styles.bg} image={image} />;
};
