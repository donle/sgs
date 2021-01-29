import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Dialog } from 'ui/dialog/dialog';
import { feedBackContent } from './feedback_content';
import styles from './feedback_dialog.module.css';

export const FeedbackDialog = ({ imageLoader, onClose }: { imageLoader: ImageLoader; onClose(): void }) => {
  const background = imageLoader.getFeedbackImage();
  return (
    <Dialog onClose={onClose} className={styles.feedback}>
      <img src={background.src!} alt={background.alt} className={styles.background} />
      <div className={styles.feedbackInfo} dangerouslySetInnerHTML={{ __html: feedBackContent }} />
    </Dialog>
  );
};
