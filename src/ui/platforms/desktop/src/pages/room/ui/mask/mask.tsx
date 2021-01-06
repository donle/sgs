import classNames from 'classnames';
import { PlayerRole } from 'core/player/player_props';
import { GameMode } from 'core/shares/types/room_props';
import * as React from 'react';
import lord1v2Mask from './images/1v2_lord.png';
import rebel1v2Mask from './images/1v2_rebel.png';
import loyalist2v2Mask from './images/2v2_loyalist.png';
import rebel2v2Mask from './images/2v2_rebel.png';
import lordMask from './images/lord.png';
import loyalistMask from './images/loyalist.png';
import rebelMask from './images/rebel.png';
import renegadeMask from './images/renegade.png';
import unknownMask from './images/unknown.png';
import styles from './mask.module.css';

const maskImages: { [K in PlayerRole]: string } = {
  [PlayerRole.Lord]: lordMask,
  [PlayerRole.Rebel]: rebelMask,
  [PlayerRole.Loyalist]: loyalistMask,
  [PlayerRole.Renegade]: renegadeMask,
  [PlayerRole.Unknown]: unknownMask,
};

const oneVersusTwoMarkImages: { [K in PlayerRole]?: string } = {
  [PlayerRole.Lord]: lord1v2Mask,
  [PlayerRole.Rebel]: rebel1v2Mask,
};

const twoVersusTwoMarkImages: { [K in PlayerRole]?: string } = {
  [PlayerRole.Loyalist]: loyalist2v2Mask,
  [PlayerRole.Rebel]: rebel2v2Mask,
};

const getMaskImage = (gameMode: GameMode, role: PlayerRole) => {
  switch (gameMode) {
    case GameMode.OneVersusTwo:
      return oneVersusTwoMarkImages[role];
    case GameMode.TwoVersusTwo:
      return twoVersusTwoMarkImages[role];
    case GameMode.Standard:
    default:
      return maskImages[role];
  }
};

export type MaskProps = {
  displayedRole?: PlayerRole;
  hideDisplay?: boolean;
  className?: string;
  lockedRole?: PlayerRole;
  gameMode: GameMode;
};

const OneMask = (props: {
  role: PlayerRole;
  onClick?(role: PlayerRole): () => void;
  className?: string;
  gameMode: GameMode;
}) => {
  const { role, onClick, className, gameMode } = props;
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
      <img className={styles.maskImage} alt={''} src={getMaskImage(gameMode, role)} />
    </div>
  );
};

const AllMasks = (props: { onClick?(role: PlayerRole): () => void; opened: boolean; gameMode: GameMode }) => {
  const { onClick, opened, gameMode } = props;

  const masks: JSX.Element[] = [];
  for (const role of [PlayerRole.Loyalist, PlayerRole.Rebel, PlayerRole.Renegade, PlayerRole.Unknown]) {
    masks.push(
      <OneMask
        role={role}
        key={role}
        gameMode={gameMode}
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
  const { hideDisplay, displayedRole = PlayerRole.Unknown, className, lockedRole, gameMode } = props;
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

    hideDisplay
      ? setRole(role === PlayerRole.Unknown ? displayedRole : PlayerRole.Unknown)
      : setMaskSwitch(!maskSwitch);
  };

  return (
    <div className={className} onClick={onMaskClick}>
      <div
        className={classNames(styles.displayedRole, {
          [styles.lord]: lockedRole === PlayerRole.Lord || role === PlayerRole.Lord,
          [styles.loyalist]: lockedRole === PlayerRole.Loyalist || role === PlayerRole.Loyalist,
          [styles.rebel]: lockedRole === PlayerRole.Rebel || role === PlayerRole.Rebel,
          [styles.renegade]: lockedRole === PlayerRole.Renegade || role === PlayerRole.Renegade,
        })}
      >
        <img className={styles.maskImage} alt={''} src={getMaskImage(gameMode, lockedRole || role)} />
      </div>
      <AllMasks onClick={lockedRole ? undefined : onClick} opened={!lockedRole && maskSwitch} gameMode={gameMode} />
    </div>
  );
};
