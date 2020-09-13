import classNames from 'classnames';
import { CharacterNationality } from 'core/characters/character';
import { PlayerPhase } from 'core/game/stage_processor';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './badge.module.css';
import drawPhaseBadge from './images/draw_phase.png';
import dropPhaseBadge from './images/drop_phase.png';
import finishPhaseBadge from './images/finish_phase.png';
import godBadge from './images/god.png';
import judgePhaseBadge from './images/judge_phase.png';
import playPhaseBadge from './images/play_phase.png';
import preparePhaseBadge from './images/prepare_phase.png';
import qunBadge from './images/qun.png';
import qunLordBadge from './images/qun_lord.png';
import shuBadge from './images/shu.png';
import shuLordBadge from './images/shu_lord.png';
import weiBadge from './images/wei.png';
import weiLordBadge from './images/wei_lord.png';
import wuBadge from './images/wu.png';
import wuLordBadge from './images/wu_lord.png';

const nationalityBadgeImageMap: { [K in CharacterNationality]: string } = {
  [CharacterNationality.Wei]: weiBadge,
  [CharacterNationality.Shu]: shuBadge,
  [CharacterNationality.Wu]: wuBadge,
  [CharacterNationality.Qun]: qunBadge,
  [CharacterNationality.God]: godBadge,
};
const lordNationalityBadgeImageMap: { [K in CharacterNationality]?: string } = {
  [CharacterNationality.Wei]: weiLordBadge,
  [CharacterNationality.Shu]: shuLordBadge,
  [CharacterNationality.Wu]: wuLordBadge,
  [CharacterNationality.Qun]: qunLordBadge,
};
const phaseBadgeImageMap: { [K in PlayerPhase]: string } = {
  [PlayerPhase.PhaseBegin]: preparePhaseBadge,
  [PlayerPhase.PrepareStage]: preparePhaseBadge,
  [PlayerPhase.JudgeStage]: judgePhaseBadge,
  [PlayerPhase.DrawCardStage]: drawPhaseBadge,
  [PlayerPhase.DropCardStage]: dropPhaseBadge,
  [PlayerPhase.PlayCardStage]: playPhaseBadge,
  [PlayerPhase.FinishStage]: finishPhaseBadge,
  [PlayerPhase.PhaseFinish]: finishPhaseBadge,
};

function getNationalityBadge(nationality: CharacterNationality, isLord?: boolean) {
  return isLord
    ? lordNationalityBadgeImageMap[nationality] || nationalityBadgeImageMap[nationality]
    : nationalityBadgeImageMap[nationality];
}

export type BadgeProps = {
  className?: string;
  size?: 'regular' | 'small';
  children?: React.ReactNode;
};

export const Badge = (props: BadgeProps) => {
  const { children, className, size } = props;
  return <div className={classNames(styles.badge, className, { [styles.small]: size === 'small' })}>{children}</div>;
};

export type NationalityBadgeProps = BadgeProps & {
  nationality: CharacterNationality;
  isLord?: boolean;
};

export const NationalityBadge = (props: NationalityBadgeProps) => {
  const { nationality, className, children, isLord, ...badgeProps } = props;
  return (
    <Badge
      {...badgeProps}
      className={classNames(className, {
        [styles.wei]: nationality === CharacterNationality.Wei,
        [styles.shu]: nationality === CharacterNationality.Shu,
        [styles.wu]: nationality === CharacterNationality.Wu,
        [styles.qun]: nationality === CharacterNationality.Qun,
        [styles.god]: nationality === CharacterNationality.God,
      })}
    >
      <span className={styles.badgeContext}>{children}</span>
      <img className={styles.nationalityBadge} src={getNationalityBadge(nationality, isLord)} alt={''} />
    </Badge>
  );
};

export const PlayerPhaseBadge = (props: {
  stage: PlayerPhase;
  translator: ClientTranslationModule;
  className?: string;
}) => {
  const { stage, className, translator } = props;
  return (
    <Badge className={classNames(styles.playerPhase, className)}>
      <img
        className={styles.playerPhaseBadge}
        src={phaseBadgeImageMap[stage]}
        alt={translator.tr(Functional.getPlayerPhaseRawText(stage))}
      />
    </Badge>
  );
};
