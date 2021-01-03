import { GameEventIdentifiers } from 'core/event/event';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';

export const enum PlayerPhaseStages {
  PhaseBeginStart,
  PhaseBegin,
  PhaseBeginEnd,

  PrepareStageStart,
  PrepareStage,
  PrepareStageEnd,
  EndPrepareStageEnd,

  JudgeStageStart,
  JudgeStage,
  JudgeStageEnd,

  DrawCardStageStart,
  DrawCardStage,
  DrawCardStageEnd,

  PlayCardStageStart,
  PlayCardStage,
  PlayCardStageEnd,

  DropCardStageStart,
  DropCardStage,
  DropCardStageEnd,

  FinishStageStart,
  FinishStage,
  FinishStageEnd,

  PhaseFinishStart,
  PhaseFinish,
  PhaseFinishEnd,
}

export const enum StagePriority {
  High,
  Medium,
  Low,
}

export const enum PlayerPhase {
  PhaseBegin,
  PrepareStage,
  JudgeStage,
  DrawCardStage,
  PlayCardStage,
  DropCardStage,
  FinishStage,
  PhaseFinish,
}

const playerStagesList: {
  [K in PlayerPhase]: PlayerPhaseStages[];
} = {
  [PlayerPhase.PhaseBegin]: [
    PlayerPhaseStages.PhaseBeginStart,
    PlayerPhaseStages.PhaseBegin,
    PlayerPhaseStages.PhaseBeginEnd,
  ],
  [PlayerPhase.PrepareStage]: [
    PlayerPhaseStages.PrepareStageStart,
    PlayerPhaseStages.PrepareStage,
    PlayerPhaseStages.PrepareStageEnd,
    PlayerPhaseStages.EndPrepareStageEnd,
  ],
  [PlayerPhase.JudgeStage]: [
    PlayerPhaseStages.JudgeStageStart,
    PlayerPhaseStages.JudgeStage,
    PlayerPhaseStages.JudgeStageEnd,
  ],
  [PlayerPhase.DrawCardStage]: [
    PlayerPhaseStages.DrawCardStageStart,
    PlayerPhaseStages.DrawCardStage,
    PlayerPhaseStages.DrawCardStageEnd,
  ],
  [PlayerPhase.PlayCardStage]: [
    PlayerPhaseStages.PlayCardStageStart,
    PlayerPhaseStages.PlayCardStage,
    PlayerPhaseStages.PlayCardStageEnd,
  ],
  [PlayerPhase.DropCardStage]: [
    PlayerPhaseStages.DropCardStageStart,
    PlayerPhaseStages.DropCardStage,
    PlayerPhaseStages.DropCardStageEnd,
  ],
  [PlayerPhase.FinishStage]: [
    PlayerPhaseStages.FinishStageStart,
    PlayerPhaseStages.FinishStage,
    PlayerPhaseStages.FinishStageEnd,
  ],
  [PlayerPhase.PhaseFinish]: [
    PlayerPhaseStages.PhaseFinishStart,
    PlayerPhaseStages.PhaseFinish,
    PlayerPhaseStages.PhaseFinishEnd,
  ],
};

export const enum PhaseChangeStage {
  BeforePhaseChange = 'BeforePhaseChange',
  PhaseChanged = 'PhaseChanged',
  AfterPhaseChanged = 'AfterPhaseChanged',
}

export const enum PhaseStageChangeStage {
  BeforeStageChange = 'BeforeStageChange',
  StageChanged = 'StageChanged',
  AfterStageChanged = 'AfterStageChanged',
}

export const enum GameStartStage {
  BeforeGameStart = 'BeforeGameStart',
  GameStarting = 'GameStarting',
  AfterGameStarted = 'AfterGameStarted',
}

export const enum AimStage {
  OnAim = 'OnAim',
  OnAimmed = 'OnAimmed',
  AfterAim = 'AfterAim',
  AfterAimmed = 'AfterAimmed',
}

export const enum CardUseStage {
  PreCardUse = 'PreCardUse',
  BeforeCardUseEffect = 'BeforeCardUseEffect',
  AfterCardUseDeclared = 'AfterCardUseDeclared',
  AfterCardTargetDeclared = 'AfterCardTargetDeclared',
  CardUsing = 'CardUsing',
  AfterCardUseEffect = 'AfterCardUseEffect',
  CardUseFinishedEffect = 'CardUseFinishedEffect',
}

