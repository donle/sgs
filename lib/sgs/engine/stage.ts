export const enum PlayerStage {
  PrepareStageStart,
  PrepareStage,
  PrepareStageEnd,
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

export const enum CardUseStage {
  BeforeCardEffect,
  AfterCardEffect,
  BeforeDamageEffect,
  AfterDamageEffect,
}

export const enum SkillTriggeredStage {
  BeforeSkillEffect,
  AfterSkillEffect,
}
