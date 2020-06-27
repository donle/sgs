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
import shuBadge from './images/shu.png';
import weiBadge from './images/wei.png';
import wuBadge from './images/wu.png';

const nationalityBadgeImageMap: { [K in CharacterNationality]: string } = {
  [CharacterNationality.Wei]: weiBadge,
  [CharacterNationality.Shu]: shuBadge,
  [CharacterNationality.Wu]: wuBadge,
  [CharacterNationality.Qun]: qunBadge,
  [CharacterNationality.God]: godBadge,
};
const phaseBadgeImageMap: { [K in PlayerPhase]: string } = {
  [PlayerPhase.PrepareStage]: preparePhaseBadge,
  [PlayerPhase.JudgeStage]: judgePhaseBadge,
  [PlayerPhase.DrawCardStage]: drawPhaseBadge,
  [PlayerPhase.DropCardStage]: dropPhaseBadge,
  [PlayerPhase.PlayCardStage]: playPhaseBadge,
  [PlayerPhase.FinishStage]: finishPhaseBadge,
};

export type BadgeProps = {
  className?: string;
  children?: React.ReactNode;
};

export const Badge = (props: BadgeProps) => {
  const { children, className } = props;
  return <div className={classNames(styles.badge, className)}>{children}</div>;
};

export type NationalityBadgeProps = BadgeProps & {
  nationality: CharacterNationality;
};

export const NationalityBadge = (props: NationalityBadgeProps) => {
  const { nationality, className, children, ...badgeProps } = props;
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
      <img className={styles.nationalityBadge} src={nationalityBadgeImageMap[nationality]} alt={''} />
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
      <img className={styles.playerPhaseBadge} src={phaseBadgeImageMap[stage]} alt={translator.tr(Functional.getPlayerPhaseRarText(stage))} />
    </Badge>
  );
};
