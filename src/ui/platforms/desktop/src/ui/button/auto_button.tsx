import styles from './button.module.css';

import cancelButton from './images/cancel.png';
import cancelButtonDisabled from './images/cancel_disabled.png';
import cancelButtonDown from './images/cancel_down.png';
import cancelButtonHover from './images/cancel_hover.png';
import confirmButton from './images/confirm.png';
import confirmButtonDisabled from './images/confirm_disabled.png';
import confirmButtonDown from './images/confirm_down.png';
import confirmButtonHover from './images/confirm_hover.png';
import finishButton from './images/finish.png';
import finishButtonDisabled from './images/finish_disabled.png';
import finishButtonDown from './images/finish_down.png';
import finishButtonHover from './images/finish_hover.png';
import classNames from 'classnames';
import * as React from 'react';

type AutoButtonProps = {
  onMouseEnter?(): void;
  onMouseLeave?(): void;
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  variant: 'cancel' | 'confirm' | 'finish';
};

export const AutoButton = (props: AutoButtonProps) => {
  const { onClick, disabled, className, variant, onMouseEnter: mouseEnter, onMouseLeave: mouseLeave } = props;
  const onClickButton = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const getDefaultImage = () => {
    switch (variant) {
      case 'cancel':
        return cancelButton;
      case 'confirm':
        return confirmButton;
      case 'finish':
        return finishButton;
      default:
        return '';
    }
  };
  const getHoverImage = () => {
    switch (variant) {
      case 'cancel':
        return cancelButtonHover;
      case 'confirm':
        return confirmButtonHover;
      case 'finish':
        return finishButtonHover;
      default:
        return '';
    }
  };
  const getDownImage = () => {
    switch (variant) {
      case 'cancel':
        return cancelButtonDown;
      case 'confirm':
        return confirmButtonDown;
      case 'finish':
        return finishButtonDown;
      default:
        return '';
    }
  };
  const getDisabledImage = () => {
    switch (variant) {
      case 'cancel':
        return cancelButtonDisabled;
      case 'confirm':
        return confirmButtonDisabled;
      case 'finish':
        return finishButtonDisabled;
      default:
        return '';
    }
  };

  const [imageUrl, setImageUrl] = React.useState(getDefaultImage());

  const onMouseEnter = () => {
    if (!disabled) {
      mouseEnter && mouseEnter();
    }
    if (disabled || !imageUrl) {
      return;
    }
    setImageUrl(getHoverImage());
  };

  const onMouseLeave = () => {
    if (!disabled) {
      mouseLeave && mouseLeave();
    }
    if (disabled || !imageUrl) {
      return;
    }

    setImageUrl(getDefaultImage());
  };

  const onMouseDown = () => {
    if (disabled || !imageUrl) {
      return;
    }

    setImageUrl(getDownImage());
  };

  const onMouseUp = () => {
    if (disabled || !imageUrl) {
      return;
    }

    setImageUrl(getHoverImage());
  };

  return (
    <span className={classNames(className, styles.buttonOuter)}>
      <button
        className={classNames(styles.button, styles.autoButton)}
        disabled={disabled}
        onClick={onClickButton}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {(variant === 'confirm' || variant === 'cancel' || variant === 'finish') && (
          <img className={styles.buttonImage} src={disabled ? getDisabledImage() : imageUrl} alt="" />
        )}
      </button>
    </span>
  );
};
