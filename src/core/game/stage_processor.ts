import { GameEventIdentifiers } from 'core/event/event';
import { Logger } from 'core/shares/libs/logger/logger';

export const enum PlayerStageListEnum {
  BeginPrepareStageStart,
  PrepareStageStart,
  EndPrepareStageStart,
  BeginPrepareStage,
  PrepareStage,
  EndPrepareStage,
  BeginPrepareStageEnd,
  PrepareStageEnd,
  EndPrepareStageEnd,

  BeginJudgeStageStart,
  JudgeStageStart,
  EndJudgeStageStart,
  BeginJudgeStage,
  JudgeStage,
  EndJudgeStage,
  BeginJudgeStageEnd,
  JudgeStageEnd,
  EndJudgeStageEnd,

  BeginDrawCardStageStart,
  DrawCardStageStart,
  EndDrawCardStageStart,
  BeginDrawCardStage,
  DrawCardStage,
  EndDrawCardStage,
  BeginDrawCardStageEnd,
  DrawCardStageEnd,
  EndDrawCardStageEnd,

  BeginPlayCardStageStart,
  PlayCardStageStart,
  EndPlayCardStageStart,
  BeginPlayCardStage,
  PlayCardStage,
  EndPlayCardStage,
  BeginPlayCardStageEnd,
  PlayCardStageEnd,
  EndPlayCardStageEnd,

  BeginDropCardStageStart,
  DropCardStageStart,
  EndDropCardStageStart,
  BeginDropCardStage,
  DropCardStage,
  EndDropCardStage,
  BeginDropCardStageEnd,
  DropCardStageEnd,
  EndDropCardStageEnd,

  BeginFinishStageStart,
  FinishStageStart,
  EndFinishStageStart,
  BeginFinishStage,
  FinishStage,
  EndFinishStage,
  BeginFinishStageEnd,
  FinishStageEnd,
  EndFinishStageEnd,
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
  [K in PlayerPhase]: PlayerStageListEnum[];
} = {
  [PlayerPhase.PrepareStage]: [
    PlayerStageListEnum.BeginPrepareStageStart,
    PlayerStageListEnum.PrepareStageStart,
    PlayerStageListEnum.EndPrepareStageStart,
    PlayerStageListEnum.BeginPrepareStage,
    PlayerStageListEnum.PrepareStage,
    PlayerStageListEnum.EndPrepareStage,
    PlayerStageListEnum.BeginPrepareStageEnd,
    PlayerStageListEnum.PrepareStageEnd,
    PlayerStageListEnum.EndPrepareStageEnd,
  ],
  [PlayerPhase.JudgeStage]: [
    PlayerStageListEnum.BeginJudgeStageStart,
    PlayerStageListEnum.JudgeStageStart,
    PlayerStageListEnum.EndJudgeStageStart,
    PlayerStageListEnum.BeginJudgeStage,
    PlayerStageListEnum.JudgeStage,
    PlayerStageListEnum.EndJudgeStage,
    PlayerStageListEnum.BeginJudgeStageEnd,
    PlayerStageListEnum.JudgeStageEnd,
    PlayerStageListEnum.EndJudgeStageEnd,
  ],
  [PlayerPhase.DrawCardStage]: [
    PlayerStageListEnum.BeginDrawCardStageStart,
    PlayerStageListEnum.DrawCardStageStart,
    PlayerStageListEnum.EndDrawCardStageStart,
    PlayerStageListEnum.BeginDrawCardStage,
    PlayerStageListEnum.DrawCardStage,
    PlayerStageListEnum.EndDrawCardStage,
    PlayerStageListEnum.BeginDrawCardStageEnd,
    PlayerStageListEnum.DrawCardStageEnd,
    PlayerStageListEnum.EndDrawCardStageEnd,
  ],
  [PlayerPhase.PlayCardStage]: [
    PlayerStageListEnum.BeginPlayCardStageStart,
    PlayerStageListEnum.PlayCardStageStart,
    PlayerStageListEnum.EndPlayCardStageStart,
    PlayerStageListEnum.BeginPlayCardStage,
    PlayerStageListEnum.PlayCardStage,
    PlayerStageListEnum.EndPlayCardStage,
    PlayerStageListEnum.BeginPlayCardStageEnd,
    PlayerStageListEnum.PlayCardStageEnd,
    PlayerStageListEnum.EndPlayCardStageEnd,
  ],
  [PlayerPhase.DropCardStage]: [
    PlayerStageListEnum.BeginDropCardStageStart,
    PlayerStageListEnum.DropCardStageStart,
    PlayerStageListEnum.EndDropCardStageStart,
    PlayerStageListEnum.BeginDropCardStage,
    PlayerStageListEnum.DropCardStage,
    PlayerStageListEnum.EndDropCardStage,
    PlayerStageListEnum.BeginDropCardStageEnd,
    PlayerStageListEnum.DropCardStageEnd,
    PlayerStageListEnum.EndDropCardStageEnd,
  ],
  [PlayerPhase.FinishStage]: [
    PlayerStageListEnum.BeginFinishStageStart,
    PlayerStageListEnum.FinishStageStart,
    PlayerStageListEnum.EndFinishStageStart,
    PlayerStageListEnum.BeginFinishStage,
    PlayerStageListEnum.FinishStage,
    PlayerStageListEnum.EndFinishStage,
    PlayerStageListEnum.BeginFinishStageEnd,
    PlayerStageListEnum.FinishStageEnd,
    PlayerStageListEnum.EndFinishStageEnd,
  ],
};

