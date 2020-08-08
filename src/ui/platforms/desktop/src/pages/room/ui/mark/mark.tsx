import classNames from 'classnames';
import { MarkEnum } from 'core/shares/types/mark_list';
import * as React from 'react';
import styles from './mark.module.css';

import { Tooltip } from 'ui/tooltip/tooltip';
import awakenIcon from './images/awaken.png';
import dawuIcon from './images/dawu.png';
import junlveIcon from './images/junlve.png';
import kuangfengIcon from './images/kuangfeng.png';
import lieIcon from './images/lie.png';
import limitIcon from './images/limit.png';
import limitUsedIcon from './images/limit_used.png';
import nightmareIcon from './images/nightmare.png';
import wrathIcon from './images/nu.png';
import renIcon from './images/ren.png';
import xueyiIcon from './images/xueyi.png';
import yingIcon from './images/ying.png';

const markIconMaps: {
  [K in MarkEnum]: string;
} = {
  [MarkEnum.DaWu]: dawuIcon,
  [MarkEnum.KuangFeng]: kuangfengIcon,
  [MarkEnum.Nightmare]: nightmareIcon,
  [MarkEnum.Ren]: renIcon,
  [MarkEnum.Wrath]: wrathIcon,
  [MarkEnum.JunLve]: junlveIcon,
  [MarkEnum.Lie]: lieIcon,
  [MarkEnum.XueYi]: xueyiIcon,
  [MarkEnum.Ying]: yingIcon,
};

export type MarkProps = {
  markType: MarkEnum;
  amount: number;
  className?: string;
};

export type OnceSkillMarkProps = {
  hasUsed: boolean;
  skillName: string;
  className?: string;
};

export const Mark = (props: MarkProps) => {
  return props.amount > 0 ? (
    <div className={classNames(styles.mark, props.className)}>
      <img src={markIconMaps[props.markType]} alt="" />
      {props.amount > 1 && <span className={styles.markAmount}>{props.amount}</span>}
    </div>
  ) : (
    <></>
  );
};

export const LimitSkillMark = (props: OnceSkillMarkProps) => {
  const [hovered, setHover] = React.useState<boolean>(false);
  const onMouseEnter = () => {
    setHover(true);
  };
  const onMouseLeave = () => {
    setHover(false);
  };
  return (
    <div className={classNames(styles.mark, props.className)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img src={props.hasUsed ? limitUsedIcon : limitIcon} alt="" />
      {hovered && (
        <Tooltip className={styles.tooltip} position={['bottom', 'right']}>
          {props.skillName}
        </Tooltip>
      )}
    </div>
  );
};

export const AwakenSkillMark = (props: OnceSkillMarkProps) => {
  const [hovered, setHover] = React.useState<boolean>(false);
  const onMouseEnter = () => {
    setHover(true);
  };
  const onMouseLeave = () => {
    setHover(false);
  };

  return props.hasUsed ? (
    <div className={classNames(styles.mark, props.className)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img src={awakenIcon} alt="" />
      {hovered && (
        <Tooltip className={styles.tooltip} position={['bottom', 'right']}>
          {props.skillName}
        </Tooltip>
      )}
    </div>
  ) : (
    <></>
  );
};