export const enum CardEffectStage {
  PreCardEffect = 'PreCardEffect',
  BeforeCardEffect = 'BeforeCardEffect',
  CardEffecting = 'CardEffecting',
  AfterCardEffect = 'AfterCardEffect',
  CardEffectCancelledOut = 'CardEffectCancelledOut',
}

export const enum CardResponseStage {
  PreCardResponse = 'PreCardResponse',
  BeforeCardResponseEffect = 'BeforeCardResponseEffect',
  CardResponsing = 'CardResponsing',
  AfterCardResponseEffect = 'AfterCardResponseEffect',
}

export const enum DrawCardStage {
  BeforeDrawCardEffect = 'BeforeDrawCardEffect',
  CardDrawing = 'CardDrawing',
  AfterDrawCardEffect = 'AfterDrawCardEffect',
}

export const enum DamageEffectStage {
  OnDamageConfirmed = 'OnDamageConfirmed',
  DamageStart = 'DamageStart',
  DamageEffect = 'DamageEffect',
  DamagedEffect = 'DamagedEffect',
  AfterDamageEffect = 'AfterDamageEffect',
  AfterDamagedEffect = 'AfterDamagedEffect',
}

export const enum JudgeEffectStage {
  OnJudge = 'OnJudge',
  BeforeJudgeEffect = 'BeforeJudgeEffect',
  JudgeEffect = 'JudgeEffect',
  AfterJudgeEffect = 'AfterJudgeEffect',
}

export const enum PinDianStage {
  BeforePinDianEffect = 'BeforePinDianEffect',
  PinDianEffect = 'PinDianEffect',
  PinDianResultConfirmed = 'PinDianConfirmed', // only used for trigger(), don't put it into stage list;
  AfterPinDianEffect = 'AfterPinDianEffect',
}

export const enum PlayerDyingStage {
  PlayerDying = 'PlayerDying',
  RequestRescue = 'RequestRescue',
  AfterPlayerDying = 'AfterPlayerDying',
}
export const enum PlayerDiedStage {
  PrePlayerDied = 'PrePlayerDie',
  PlayerDied = 'PlayerDied',
  AfterPlayerDied = 'AfterPlayerDied',
}

export const enum SkillUseStage {
  BeforeSkillUse = 'BeforeSkillUse',
  SkillUsing = 'SkillUsing',
  AfterSkillUsed = 'AfterSkillUsed',
}
export const enum SkillEffectStage {
  BeforeSkillEffect = 'BeforeSkillEffect',
  SkillEffecting = 'SkillEffecting',
  AfterSkillEffected = 'AfterSkillEffected',
}

export const enum RecoverEffectStage {
  BeforeRecoverEffect = 'BeforeRecoverEffect',
  RecoverEffecting = 'RecoverEffecting',
  AfterRecoverEffect = 'AfterRecoverEffect',
}

export const enum CardMoveStage {
  BeforeCardMoving = 'BeforeCardMoving',
  CardMoving = 'CardMoving',
  AfterCardMoved = 'AfterCardMoved',
}

export const enum TurnOverStage {
  TurningOver = 'TurningOver',
  TurnedOver = 'TurnedOver',
}

export const enum ChainLockStage {
  BeforeChainingOn = 'BeforeChainingOn',
  Chaining = 'Chaining',
  AfterChainedOn = 'AfterChainedOn',
}

export const enum LoseHpStage {
  BeforeLoseHp = 'BeforeLoseHp',
  LosingHp = 'LosingHp',
  AfterLostHp = 'AfterLostHp',
}

export const enum HpChangeStage {
  BeforeHpChange = 'BeforeHpChange',
  HpChanging = 'HpChanging',
  AfterHpChange = 'AfterHpChange',
}

export type GameEventStage =
  | PhaseChangeStage
  | PhaseStageChangeStage
  | GameStartStage
  | CardEffectStage
  | CardUseStage
  | CardResponseStage
  | DrawCardStage
  | JudgeEffectStage
  | RecoverEffectStage
  | PinDianStage
  | PlayerDyingStage
  | PlayerDiedStage
  | DamageEffectStage
  | AimStage
  | SkillUseStage
  | SkillEffectStage
  | LoseHpStage
  | CardMoveStage
  | TurnOverStage
  | HpChangeStage
  | ChainLockStage;

