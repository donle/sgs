import { GameEventIdentifiers } from 'core/event/event';

export const enum PlayerStageListEnum {
  PrepareStageStart = 'PrepareStageStart',
  PrepareStage = 'PrepareStage',
  PrepareStageEnd = 'PrepareStageEnd',

  JudgeStageStart = 'JudgeStageStart',
  JudgeStage = 'JudgeStage',
  JudgeStageEnd = 'JudgeStageEnd',

  DrawCardStageStart = 'DrawCardStageStart',
  DrawCardStage = 'DrawCardStage',
  DrawCardStageEnd = 'DrawCardStageEnd',

  PlayCardStageStart = 'PlayCardStageStart',
  PlayCardStage = 'PlayCardStage',
  PlayCardStageEnd = 'PlayCardStageEnd',

  DropCardStageStart = 'DropCardStageStart',
  DropCardStage = 'DropCardStage',
  DropCardStageEnd = 'DropCardStageEnd',

  FinishStageStart = 'FinishStageStart',
  FinishStage = 'FinishStage',
  FinishStageEnd = 'FinishStageEnd',
}

export const enum PlayerStage {
  PrepareStage,
  JudgeStage,
  DrawCardStage,
  PlayCardStage,
  DropCardStage,
  FinishStage,
}

export const PlayerStages = {
  [PlayerStage.PrepareStage]: [
    PlayerStageListEnum.PrepareStageStart,
    PlayerStageListEnum.PrepareStage,
    PlayerStageListEnum.DrawCardStageEnd,
  ],
  [PlayerStage.JudgeStage]: [
    PlayerStageListEnum.JudgeStageStart,
    PlayerStageListEnum.JudgeStage,
    PlayerStageListEnum.DrawCardStageEnd,
  ],
  [PlayerStage.DrawCardStage]: [
    PlayerStageListEnum.DrawCardStageStart,
    PlayerStageListEnum.DrawCardStage,
    PlayerStageListEnum.DrawCardStageEnd,
  ],
  [PlayerStage.PlayCardStage]: [
    PlayerStageListEnum.PlayCardStageStart,
    PlayerStageListEnum.PlayCardStage,
    PlayerStageListEnum.PlayCardStageEnd,
  ],
  [PlayerStage.DropCardStage]: [
    PlayerStageListEnum.DropCardStageStart,
    PlayerStageListEnum.DropCardStage,
    PlayerStageListEnum.DropCardStageEnd,
  ],
  [PlayerStage.FinishStage]: [
    PlayerStageListEnum.FinishStageStart,
    PlayerStageListEnum.FinishStage,
    PlayerStageListEnum.FinishStageEnd,
  ],
};

export const GameStages = {
  [GameEventIdentifiers.CardUseEvent]: [
    CardUseStage.BeforeCardUseEffect,
    CardUseStage.CardUsed,
    CardUseStage.AfterCardUseEffect,
  ],
  [GameEventIdentifiers.CardResponseEvent]: [
    CardResponseStage.BeforeCardResponseEffect,
    CardResponseStage.CardResponsed,
    CardResponseStage.AfterCardResponseEffect,
  ],
  [GameEventIdentifiers.CardDropEvent]: [
    CardDropStage.BeforeCardDropEffect,
    CardDropStage.CardDropped,
    CardDropStage.AfterCardDropEffect,
  ],
  [GameEventIdentifiers.DamageEvent]: [
    DamageEffectStage.BeforeDamageEffect,
    DamageEffectStage.DamageEffect,
    DamageEffectStage.AfterDamageEffect,
  ],
  [GameEventIdentifiers.JudgeEvent]: [
    JudgeEffectStage.BeforeJudgeEffectStage,
    JudgeEffectStage.JudgeEffect,
    JudgeEffectStage.AfterJudgeEffectStage,
  ],
  [GameEventIdentifiers.PlayerDiedEvent]: [
    PlayerDiedStage.BeforePlayerDied,
    PlayerDiedStage.PlayerDied,
    PlayerDiedStage.AfterPlayerDied,
  ],
  [GameEventIdentifiers.SkillUseEvent]: [
    SkillEffectStage.BeforeSkillEffect,
    SkillEffectStage.SkillEffect,
    SkillEffectStage.AfterSkillEffect,
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
};

export const enum CardUseStage {
  BeforeCardUseEffect = 'BeforeCardUseEffect',
  CardUsed = 'CardUsed',
  AfterCardUseEffect = 'AfterCardUseEffect',
}

export const enum CardResponseStage {
  BeforeCardResponseEffect = 'BeforeCardResponseEffect',
  CardResponsed = 'CardResponsed',
  AfterCardResponseEffect = 'AfterCardResponseEffect',
}

export const enum DrawCardStage {
  BeforeDrawCardEffect = 'BeforeDrawCardEffect',
  CardDrawed = 'CardDrawed',
  AfterDrawCardEffect = 'AfterDrawCardEffect',
}

export const enum ObtainCardStage {
  BeforeObtainCardEffect = 'BeforeObtainCardEffect',
  CardObtained = 'CardObtained',
  AfterObtainCardEffect = 'AfterObtainCardEffect',
}

export const enum CardDropStage {
  BeforeCardDropEffect = 'BeforeCardDropEffect',
  CardDropped = 'CardDropped',
  AfterCardDropEffect = 'AfterCardDropEffect',
}

export const enum DamageEffectStage {
  BeforeDamageEffect = 'BeforeDamageEffect',
  DamageEffect = 'DamageEffect',
  AfterDamageEffect = 'AfterDamageEffect',
}

export const enum JudgeEffectStage {
  BeforeJudgeEffectStage = 'BeforeJudgeEffectStage',
  JudgeEffect = 'JudgeEffect',
  AfterJudgeEffectStage = 'AfterJudgeEffectStage',
}

export const enum PinDianStage {
  BeforePinDianEffect = 'BeforePinDianEffect',
  PinDianEffect = 'PinDianEffect',
  AfterPinDianEffect = 'AfterPinDianEffect',
}

export const enum PlayerDiedStage {
  BeforePlayerDied = 'BeforePlayerDied',
  PlayerDied = 'PlayerDied',
  AfterPlayerDied = 'AfterPlayerDied',
}

export const enum SkillEffectStage {
  BeforeSkillEffect = 'BeforeSkillEffect',
  SkillEffect = 'SkillEffect',
  AfterSkillEffect = 'AfterSkillEffect',
}

export const enum RecoverEffectStage {
  BeforeRecoverEffect = 'BeforeRecoverEffect',
  RecoverEffect = 'RecoverEffect',
  AfterRecoverEffect = 'AfterRecoverEffect',
}

export type GameEventStage =
  | CardUseStage
  | CardDropStage
  | CardResponseStage
  | DrawCardStage
  | ObtainCardStage
  | JudgeEffectStage
  | RecoverEffectStage
  | PinDianStage
  | PlayerDiedStage
  | DamageEffectStage
  | SkillEffectStage;

export type AllStage = PlayerStageListEnum | GameEventStage;
