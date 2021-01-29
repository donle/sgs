import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Dialog } from 'ui/dialog/dialog';
import closeIcon from '../acknowledge_dialog/images/close.png';
import styles from './enter_passcode_dialog.module.css';

export const EnterPasscodeDialog = ({
  imageLoader,
  onSubmit,
  onClose,
  translator,
  showError,
}: {
  translator: ClientTranslationModule;
  imageLoader: ImageLoader;
  onSubmit(passcode?: string): void;
  onClose(): void;
  showError?: boolean;
}) => {
  const onClickConfirm = () => {
    onSubmit(passcode);
  };

  const onChangePasscode = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPasscode(event.target.value);
  };

  const onAction = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.stopPropagation();
  };

  const [passcode, setPasscode] = React.useState<string>();
  return (
    <Dialog className={styles.passcodeDialog}>
      <img className={styles.background} src={imageLoader.getDialogBackgroundImage().src} alt="" />
      <button className={styles.closeButton} onClick={onClose}>
        <img className={styles.close} src={closeIcon} alt="" />
      </button>
      <div className={styles.inputField}>
        <span className={styles.inputLabelText}>{translator.tr('please enter your room passcode')}</span>
        <input
          className={styles.input}
          type="password"
          autoComplete="off"
          value={passcode}
          onChange={onChangePasscode}
          onMouseDown={onAction}
        />
        {showError && <span className={styles.error}>{translator.tr('incorrect passcode')}</span>}
      </div>

      <Button variant="primary" onClick={onClickConfirm} className={styles.confirmButton}>
        {translator.tr('confirm')}
      </Button>
    </Dialog>
  );
};
