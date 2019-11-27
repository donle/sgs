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
  BeforeCardEffect = 'BeforeCardEffect',
  AfterCardEffect = 'AfterCardEffect',
}

export const enum CardDropStage {
  BeforeCardDropEffect = 'BeforeCardDropEffect',
  AfterCardDropEffect = 'AfterCardDropEffect',
}

export const enum DamageEffectStage {
  BeforeDamageEffect = 'BeforeDamageEffect',
  AfterDamageEffect = 'AfterDamageEffect',
}

export const enum SkillActivateStage {
  BeforeSkillEffect = 'BeforeSkillEffect',
  AfterSkillEffect = 'AfterSkillEffect',
}

export type GameEventStage =
  | PlayerStage
  | CardUseStage
  | CardDropStage
  | DamageEffectStage
  | SkillActivateStage;
