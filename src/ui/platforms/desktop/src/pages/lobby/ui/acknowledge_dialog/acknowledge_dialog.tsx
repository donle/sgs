import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Dialog } from 'ui/dialog/dialog';
import styles from './acknowledge_dialog.module.css';

export const AcknowledgeDialog = ({ imageLoader, onClose }: { imageLoader: ImageLoader; onClose(): void }) => {
  return (
    <Dialog className={styles.acknowledge} onClose={onClose}>
      <img className={styles.background} src={imageLoader.getAcknowledgementImage().src} alt="" />
    </Dialog>
  );
};
