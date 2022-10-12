import styles from './background.module.css';
import { ImageProps } from 'props/image_props';
import * as React from 'react';
import { Picture } from 'ui/picture/picture';

export type BackgroundProps = {
  image: ImageProps;
};

export const Background = ({ image }: BackgroundProps) => <Picture className={styles.bg} image={image} />;
