import { GameEventIdentifiers } from 'core/event/event';

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

export const enum PlayerStage {
  PrepareStage,
  JudgeStage,
  DrawCardStage,
  PlayCardStage,
  DropCardStage,
  FinishStage,
}

const playerStagesList: {
  [K in PlayerStage]: PlayerStageListEnum[];
} = {
  [PlayerStage.PrepareStage]: [
    PlayerStageListEnum.BeginPrepareStageStart,
    PlayerStageListEnum.PrepareStageStart,
    PlayerStageListEnum.EndPrepareStageStart,
    PlayerStageListEnum.BeginPrepareStage,
    PlayerStageListEnum.PrepareStage,
    PlayerStageListEnum.EndPrepareStage,
    PlayerStageListEnum.BeginDrawCardStageEnd,
    PlayerStageListEnum.DrawCardStageEnd,
    PlayerStageListEnum.EndDrawCardStageEnd,
  ],
  [PlayerStage.JudgeStage]: [
    PlayerStageListEnum.BeginJudgeStageStart,
    PlayerStageListEnum.JudgeStageStart,
    PlayerStageListEnum.EndJudgeStageStart,
    PlayerStageListEnum.BeginJudgeStage,
    PlayerStageListEnum.JudgeStage,
    PlayerStageListEnum.EndJudgeStage,
    PlayerStageListEnum.BeginDrawCardStageEnd,
    PlayerStageListEnum.DrawCardStageEnd,
    PlayerStageListEnum.EndDrawCardStageEnd,
  ],
  [PlayerStage.DrawCardStage]: [
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
  [PlayerStage.PlayCardStage]: [
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
  [PlayerStage.DropCardStage]: [
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
  [PlayerStage.FinishStage]: [
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

const gameEventStageList: {
  [K in GameEventIdentifiers]?: GameEventStage[];
} = {
  [GameEventIdentifiers.GameStartEvent]: [
    GameStartStage.BeforeGameStart,
    GameStartStage.GameStarted,
    GameStartStage.AfterGameStarted,
  ],
  [GameEventIdentifiers.CardUseEvent]: [
    CardUseStage.BeforeCardUseEffect,
    CardUseStage.CardUsed,
    CardUseStage.AfterCardUseEffect,
  ],
  [GameEventIdentifiers.CardEffectEvent]: [
    CardUseStage.BeforeCardUseEffect,
    CardUseStage.CardUsed,
    CardUseStage.AfterCardUseEffect,
  ],
  [GameEventIdentifiers.CardResponseEvent]: [
    CardResponseStage.BeforeCardResponseEffect,
    CardResponseStage.CardResponsed,
    CardResponseStage.AfterCardResponseEffect,
  ],
  [GameEventIdentifiers.DrawCardEvent]: [
    DrawCardStage.BeforeDrawCardEffect,
    DrawCardStage.CardDrawed,
    DrawCardStage.AfterDrawCardEffect,
  ],
  [GameEventIdentifiers.CardDropEvent]: [
    CardDropStage.BeforeCardDropEffect,
    CardDropStage.CardDropped,
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
    PlayerDyingStage.BeforePlayerDying,
    PlayerDyingStage.PlayerDying,
    PlayerDyingStage.AfterPlayerDying,
  ],
  [GameEventIdentifiers.PlayerDiedEvent]: [
    PlayerDiedStage.BeforePlayerDied,
    PlayerDiedStage.PlayerDied,
    PlayerDiedStage.AfterPlayerDied,
  ],
  [GameEventIdentifiers.SkillUseEvent]: [
    SkillUseStage.BeforeSkillUse,
    SkillUseStage.SkillUsed,
    SkillUseStage.AfterSkillUsed,
  ],
  [GameEventIdentifiers.SkillEffectEvent]: [
    SkillEffectStage.BeforeSkillEffect,
    SkillEffectStage.SkillEffected,
    SkillEffectStage.AfterSkillEffected,
  ],
  [GameEventIdentifiers.RecoverEvent]: [
    RecoverEffectStage.BeforeRecoverEffect,
    RecoverEffectStage.RecoverEffect,
    RecoverEffectStage.AfterRecoverEffect,
  ],
  [GameEventIdentifiers.DrawCardEvent]: [
    DrawCardStage.BeforeDrawCardEffect,
    DrawCardStage.CardDrawed,
    DrawCardStage.AfterDrawCardEffect,
  ],
  [GameEventIdentifiers.ObtainCardEvent]: [
    ObtainCardStage.BeforeObtainCardEffect,
    ObtainCardStage.CardObtained,
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
};

export const enum GameStartStage {
  BeforeGameStart,
  GameStarted,
  AfterGameStarted,
}

export const enum AimStage {
  OnAim,
  OnAimmed,
  AfterAim,
  AfterAimmed,
}

export const enum CardUseStage {
  BeforeCardUseEffect,
  CardUsed,
  AfterCardUseEffect,
}

export const enum CardEffectStage {
  BeforeCardEffect,
  CardEffect,
  AfterCardEffect,
}

export const enum CardResponseStage {
  BeforeCardResponseEffect,
  CardResponsed,
  AfterCardResponseEffect,
}

export const enum DrawCardStage {
  BeforeDrawCardEffect,
  CardDrawed,
  AfterDrawCardEffect,
}

export const enum ObtainCardStage {
  BeforeObtainCardEffect,
  CardObtained,
  AfterObtainCardEffect,
}

export const enum CardDropStage {
  BeforeCardDropEffect,
  CardDropped,
  AfterCardDropEffect,
}

export const enum DamageEffectStage {
  DamageEffect,
  DamagedEffect,
  AfterDamageEffect,
  AfterDamagedEffect,
}

export const enum JudgeEffectStage {
  OnJudge,
  JudgeEffect,
  AfterJudgeEffect,
}

export const enum PinDianStage {
  BeforePinDianEffect,
  PinDianEffect,
  AfterPinDianEffect,
}

export const enum PlayerDyingStage {
  BeforePlayerDying,
  PlayerDying,
  AfterPlayerDying,
}
export const enum PlayerDiedStage {
  BeforePlayerDied,
  PlayerDied,
  AfterPlayerDied,
}

export const enum SkillUseStage {
  BeforeSkillUse,
  SkillUsed,
  AfterSkillUsed,
}
export const enum SkillEffectStage {
  BeforeSkillEffect,
  SkillEffected,
  AfterSkillEffected,
}

export const enum RecoverEffectStage {
  BeforeRecoverEffect,
  RecoverEffect,
  AfterRecoverEffect,
}

export type GameEventStage =
  | GameStartStage
  | CardEffectStage
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
  | SkillEffectStage;

export type AllStage = PlayerStageListEnum | GameEventStage;

export class StageProcessor {
  private currentPlayerStageInSpecific: PlayerStageListEnum | undefined;
  private currentPlayerStage: PlayerStage | undefined;
  private stagePointer: number;
  private readonly playerSpecificStagesList: PlayerStageListEnum[];

  private gameEventStageList: GameEventStage[] = [];
  private currentGameEventStage: GameEventStage | undefined;
  private processingGameEvent = false;

  constructor() {
    for (let i = 0; i < PlayerStageListEnum.EndFinishStageEnd; i++) {
      this.playerSpecificStagesList.push(i);
    }

    this.stagePointer = -1;
    this.currentPlayerStageInSpecific = undefined;
    this.currentPlayerStage = undefined;
  }

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

    this.currentGameEventStage = this.gameEventStageList.shift();
    this.processingGameEvent = true;

    return this.currentGameEventStage;
  }

  public nextInstantEvent(): GameEventStage | undefined {
    if (!this.gameEventStageList || !this.processingGameEvent) {
      return;
    }

    this.currentGameEventStage = this.gameEventStageList.shift();
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

  public nextStage(): PlayerStage | undefined {
    if (++this.stagePointer >= this.playerSpecificStagesList.length) {
      return;
    }

    this.currentPlayerStageInSpecific = this.playerSpecificStagesList[
      this.stagePointer
    ];
    this.currentPlayerStage = this.getInsidePlayerStage(
      this.currentPlayerStageInSpecific,
    );

    return this.currentPlayerStage;
  }

  public turnToNextPlayer() {
    this.stagePointer = -1;
    return this.nextStage();
  }

  public get CurrentGameEventStage() {
    return this.currentGameEventStage;
  }

  public get CurrentPlayerStageInSpecific() {
    return this.currentPlayerStageInSpecific;
  }

  public get CurrentPlayerStage() {
    return this.currentPlayerStage;
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

  public createPlayerStage(stage?: PlayerStage) {
    if (stage !== undefined) {
      return playerStagesList[stage].slice();
    } else {
      const stages = [
        PlayerStage.PrepareStage,
        PlayerStage.JudgeStage,
        PlayerStage.DrawCardStage,
        PlayerStage.PlayCardStage,
        PlayerStage.DropCardStage,
        PlayerStage.FinishStage,
      ];

      let createdStages: PlayerStageListEnum[] = [];
      for (const stage of stages) {
        createdStages = [...createdStages, ...playerStagesList[stage].slice()];
      }

      return createdStages;
    }
  }

  public getInsidePlayerStage(specificStage: PlayerStageListEnum): PlayerStage {
    for (const [stage, stageList] of (Object.entries(
      playerStagesList,
    ) as unknown) as [PlayerStage, PlayerStageListEnum[]][]) {
      if (stageList.includes(specificStage)) {
        return stage;
      }
    }

    throw new Error(`Unknown player stage: ${specificStage}`);
  }
}