export const enum PhaseChangeStage {
  BeforePhaseChange = 'BeforePhaseChange',
  PhaseChanged = 'PhaseChanged',
  AfterPhaseChanged = 'AfterPhaseChanged',
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

export const enum CardLoseStage {
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

export const enum LoseHpStage {
  BeforeLoseHp = 'BeforeLoseHp',
  LosingHp = 'LosingHp',
  AfterLostHp = 'AfterLostHp',
}

export type GameEventStage =
  | PhaseChangeStage
  | GameStartStage
  | CardEffectStage
  | CardLoseStage
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
  | CardMoveStage;

export type AllStage = PlayerStageListEnum | GameEventStage;

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
    JudgeEffectStage.JudgeEffect,
    JudgeEffectStage.AfterJudgeEffect,
  ],
  [GameEventIdentifiers.PlayerDyingEvent]: [
    PlayerDyingStage.PlayerDying,
    PlayerDyingStage.AfterPlayerDying,
  ],
  [GameEventIdentifiers.PlayerDiedEvent]: [
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
  [GameEventIdentifiers.AimEvent]: [
    AimStage.OnAim,
    AimStage.OnAimmed,
    AimStage.AfterAim,
    AimStage.AfterAimmed,
  ],
  [GameEventIdentifiers.PhaseChangeEvent]: [
    PhaseChangeStage.BeforePhaseChange,
    PhaseChangeStage.PhaseChanged,
    PhaseChangeStage.AfterPhaseChanged,
  ],
};

export class StageProcessor {
  private gameEventStageList: GameEventStage[] = [];
  private currentGameEventStage: GameEventStage | undefined;
  private processingGameEvent = false;

  constructor(private logger: Logger) {}

  public involve(identifier: GameEventIdentifiers) {
    const stageList = gameEventStageList[identifier];
    if (stageList === undefined) {
      throw new Error(`Unable to get game event of ${identifier}`);
    }

    if (this.gameEventStageList.length > 0) {
      this.gameEventStageList = [...stageList, ...this.gameEventStageList];
    } else {
      this.gameEventStageList = stageList.slice();
    }

    this.currentGameEventStage = this.gameEventStageList[0];
    this.gameEventStageList.shift();
    this.processingGameEvent = true;

    return this.currentGameEventStage;
  }

  public nextInstantEvent(): GameEventStage | undefined {
    if (!this.gameEventStageList || !this.processingGameEvent) {
      return;
    }

    this.currentGameEventStage = this.gameEventStageList[0];
    this.gameEventStageList.shift();
    if (this.currentGameEventStage === undefined) {
      this.processingGameEvent = false;
      return;
    }

    return this.currentGameEventStage;
  }

  public skipEventProcess(identifier: GameEventIdentifiers) {
    let lastStage = this.currentGameEventStage;
    while (this.isInsideEvent(identifier, this.currentGameEventStage)) {
      this.nextInstantEvent();

      if (
        lastStage !== undefined &&
        this.currentGameEventStage !== undefined &&
        lastStage > this.currentGameEventStage
      ) {
        break;
      }

      lastStage = this.currentGameEventStage;
    }
  }

  public terminateEventProcess() {
    this.processingGameEvent = false;
    this.currentGameEventStage = undefined;
  }

  public get CurrentGameEventStage() {
    return this.currentGameEventStage;
  }

  public isCurrentGameEventDone() {
    return !this.processingGameEvent;
  }

  public isProcessingGameEvent() {
    return this.processingGameEvent;
  }

  public isInsideEvent(
    identifier: GameEventIdentifiers,
    stage?: GameEventStage,
  ) {
    if (stage === undefined) {
      return false;
    }

    const stageList = gameEventStageList[identifier];
    if (stageList === undefined) {
      throw new Error(`Can't find stage events of ${identifier}`);
    }

    return stageList.includes(stage);
  }

  public getGameStartStage() {
    return [
      GameStartStage.BeforeGameStart,
      GameStartStage.GameStarting,
      GameStartStage.AfterGameStarted,
    ];
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

      let createdStages: PlayerStageListEnum[] = [];
      for (const stage of stages) {
        createdStages = [...createdStages, ...playerStagesList[stage].slice()];
      }

      return createdStages;
    }
  }

  public getInsidePlayerPhase(specificStage: PlayerStageListEnum): PlayerPhase {
    for (const [stage, stageList] of (Object.entries(
      playerStagesList,
    ) as unknown) as [string, PlayerStageListEnum[]][]) {
      if (stageList.includes(specificStage)) {
        return parseInt(stage, 10) as PlayerPhase;
      }
    }

    throw new Error(`Unknown player stage: ${specificStage}`);
  }
}