export type AllStage = PlayerPhaseStages | GameEventStage;

const gameEventStageList: {
  [K in GameEventIdentifiers]?: GameEventStage[];
} = {
  [GameEventIdentifiers.GameStartEvent]: [
    GameStartStage.BeforeGameStart,
    GameStartStage.GameStarting,
    GameStartStage.AfterGameStarted,
  ],
  [GameEventIdentifiers.CardUseEvent]: [
    CardUseStage.BeforeCardUseEffect,
    CardUseStage.AfterCardUseDeclared,
    CardUseStage.AfterCardTargetDeclared,
    CardUseStage.CardUsing,
    CardUseStage.AfterCardUseEffect,
    CardUseStage.CardUseFinishedEffect,
  ],
  [GameEventIdentifiers.CardEffectEvent]: [
    CardEffectStage.PreCardEffect,
    CardEffectStage.BeforeCardEffect,
    CardEffectStage.CardEffecting,
    CardEffectStage.AfterCardEffect,
  ],
  [GameEventIdentifiers.CardResponseEvent]: [
    CardResponseStage.BeforeCardResponseEffect,
    CardResponseStage.CardResponsing,
    CardResponseStage.AfterCardResponseEffect,
  ],
  [GameEventIdentifiers.DrawCardEvent]: [
    DrawCardStage.BeforeDrawCardEffect,
    DrawCardStage.CardDrawing,
    DrawCardStage.AfterDrawCardEffect,
  ],
  [GameEventIdentifiers.DamageEvent]: [
    DamageEffectStage.OnDamageConfirmed,
    DamageEffectStage.DamageStart,
    DamageEffectStage.DamageEffect,
    DamageEffectStage.DamagedEffect,
    DamageEffectStage.AfterDamageEffect,
    DamageEffectStage.AfterDamagedEffect,
  ],
  [GameEventIdentifiers.JudgeEvent]: [
    JudgeEffectStage.OnJudge,
    JudgeEffectStage.BeforeJudgeEffect,
    JudgeEffectStage.JudgeEffect,
    JudgeEffectStage.AfterJudgeEffect,
  ],
  [GameEventIdentifiers.PlayerDyingEvent]: [PlayerDyingStage.PlayerDying, PlayerDyingStage.AfterPlayerDying],
  [GameEventIdentifiers.PlayerDiedEvent]: [
    PlayerDiedStage.PrePlayerDied,
    PlayerDiedStage.PlayerDied,
    PlayerDiedStage.AfterPlayerDied,
  ],
  [GameEventIdentifiers.SkillUseEvent]: [
    SkillUseStage.BeforeSkillUse,
    SkillUseStage.SkillUsing,
    SkillUseStage.AfterSkillUsed,
  ],
  [GameEventIdentifiers.SkillEffectEvent]: [
    SkillEffectStage.BeforeSkillEffect,
    SkillEffectStage.SkillEffecting,
    SkillEffectStage.AfterSkillEffected,
  ],
  [GameEventIdentifiers.RecoverEvent]: [
    RecoverEffectStage.BeforeRecoverEffect,
    RecoverEffectStage.RecoverEffecting,
    RecoverEffectStage.AfterRecoverEffect,
  ],
  [GameEventIdentifiers.DrawCardEvent]: [
    DrawCardStage.BeforeDrawCardEffect,
    DrawCardStage.CardDrawing,
    DrawCardStage.AfterDrawCardEffect,
  ],
  [GameEventIdentifiers.PinDianEvent]: [
    PinDianStage.BeforePinDianEffect,
    PinDianStage.PinDianEffect,
    PinDianStage.AfterPinDianEffect,
  ],
  [GameEventIdentifiers.AimEvent]: [AimStage.OnAim, AimStage.OnAimmed, AimStage.AfterAim, AimStage.AfterAimmed],
  [GameEventIdentifiers.PhaseChangeEvent]: [
    PhaseChangeStage.BeforePhaseChange,
    PhaseChangeStage.PhaseChanged,
    PhaseChangeStage.AfterPhaseChanged,
  ],
  [GameEventIdentifiers.PhaseStageChangeEvent]: [
    PhaseStageChangeStage.BeforeStageChange,
    PhaseStageChangeStage.StageChanged,
    PhaseStageChangeStage.AfterStageChanged,
  ],
  [GameEventIdentifiers.MoveCardEvent]: [
    CardMoveStage.BeforeCardMoving,
    CardMoveStage.CardMoving,
    CardMoveStage.AfterCardMoved,
  ],
  [GameEventIdentifiers.HpChangeEvent]: [
    HpChangeStage.BeforeHpChange,
    HpChangeStage.HpChanging,
    HpChangeStage.AfterHpChange,
  ],
  [GameEventIdentifiers.ChainLockedEvent]: [
    ChainLockStage.BeforeChainingOn,
    ChainLockStage.Chaining,
    ChainLockStage.AfterChainedOn,
  ],
  [GameEventIdentifiers.LoseHpEvent]: [LoseHpStage.BeforeLoseHp, LoseHpStage.LosingHp, LoseHpStage.AfterLostHp],
  [GameEventIdentifiers.PlayerTurnOverEvent]: [TurnOverStage.TurningOver, TurnOverStage.TurnedOver],
};

