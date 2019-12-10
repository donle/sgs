export const enum PlayerStage {
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

export const enum CardUseStage {
  BeforeCardUseEffect = 'BeforeCardUseEffect',
  AfterCardUseEffect = 'AfterCardUseEffect',
}

export const enum CardResponseStage {
  BeforeCardResponseEffect = 'BeforeCardResponseEffect',
  AfterCardResponseEffect = 'AfterCardResponseEffect',
}

export const enum CardDropStage {
  BeforeCardDropEffect = 'BeforeCardDropEffect',
  AfterCardDropEffect = 'AfterCardDropEffect',
}

export const enum DamageEffectStage {
  BeforeDamageEffect = 'BeforeDamageEffect',
  AfterDamageEffect = 'AfterDamageEffect',
}

export const enum JudgeEffectStage {
  BeforeJudgeEffectStage = 'BeforeJudgeEffectStage',
  AfterJudgeEffectStage = 'AfterJudgeEffectStage',
}

export const enum PlayerDiedStage {
  BeforePlayerDied = 'BeforePlayerDied',
  AfterPlayerDied = 'AfterPlayerDied',
}

export const enum SkillEffectStage {
  BeforeSkillEffect = 'BeforeSkillEffect',
  AfterSkillEffect = 'AfterSkillEffect',
}

export type GameEventStage =
  | CardUseStage
  | CardDropStage
  | CardResponseStage
  | JudgeEffectStage
  | PlayerDiedStage
  | DamageEffectStage
  | SkillEffectStage;

export type AllStage = PlayerStage | GameEventStage;
