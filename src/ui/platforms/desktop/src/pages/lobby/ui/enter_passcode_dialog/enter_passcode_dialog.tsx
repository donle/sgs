import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import { Button } from 'ui/button/button';
import { Dialog } from 'ui/dialog/dialog';
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
    <Dialog className={styles.passcodeDialog}  onClose={onClose}>
      <img className={styles.background} src={imageLoader.getDialogBackgroundImage().src} alt="" />
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

      <div className={styles.buttonsLabel}>
        <Button variant="primary" onClick={onClickConfirm} className={styles.button}>
          {translator.tr('confirm')}
        </Button>
        <Button variant="primary" onClick={onClose} className={styles.button}>
          {translator.tr('cancel')}
        </Button>
      </div>
    </Dialog>
  );
};
