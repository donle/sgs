import styles from './delayed_trick_icon.module.css';
import judgeAreaDisabledIcon from './images/judge_area_disabled_icon.png';
import classNames from 'classnames';
import * as React from 'react';

export const JudgeAreaDisabledIcon = () => (
  <div className={classNames(styles.delayedTrickIcon)}>
    <img src={judgeAreaDisabledIcon} alt="" />
  </div>
);
