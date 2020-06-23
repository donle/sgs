import classNames from 'classnames';
import { CharacterNationality } from 'core/characters/character';
import { PlayerPhase } from 'core/game/stage_processor';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './badge.module.css';
import godBadge from './images/god.png';
import qunBadge from './images/qun.png';
import shuBadge from './images/shu.png';
import weiBadge from './images/wei.png';
import wuBadge from './images/wu.png';

const badgeImageMap: { [K in CharacterNationality]: string } = {
  [CharacterNationality.Wei]: weiBadge,
  [CharacterNationality.Shu]: shuBadge,
  [CharacterNationality.Wu]: wuBadge,
  [CharacterNationality.Qun]: qunBadge,
  [CharacterNationality.God]: godBadge,
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
      {children}
      <img className={styles.nationalityBadge} src={badgeImageMap[nationality]} alt={''} />
    </Badge>
  );
};

export const PlayerPhaseBadge = (props: {
  stage: PlayerPhase;
  translator: ClientTranslationModule;
  className?: string;
}) => {
  const { stage, translator, className } = props;
  return (
    <Badge
      className={classNames(styles.playerPhase, className, {
        [styles.prepareStage]: stage === PlayerPhase.PrepareStage,
        [styles.judgeStage]: stage === PlayerPhase.JudgeStage,
        [styles.drawStage]: stage === PlayerPhase.DrawCardStage,
        [styles.playStage]: stage === PlayerPhase.PlayCardStage,
        [styles.dropStage]: stage === PlayerPhase.DropCardStage,
        [styles.finishStage]: stage === PlayerPhase.FinishStage,
      })}
    >
      {translator.tr(Functional.getPlayerPhaseRarText(stage))}
    </Badge>
  );
};
