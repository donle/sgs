import { ImageProps } from 'props/image_props';
import * as React from 'react';

export const Picture = React.memo((props: { image: ImageProps; className?: string }) => (
  <img className={props.className} src={props.image.src} alt={props.image.alt} />
));
