import { VirtualCard } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ActiveSkillTriggerClass } from './skills/base/active_skill_trigger';
import { BaseSkillTrigger } from './skills/base/base_trigger';
import { TriggerSkillTriggerClass } from './skills/base/trigger_skill_trigger';
import { ViewAsSkillTriggerClass } from './skills/base/view_as_skill_trigger';

export type ActiveSkillTrigger<T extends ActiveSkill> = (
  room: Room,
  ai: Player,
  skill: T,
  skillInCard?: CardId,
) =>
  | ClientEventFinder<GameEventIdentifiers.SkillUseEvent>
  | ClientEventFinder<GameEventIdentifiers.CardUseEvent>
  | undefined;

export type TriggerSkillTrigger<T extends TriggerSkill, I extends GameEventIdentifiers = GameEventIdentifiers> = (
  room: Room,
  ai: Player,
  skill: T,
  onEvent?: ServerEventFinder<I>,
  skillInCard?: CardId,
) => ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined;

export type ViewAsSkillTrigger<
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent
> = (
  room: Room,
  ai: Player,
  skill: ViewAsSkill,
  onEvent: ServerEventFinder<I>,
  skillInCard?: CardId,
) => VirtualCard | undefined;

export type ActiveSkillTriggerPair<T extends ActiveSkill = ActiveSkill> = [string, ActiveSkillTrigger<T>];
export type TriggerSkillTriggerPair<T extends TriggerSkill, I extends GameEventIdentifiers> = [
  string,
  TriggerSkillTrigger<T, I>,
];

export abstract class AiSkillTrigger {
  private static readonly activeSkillTriggerPairs: { [skillName: string]: ActiveSkillTriggerClass } = {};
  private static readonly triggerSkillTriggerPairs: { [skillName: string]: TriggerSkillTriggerClass } = {};
  private static readonly viewAsSkillTriggerPairs: { [skillName: string]: ViewAsSkillTriggerClass } = {};

  public static installViewAsSkillTrigger(skill: ViewAsSkill, triggerInstace: ViewAsSkillTriggerClass) {
    this.viewAsSkillTriggerPairs[skill.Name] = triggerInstace;
  }
  public static installTriggerSkillTrigger(skill: TriggerSkill, triggerInstace: TriggerSkillTriggerClass) {
    this.triggerSkillTriggerPairs[skill.Name] = triggerInstace;
  }
  public static installActiveSkillTrigger(skill: ActiveSkill, triggerInstace: ActiveSkillTriggerClass) {
    this.activeSkillTriggerPairs[skill.Name] = triggerInstace;
  }

  public static getActiveSkillTrigger<T extends ActiveSkill>(skill: T) {
    return AiSkillTrigger.activeSkillTriggerPairs[skill.Name] as ActiveSkillTriggerClass | undefined;
  }
  public static getTriggerSkillTrigger<T extends TriggerSkill>(skill: T) {
    return AiSkillTrigger.triggerSkillTriggerPairs[skill.Name] as TriggerSkillTriggerClass | undefined;
  }
  public static getViewAsSkillTrigger<T extends ViewAsSkill>(skill: T) {
    return AiSkillTrigger.viewAsSkillTriggerPairs[skill.Name] as ViewAsSkillTriggerClass | undefined;
  }

  public static getSkillTrigger(skillName: string): BaseSkillTrigger | undefined {
    return (
      AiSkillTrigger.activeSkillTriggerPairs[skillName] ||
      AiSkillTrigger.triggerSkillTriggerPairs[skillName] ||
      AiSkillTrigger.viewAsSkillTriggerPairs[skillName]
    );
  }

  static fireActiveSkill<I extends GameEventIdentifiers.SkillUseEvent | GameEventIdentifiers.CardUseEvent>(
    room: Room,
    ai: Player,
    skill: ActiveSkill,
    skillInCard?: CardId,
  ): ClientEventFinder<I> {
    return AiSkillTrigger.getActiveSkillTrigger(skill)?.skillTrigger(room, ai, skill, skillInCard) as ClientEventFinder<
      I
    >;
  }

  static fireTriggerSkill<T extends TriggerSkill>(
    room: Room,
    ai: Player,
    skill: T,
    onEvent?: ServerEventFinder<GameEventIdentifiers>,
    skillInCard?: CardId,
  ): ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined {
    return AiSkillTrigger.getTriggerSkillTrigger(skill)?.skillTrigger(room, ai, skill, onEvent, skillInCard);
  }
}
