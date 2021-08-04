import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { stdLongDanPair } from './skills/std_longdan';
import { yiJiTriggerPair } from './skills/yiji';
import { zhiHengTriggerPair } from './skills/zhiheng';

export type ActiveSkillTrigger<T extends ActiveSkill> = (
  room: Room,
  ai: Player,
  skill: T,
) => ClientEventFinder<GameEventIdentifiers.SkillUseEvent> | undefined;

export type TriggerSkillTrigger<T extends TriggerSkill, I extends GameEventIdentifiers = GameEventIdentifiers> = (
  room: Room,
  ai: Player,
  skill: T,
  onEvent?: ServerEventFinder<I>,
) => boolean;

export type ViewAsSkillTrigger<
  T extends ViewAsSkill,
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent
> = (room: Room, ai: Player, skill: T, onEvent: ServerEventFinder<I>) => VirtualCard | undefined;

export type ActiveSkillTriggerPair<T extends ActiveSkill = ActiveSkill> = [string, ActiveSkillTrigger<T>];
export type TriggerSkillTriggerPair<T extends TriggerSkill, I extends GameEventIdentifiers> = [
  string,
  TriggerSkillTrigger<T, I>,
];
export type ViewAsSkillTriggerPair<
  T extends ViewAsSkill,
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent
> = [string, ViewAsSkillTrigger<T, I>];

export abstract class AiSkillTrigger {
  private static readonly activeSkillTriggerPairs: { [skillName: string]: ActiveSkillTrigger<any> } = {
    [zhiHengTriggerPair[0]]: zhiHengTriggerPair[1],
  };
  private static readonly triggerSkillTriggerPairs: { [skillName: string]: TriggerSkillTrigger<any, any> } = {
    [yiJiTriggerPair[0]]: yiJiTriggerPair[1],
  };
  private static readonly viewAsSkillTriggerPairs: { [skillName: string]: ViewAsSkillTrigger<any, any> } = {
    [stdLongDanPair[0]]: stdLongDanPair[1],
  };

  private static getActiveSkillTrigger<T extends ActiveSkill>(skill: T) {
    return AiSkillTrigger.activeSkillTriggerPairs[skill.GeneralName] as ActiveSkillTrigger<T> | undefined;
  }
  private static getTriggerSkillTrigger<T extends TriggerSkill>(skill: T) {
    return AiSkillTrigger.triggerSkillTriggerPairs[skill.GeneralName] as TriggerSkillTrigger<T> | undefined;
  }
  private static getViewAsSkillTrigger<
    T extends ViewAsSkill,
    I extends
      | GameEventIdentifiers.AskForCardUseEvent
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForPeachEvent
  >(skill: T) {
    return AiSkillTrigger.viewAsSkillTriggerPairs[skill.GeneralName] as ViewAsSkillTrigger<T, I> | undefined;
  }

  static fireActiveSkill<T extends ActiveSkill>(room: Room, ai: Player, skill: T) {
    return AiSkillTrigger.getActiveSkillTrigger(skill)?.(room, ai, skill);
  }

  static fireTriggerSkill<T extends TriggerSkill>(
    room: Room,
    ai: Player,
    skill: T,
    onEvent?: ServerEventFinder<GameEventIdentifiers>,
  ): boolean {
    return !!AiSkillTrigger.getTriggerSkillTrigger(skill)?.(room, ai, skill, onEvent);
  }

  static fireViewAsSkill<T extends ViewAsSkill, I extends GameEventIdentifiers>(
    room: Room,
    ai: Player,
    skill: T,
    onEvent: ServerEventFinder<I>,
  ): VirtualCard | undefined {
    return AiSkillTrigger.getViewAsSkillTrigger(skill)?.(room, ai, skill, onEvent as any);
  }

  static createViewAsPossibilties(
    room: Room,
    ai: Player,
    skill: ViewAsSkill,
    cards: CardId[],
    viewAs: CardMatcher | undefined,
    targets: PlayerId[],
  ): CardId[] | undefined {
    const selectedCards: CardId[] = [];
    const cardIndex = cards.findIndex(card => skill.isAvailableCard(room, ai, card, selectedCards, undefined, viewAs));
    selectedCards.push(...cards.splice(cardIndex, 1));

    if (skill.cardFilter(room, ai, selectedCards, targets)) {
      return selectedCards;
    }
  }
}
