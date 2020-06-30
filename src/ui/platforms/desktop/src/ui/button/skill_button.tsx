import classNames from 'classnames';
import { Skill } from 'core/skills/skill';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import { ImageLoader } from 'image_loader/image_loader';
import * as React from 'react';
import styles from './button.module.css';

type SkillButtonProps = {
  onClick?(): void;
  disabled?: boolean;
  className?: string;
  imageLoader: ImageLoader;
  translator: ClientTranslationModule;
  selected: boolean;
  skill: Skill;
  size: 'wide' | 'normal';
};

export const SkillButton = (props: SkillButtonProps) => {
  const { imageLoader, onClick, disabled, className, skill, size, translator, selected } = props;
  const imageList = imageLoader.getSkillButtonImage(skill.SkillType, size);
  const [image, setImageUrl] = React.useState(imageList?.default);

  const onClickButton = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const onMouseEnter = () => {
    if (disabled || selected || !image) {
      return;
    }

    setImageUrl(imageList?.hover);
  };

  const onMouseLeave = () => {
    if (disabled || selected || !image) {
      return;
    }
    setImageUrl(imageList?.default);
  };

  return (
    <button
      onClick={onClickButton}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={classNames(className, styles.button, styles.skillButton)}
      disabled={disabled}
    >
      <img
        className={styles.buttonImage}
        src={disabled ? imageList?.disabled : selected ? imageList?.down : image}
        alt=""
      />
      {translator.tr(skill.Name)}
    </button>
  );
};
