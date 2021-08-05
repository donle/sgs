import { AiLibrary } from 'core/ai/ai_lib';
import { ViewAsSkillTrigger } from 'core/ai/ai_skill_trigger';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ViewAsSkill } from 'core/skills/skill';
import { BaseSkillTrigger } from './base_trigger';

export class ViewAsSkillTriggerClass extends BaseSkillTrigger {
  public createViewAsPossibilties(
    room: Room,
    ai: Player,
    cards: CardId[],
    skill: ViewAsSkill,
    viewAs: CardMatcher | undefined,
    targets: PlayerId[],
  ): CardId[] | undefined {
    const selectedCards: CardId[] = [];
    cards = AiLibrary.sortCardbyValue(cards, false);
    const cardIndex = cards.findIndex(card => skill.isAvailableCard(room, ai, card, selectedCards, undefined, viewAs));
    selectedCards.push(...cards.splice(cardIndex, 1));

    if (skill.cardFilter(room, ai, selectedCards, targets)) {
      return selectedCards;
    }
  }

  public readonly skillTrigger: ViewAsSkillTrigger<
    GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
  > = (
    room: Room,
    ai: Player,
    skill: ViewAsSkill,
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
    const viewAsCards = this.createViewAsPossibilties(
      room,
      ai,
      AiLibrary.sortCardbyValue(cards, false),
      skill,
      cardMacter,
      (onEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>).scopedTargets || [],
    );

    return viewAsCards ? skill.viewAs(viewAsCards, ai) : undefined;
  };
}
