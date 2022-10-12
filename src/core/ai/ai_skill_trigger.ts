import { VirtualCard } from 'core/cards/card';
import { ActiveSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import type { CardId } from 'core/cards/libs/card_props';
import type { ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import type { Player } from 'core/player/player';
import type { Room } from 'core/room/room';

export type ActiveSkillTrigger<T extends ActiveSkill> = ActiveCharacterSkillTrigger<T> | ActiveCardSkillTrigger<T>;

type ActiveCharacterSkillTrigger<T extends ActiveSkill> = (
  room: Room,
  ai: Player,
  skill: T,
) => ClientEventFinder<GameEventIdentifiers.SkillUseEvent> | undefined;
type ActiveCardSkillTrigger<T extends ActiveSkill> = (
  room: Room,
  ai: Player,
  skill: T,
  skillInCard: CardId,
) => ClientEventFinder<GameEventIdentifiers.CardUseEvent> | undefined;

export type TriggerSkillTrigger<T extends TriggerSkill, I extends GameEventIdentifiers = GameEventIdentifiers> = (
  room: Room,
  ai: Player,
  skill: T,
  onEvent: ServerEventFinder<I> | undefined,
  skillInCard?: CardId,
) => ClientEventFinder<GameEventIdentifiers.AskForSkillUseEvent> | undefined;

export type ViewAsSkillTrigger<
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent,
> = ViewAsCharacterSkillTrigger<I> | ViewAsCardSkillTrigger<I>;

type ViewAsCharacterSkillTrigger<
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent,
> = (room: Room, ai: Player, skill: ViewAsSkill, onEvent: ServerEventFinder<I>) => VirtualCard | undefined;
type ViewAsCardSkillTrigger<
  I extends
    | GameEventIdentifiers.AskForCardUseEvent
    | GameEventIdentifiers.AskForCardResponseEvent
    | GameEventIdentifiers.AskForPeachEvent,
> = (
  room: Room,
  ai: Player,
  skill: ViewAsSkill,
  onEvent: ServerEventFinder<I>,
  skillInCard: CardId,
) => VirtualCard | undefined;
