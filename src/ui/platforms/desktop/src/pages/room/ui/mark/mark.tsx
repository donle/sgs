import classNames from 'classnames';
import { MarkEnum } from 'core/shares/types/mark_list';
import * as React from 'react';
import { Tooltip } from 'ui/tooltip/tooltip';
import awakenIcon from './images/awaken.png';
import baoliIcon from './images/baoli.png';
import danlieIcon from './images/danlie.png';
import danxueIcon from './images/danxue.png';
import dawuIcon from './images/dawu.png';
import fengIcon from './images/feng.png';
import fuIcon from './images/fu.png';
import gouchenIcon from './images/gouchen.png';
import houtuIcon from './images/houtu.png';
import jianIcon from './images/jian.png';
import junlveIcon from './images/junlve.png';
import kuangfengIcon from './images/kuangfeng.png';
import kuiIcon from './images/kui.png';
import lieIcon from './images/lie.png';
import limitIcon from './images/limit.png';
import limitUsedIcon from './images/limit_used.png';
import shuIcon from './images/mark_shu.png';
import nightmareIcon from './images/nightmare.png';
import wrathIcon from './images/nu.png';
import orangeIcon from './images/orange.png';
import pingdingIcon from './images/pingding.png';
import pveClassicGuIcon from './images/pve_classic_gu.png';
import pveClassicHeIcon from './images/pve_classic_he.png';
import pveClassicJiIcon from './images/pve_classic_ji.png';
import pveClassicJianIcon from './images/pve_classic_jian.png';
import pveClassicXiIcon from './images/pve_classic_xi.png';
import pveClassicYingIcon from './images/pve_classic_ying.png';
import pveClassicYuIcon from './images/pve_classic_yu.png';
import pveClassicZhiIcon from './images/pve_classic_zhi.png';
import pveClassicPoJun from './images/pve_pojun.png';
import pveClassicTanLang from './images/pve_tanlang.png';
import pveClassicWenQu from './images/pve_wenqu.png';
import pveClassicWuQu from './images/pve_wuqu.png';
import qianIcon from './images/qian.png';
import ranIcon from './images/ran.png';
import renIcon from './images/ren.png';
import switchYangIcon from './images/switch_yang.png';
import switchYinIcon from './images/switch_yin.png';
import taomieIcon from './images/taomie.png';
import tianrenIcon from './images/tianren.png';
import weiIcon from './images/wei.png';
import xueyiIcon from './images/xueyi.png';
import yeIcon from './images/ye.png';
import yiIcon from './images/yi.png';
import yingIcon from './images/ying.png';
import yuqingIcon from './images/yuqing.png';
import zhongIcon from './images/zhong.png';
import ziweiIcon from './images/ziwei.png';

import styles from './mark.module.css';

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
  [MarkEnum.Orange]: orangeIcon,
  [MarkEnum.PveHuaShen]: nightmareIcon,
  [MarkEnum.Fu]: fuIcon,
  [MarkEnum.Ran]: ranIcon,
  [MarkEnum.Wei]: weiIcon,
  [MarkEnum.Jian]: jianIcon,
  [MarkEnum.TianRen]: tianrenIcon,
  [MarkEnum.BaoLi]: baoliIcon,
  [MarkEnum.DanXue]: danxueIcon,
  [MarkEnum.Zhong]: zhongIcon,
  [MarkEnum.TaoMie]: taomieIcon,
  [MarkEnum.Kui]: kuiIcon,
  [MarkEnum.PingDing]: pingdingIcon,
  [MarkEnum.DanLie]: danlieIcon,
  [MarkEnum.ZiWei]: ziweiIcon,
  [MarkEnum.HouTu]: houtuIcon,
  [MarkEnum.GouChen]: gouchenIcon,
  [MarkEnum.YuQing]: yuqingIcon,
  [MarkEnum.Feng]: fengIcon,
  [MarkEnum.Qian]: qianIcon,
  [MarkEnum.Ye]: yeIcon,
  [MarkEnum.Shu]: shuIcon,
  [MarkEnum.Yi]: yiIcon,

  [MarkEnum.PveJi]: pveClassicJiIcon,
  [MarkEnum.PveJian]: pveClassicJianIcon,
  [MarkEnum.PveXi]: pveClassicXiIcon,
  [MarkEnum.PveYing]: pveClassicYingIcon,
  [MarkEnum.PveYu]: pveClassicYuIcon,
  [MarkEnum.PveZhi]: pveClassicZhiIcon,
  [MarkEnum.PveHe]: pveClassicHeIcon,
  [MarkEnum.PveGu]: pveClassicGuIcon,
  [MarkEnum.PveTanLang]: pveClassicTanLang,
  [MarkEnum.PveWenQu]: pveClassicWenQu,
  [MarkEnum.PveWuQu]: pveClassicWuQu,
  [MarkEnum.PvePoJun]: pveClassicPoJun,
};

export type MarkProps = {
  markType: MarkEnum;
  amount: number;
  className?: string;
  tagPosition?: 'left' | 'right';
};

export type OnceSkillMarkProps = {
  hasUsed: boolean;
  skillName: string;
  className?: string;
  tagPosition?: 'left' | 'right';
};

export type SwitchSkillMarkProps = {
  state: boolean;
  skillName: string;
  className?: string;
  tagPosition?: 'left' | 'right';
};

export const Mark = (props: MarkProps) =>
  props.amount > 0 ? (
    <div className={classNames(styles.mark, props.className)}>
      <img src={markIconMaps[props.markType]} alt="" />
      {props.amount > 1 && <span className={styles.markAmount}>{props.amount}</span>}
    </div>
  ) : (
    <></>
  );

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
        <Tooltip className={styles.tooltip} position={['bottom', props.tagPosition || 'right']}>
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
        <Tooltip className={styles.tooltip} position={['bottom', props.tagPosition || 'right']}>
          {props.skillName}
        </Tooltip>
      )}
    </div>
  ) : (
    <></>
  );
};

export const SwitchSkillMark = (props: SwitchSkillMarkProps) => {
  const [hovered, setHover] = React.useState<boolean>(false);
  const onMouseEnter = () => {
    setHover(true);
  };
  const onMouseLeave = () => {
    setHover(false);
  };

  return (
    <div className={classNames(styles.mark, props.className)} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <img src={props.state ? switchYinIcon : switchYangIcon} alt="" />
      {hovered && (
        <Tooltip className={styles.tooltip} position={['bottom', props.tagPosition || 'right']}>
          {props.skillName}
        </Tooltip>
      )}
    </div>
  );
};
