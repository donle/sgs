import classNames from 'classnames';
import * as React from 'react';
import styles from './button.module.css';

import primaryStatic from './images/primary_static.png';
import primaryStaticDisabled from './images/primary_static_disabled.png';
import primaryStaticDown from './images/primary_static_down.png';
import primaryStaticHover from './images/primary_static_hover.png';
import secondaryStatic from './images/secondary_static.png';
import secondaryStaticDisabled from './images/secondary_static_disabled.png';
import secondaryStaticDown from './images/secondary_static_down.png';
import secondaryStaticHover from './images/secondary_static_hover.png';

export type OptionButtonProps = {
  onMouseEnter?(): void;
  onMouseLeave?(): void;
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  type?: 'submit' | 'button';
  variant: 'option' | 'primaryStatic' | 'secondaryStatic' | 'primary' | 'system';
};

export const Button = (props: OptionButtonProps) => {
  const {
    onClick,
    disabled,
    className,
    children,
    variant,
    type,
    onMouseEnter: mouseEnter,
    onMouseLeave: mouseLeave,
  } = props;
  const onClickButton = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const getDefaultImage = () => {
    switch (variant) {
      case 'primaryStatic':
        return primaryStatic;
      case 'secondaryStatic':
        return secondaryStatic;
      default:
        return '';
    }
  };
  const getHoverImage = () => {
    switch (variant) {
      case 'primaryStatic':
        return primaryStaticHover;
      case 'secondaryStatic':
        return secondaryStaticHover;
      default:
        return '';
    }
  };
  const getDownImage = () => {
    switch (variant) {
      case 'primaryStatic':
        return primaryStaticDown;
      case 'secondaryStatic':
        return secondaryStaticDown;
      default:
        return '';
    }
  };
  const getDisabledImage = () => {
    switch (variant) {
      case 'primaryStatic':
        return primaryStaticDisabled;
      case 'secondaryStatic':
        return secondaryStaticDisabled;
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
    <span
      className={classNames(className, styles.buttonOuter, {
        [styles.optionButtonOuter]: variant === 'option',
        [styles.primaryButtonOuter]: variant === 'primary',
      })}
    >
      <button
        className={classNames(styles.button, {
          [styles.disabled]: disabled,
          [styles.optionButton]: variant === 'option',
          [styles.primaryButton]: variant === 'primary',
          [styles.imageButton]: variant === 'primaryStatic' || variant === 'secondaryStatic',
        })}
        type={type}
        disabled={disabled}
        onClick={onClickButton}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        {(variant === 'primaryStatic' || variant === 'secondaryStatic') && (
          <img className={styles.buttonImage} src={disabled ? getDisabledImage() : imageUrl} alt="" />
        )}
        {children}
      </button>
    </span>
  );
};
