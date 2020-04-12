import { GameEventIdentifiers } from 'core/event/event';
import { Logger } from 'core/shares/libs/logger/logger';
import { Precondition } from 'core/shares/libs/precondition/precondition';

export const enum PlayerPhaseStages {
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
}

export const enum StagePriority {
  Low,
  Medium,
  High,
}

export const enum PlayerPhase {
  PrepareStage,
  JudgeStage,
  DrawCardStage,
  PlayCardStage,
  DropCardStage,
  FinishStage,
}

const playerStagesList: {
  [K in PlayerPhase]: PlayerPhaseStages[];
} = {
  [PlayerPhase.PrepareStage]: [
    PlayerPhaseStages.PrepareStageStart,
    PlayerPhaseStages.PrepareStage,
    PlayerPhaseStages.PrepareStageEnd,
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
  BeforeCardUseEffect = 'BeforeCardUseEffect',
  CardUsing = 'CardUsing',
  AfterCardUseEffect = 'AfterCardUseEffect',
  CardUseFinishedEffect = 'CardUseFinishedEffect',
}

export const enum CardEffectStage {
  BeforeCardEffect = 'BeforeCardEffect',
  CardEffecting = 'CardEffecting',
  AfterCardEffect = 'AfterCardEffect',
}

export const enum CardResponseStage {
  BeforeCardResponseEffect = 'BeforeCardResponseEffect',
  CardResponsing = 'CardResponsing',
  AfterCardResponseEffect = 'AfterCardResponseEffect',
}

export const enum DrawCardStage {
  BeforeDrawCardEffect = 'BeforeDrawCardEffect',
  CardDrawing = 'CardDrawing',
  AfterDrawCardEffect = 'AfterDrawCardEffect',
}

export const enum ObtainCardStage {
  BeforeObtainCardEffect = 'BeforeObtainCardEffect',
  CardObtaining = 'CardObtaining',
  AfterObtainCardEffect = 'AfterObtainCardEffect',
}

export const enum CardDropStage {
  BeforeCardDropEffect = 'BeforeCardDropEffect',
  CardDropping = 'CardDropping',
  AfterCardDropEffect = 'AfterCardDropEffect',
}

export const enum CardLostStage {
  BeforeCardLoseEffect = 'BeforeCardLoseEffect',
  CardLosing = 'CardLosing',
  AfterCardLostEffect = 'AfterCardLostEffect',
}

export const enum DamageEffectStage {
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
  AfterPinDianEffect = 'AfterPinDianEffect',
}

export const enum PlayerDyingStage {
  PlayerDying = 'PlayerDying',
  AfterPlayerDying = 'AfterPlayerDying',
}
export const enum PlayerDiedStage {
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

export const enum LoseHpStage {
  BeforeLoseHp = 'BeforeLoseHp',
  LosingHp = 'LosingHp',
  AfterLostHp = 'AfterLostHp',
}

export type GameEventStage =
  | PhaseChangeStage
  | PhaseStageChangeStage
  | GameStartStage
  | CardEffectStage
  | CardLostStage
  | CardUseStage
  | CardDropStage
  | CardResponseStage
  | DrawCardStage
  | ObtainCardStage
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
  | TurnOverStage;

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
    CardUseStage.CardUsing,
    CardUseStage.AfterCardUseEffect,
    CardUseStage.CardUseFinishedEffect,
  ],
  [GameEventIdentifiers.CardEffectEvent]: [
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
  [GameEventIdentifiers.CardDropEvent]: [
    CardDropStage.BeforeCardDropEffect,
    CardDropStage.CardDropping,
    CardDropStage.AfterCardDropEffect,
  ],
  [GameEventIdentifiers.DamageEvent]: [
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
  [GameEventIdentifiers.PlayerDiedEvent]: [PlayerDiedStage.PlayerDied, PlayerDiedStage.AfterPlayerDied],
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
  [GameEventIdentifiers.ObtainCardEvent]: [
    ObtainCardStage.BeforeObtainCardEffect,
    ObtainCardStage.CardObtaining,
    ObtainCardStage.AfterObtainCardEffect,
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
  [GameEventIdentifiers.CardLostEvent]: [
    CardLostStage.BeforeCardLoseEffect,
    CardLostStage.CardLosing,
    CardLostStage.AfterCardLostEffect,
  ],
  [GameEventIdentifiers.LoseHpEvent]: [LoseHpStage.BeforeLoseHp, LoseHpStage.LosingHp, LoseHpStage.AfterLostHp],
  [GameEventIdentifiers.PlayerTurnOverEvent]: [TurnOverStage.TurningOver, TurnOverStage.TurnedOver],
};

export class StageProcessor {
  private gameEventStageList: GameEventStage[][] = [];
  private currentGameEventStage: GameEventStage | undefined;
  private processingGameEvent = false;

  constructor(private logger: Logger) {}

  private popStage() {
    if (this.gameEventStageList.length === 0) {
      return;
    }

    const stage = this.gameEventStageList[0][0];
    this.gameEventStageList[0].shift();
    if (this.gameEventStageList[0].length === 0) {
      this.gameEventStageList.shift();
    }

    return stage;
  }

  public involve(identifier: GameEventIdentifiers) {
    const stageList = Precondition.exists(gameEventStageList[identifier], `Unable to get game event of ${identifier}`);

    this.gameEventStageList.unshift(stageList.slice());

    this.currentGameEventStage = this.gameEventStageList[0][0];
    this.gameEventStageList[0].shift();
    this.processingGameEvent = true;

    return this.currentGameEventStage;
  }

  public next(): GameEventStage | undefined {
    if (!this.gameEventStageList || !this.processingGameEvent) {
      return;
    }
    if (this.gameEventStageList[0] && this.gameEventStageList[0][0] === this.currentGameEventStage) {
      this.gameEventStageList[0].shift();
    }

    const nextStage = this.popStage();
    if (nextStage === undefined) {
      this.currentGameEventStage = undefined;
      this.processingGameEvent = false;
      return;
    }

    return nextStage;
  }

  public getNextStage(): GameEventStage | undefined {
    if (this.gameEventStageList.length === 0) {
      return;
    }
    if (this.gameEventStageList[0] && this.gameEventStageList[0][0] === this.currentGameEventStage) {
      this.gameEventStageList[0].shift();
    }

    return this.gameEventStageList[0][0];
  }

  public clearProcess() {
    this.gameEventStageList = [];
    this.currentGameEventStage = undefined;
    this.processingGameEvent = false;
  }

  public skipEventProcess(currentIdentifier) {
    if (!this.isInsideEvent(currentIdentifier, this.gameEventStageList[0] && this.gameEventStageList[0][0])) {
      return;
    }

    this.gameEventStageList.shift();
    this.currentGameEventStage = undefined;
  }

  public terminateEventProcess() {
    this.processingGameEvent = false;
    this.currentGameEventStage = undefined;
  }

  public get CurrentGameEventStage() {
    return this.currentGameEventStage;
  }
  public set CurrentGameEventStage(stage: GameEventStage | undefined) {
    this.currentGameEventStage = stage;
  }

  public isCurrentGameEventDone() {
    return !this.processingGameEvent;
  }

  public isProcessingGameEvent() {
    return this.processingGameEvent;
  }

  public isInsideEvent(identifier: GameEventIdentifiers, stage?: GameEventStage) {
    if (stage === undefined) {
      return false;
    }

    const stageList = Precondition.exists(gameEventStageList[identifier], `Can't find stage events of ${identifier}`);
    return stageList.includes(stage);
  }

  public getGameStartStage() {
    return [GameStartStage.BeforeGameStart, GameStartStage.GameStarting, GameStartStage.AfterGameStarted];
  }

  public createPlayerStage(stage?: PlayerPhase) {
    if (stage !== undefined) {
      return playerStagesList[stage].slice();
    } else {
      const stages = [
        PlayerPhase.PrepareStage,
        PlayerPhase.JudgeStage,
        PlayerPhase.DrawCardStage,
        PlayerPhase.PlayCardStage,
        PlayerPhase.DropCardStage,
        PlayerPhase.FinishStage,
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

  public getInsidePlayerPhase(specificStage: PlayerPhaseStages): PlayerPhase {
    for (const [stage, stageList] of (Object.entries(playerStagesList) as unknown) as [string, PlayerPhaseStages[]][]) {
      if (stageList.includes(specificStage)) {
        return parseInt(stage, 10) as PlayerPhase;
      }
    }

    throw new Error(`Unknown player stage: ${specificStage}`);
  }
}
