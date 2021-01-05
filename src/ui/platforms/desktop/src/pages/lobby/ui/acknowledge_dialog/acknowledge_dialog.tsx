import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Dialog } from 'ui/dialog/dialog';
import styles from './acknowledge_dialog.module.css';
import closeIcon from './images/close.png';

export const AcknowledgeDialog = ({ imageLoader, onClose }: { imageLoader: ImageLoader; onClose(): void }) => {
  return (
    <Dialog className={styles.acknowledge} onClose={onClose}>
      <button className={styles.closeButton} onClick={onClose} >
        <img className={styles.close} src={closeIcon} alt="" />
      </button>
      <img className={styles.background} src={imageLoader.getAcknowledgementImage().src} alt="" />
    </Dialog>
  );
};
