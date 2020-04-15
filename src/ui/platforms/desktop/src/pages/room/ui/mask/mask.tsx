import classNames from 'classnames';
import { PlayerRole } from 'core/player/player_props';
import { Functional } from 'core/shares/libs/functional';
import { ClientTranslationModule } from 'core/translations/translation_module.client';
import * as React from 'react';
import styles from './mask.module.css';

export type MaskProps = {
  displayedRole?: PlayerRole;
  disabled?: boolean;
  translator: ClientTranslationModule;
  className?: string;
  lockedRole?: PlayerRole;
};

const OneMask = (props: {
  text?: string;
  role: PlayerRole;
  onClick?(role: PlayerRole): () => void;
  className?: string;
}) => {
  const { text, role, onClick, className } = props;
  return (
    <div
      className={classNames(styles.oneMask, className, {
        [styles.lord]: role === PlayerRole.Lord,
        [styles.loyalist]: role === PlayerRole.Loyalist,
        [styles.rebel]: role === PlayerRole.Rebel,
        [styles.renegade]: role === PlayerRole.Renegade,
        [styles.unknown]: role === PlayerRole.Unknown,
      })}
      onClick={onClick && onClick(role)}
    >
      {text}
    </div>
  );
};

const AllMasks = (props: {
  onClick?(role: PlayerRole): () => void;
  opened: boolean;
  translator: ClientTranslationModule;
}) => {
  const { onClick, opened, translator } = props;

  const masks: JSX.Element[] = [];
  for (const role of [
    PlayerRole.Loyalist,
    PlayerRole.Rebel,
    PlayerRole.Renegade,
    PlayerRole.Unknown,
  ]) {
    masks.push(
      <OneMask
        role={role}
        key={role}
        text={translator.tr(Functional.getPlayerRoleRawText(role))}
        onClick={onClick}
        className={classNames({
          [styles.opened]: opened,
        })}
      />,
    );
  }

  return <>{masks}</>;
};

export const Mask = (props: MaskProps) => {
  const { translator, disabled, displayedRole = PlayerRole.Unknown, className, lockedRole } = props;
  const [maskSwitch, setMaskSwitch] = React.useState(false);
  const [role, setRole] = React.useState(displayedRole);

  const onClick = (role: PlayerRole) => () => {
    setRole(role);
    setMaskSwitch(false);
  };

  const onMaskClick = () => {
    if (lockedRole !== undefined) {
      return;
    }

    !disabled && setMaskSwitch(!maskSwitch);
  };

  return (
    <div className={className} onClick={onMaskClick}>
      <div
        className={classNames(styles.displayedRole, {
          [styles.lord]: lockedRole !== undefined ? lockedRole === PlayerRole.Lord : role === PlayerRole.Lord,
          [styles.loyalist]:
            lockedRole !== undefined ? lockedRole === PlayerRole.Loyalist : role === PlayerRole.Loyalist,
          [styles.rebel]: lockedRole !== undefined ? lockedRole === PlayerRole.Rebel : role === PlayerRole.Rebel,
          [styles.renegade]:
            lockedRole !== undefined ? lockedRole === PlayerRole.Renegade : role === PlayerRole.Renegade,
        })}
      >
        {lockedRole !== undefined
          ? translator.tr(Functional.getPlayerRoleRawText(lockedRole))
          : role !== PlayerRole.Unknown && translator.tr(Functional.getPlayerRoleRawText(role))}
      </div>
      <AllMasks onClick={disabled ? undefined : onClick} opened={maskSwitch} translator={translator} />
    </div>
  );
};
