import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { StdLongDan } from 'core/skills';
import { AiLibrary } from '../ai_lib';
import { AiSkillTrigger, ViewAsSkillTrigger, ViewAsSkillTriggerPair } from '../ai_skill_trigger';

export const StdLongDanTrigger: ViewAsSkillTrigger<
  StdLongDan,
  GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
> = (
  room: Room,
  ai: Player,
  skill: StdLongDan,
  onEvent: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>,
) => {
  if (!skill.canUse(room, ai, onEvent)) {
    return;
  }

  const cards = skill.availableCardAreas().reduce<CardId[]>((savedCards, area) => {
    savedCards.push(...ai.getCardIds(area));

    return savedCards;
  }, []);

  const cardMacter = new CardMatcher(onEvent.cardMatcher);
  const viewAsCards = AiSkillTrigger.createViewAsPossibilties(
    room,
    ai,
    skill,
    AiLibrary.sortCardbyValue(cards, false),
    cardMacter,
    (onEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>).scopedTargets || [],
  );

  return viewAsCards ? skill.viewAs(viewAsCards) : undefined;
};

export const stdLongDanPair: ViewAsSkillTriggerPair<
  StdLongDan,
  GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
> = [StdLongDan.GeneralName, StdLongDanTrigger];