export class StageProcessor {
  private gameEventStageList: GameEventStage[][] = [];

  constructor(private logger: Logger) {}

  public involve(identifier: GameEventIdentifiers) {
    const stageList = Precondition.exists(gameEventStageList[identifier], `Unable to get game event of ${identifier}`);

    this.gameEventStageList.unshift(stageList.slice());

    const currentGameEventStage = this.gameEventStageList[0][0];
    this.gameEventStageList[0].shift();

    return currentGameEventStage;
  }

  public getNextStage(): GameEventStage | undefined {
    Precondition.assert(
      this.gameEventStageList.length > 0,
      'stage_processor.ts >> getNextStage() >> error: getting in empty gameEventStageList',
    );

    if (this.gameEventStageList[0].length === 0) {
      return;
    }

    return this.gameEventStageList[0][0];
  }

  public popStage() {
    if (this.gameEventStageList.length === 0) {
      return;
    }

    if (this.gameEventStageList[0].length === 0) {
      this.gameEventStageList.shift();
      return;
    }

    const stage = this.gameEventStageList[0][0];
    this.gameEventStageList[0].shift();

    return stage;
  }

  public clearProcess() {
    this.gameEventStageList = [];
  }

  public skipEventProcess() {
    this.gameEventStageList.shift();
  }

  public isInsideEvent(identifier: GameEventIdentifiers, stage?: GameEventStage) {
    if (stage === undefined) {
      return false;
    }

    const stageList = Precondition.exists(gameEventStageList[identifier], `Can't find stage events of ${identifier}`);
    return stageList.includes(stage);
  }

  public createPlayerStage(stage?: PlayerPhase) {
    if (stage !== undefined) {
      return playerStagesList[stage].slice();
    } else {
      const stages = [
        PlayerPhase.PhaseBegin,
        PlayerPhase.PrepareStage,
        PlayerPhase.JudgeStage,
        PlayerPhase.DrawCardStage,
        PlayerPhase.PlayCardStage,
        PlayerPhase.DropCardStage,
        PlayerPhase.FinishStage,
        PlayerPhase.PhaseFinish,
      ];

      let createdStages: PlayerPhaseStages[] = [];
      for (const stage of stages) {
        createdStages = [...createdStages, ...playerStagesList[stage].slice()];
      }

      return createdStages;
    }
  }

  public isInsidePlayerPhase(phase: PlayerPhase, stage: PlayerPhaseStages) {
    return playerStagesList[phase].includes(stage);
  }

  public getInsidePlayerPhase(specificStage: PlayerPhaseStages | undefined): PlayerPhase {
    if (specificStage === undefined) {
      return PlayerPhase.PhaseBegin;
    }
    for (const [stage, stageList] of (Object.entries(playerStagesList) as unknown) as [string, PlayerPhaseStages[]][]) {
      if (stageList.includes(specificStage)) {
        return parseInt(stage, 10) as PlayerPhase;
      }
    }

    throw new Error(`Unknown player stage: ${specificStage}`);
  }
}
