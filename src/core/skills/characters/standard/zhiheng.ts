import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { translate, translateNote } from 'translations/translations';

export class ZhiHeng extends ActiveSkill {
  constructor() {
    super('zhiheng', 'zhiheng_description');
  }

  isAvailable() {
    return this.triggeredTimes < 1;
  }

  onEffect(
    room: Room,
    skillUseEvent: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): void {
    const numberOfCards = skillUseEvent.cardIds!.length;
    room.dropCards(skillUseEvent.cardIds!);
    room.drawCards(numberOfCards);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  availableTargets(): PlayerId[] {
    return [];
  }

  availableCards(room: Room, cards: CardId[]): CardId[] {
    return cards.filter(card =>
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(
        room.CurrentPlayer.cardFrom(card),
      ),
    );
  }

  onUse(room: Room, cardIds: CardId[]) {
    room.broadcast(
      GameEventIdentifiers.SkillUseEvent,
      { cardIds, fromId: room.CurrentPlayer.Id },
      translateNote(
        '{0} activates skill {1}',
        room.CurrentPlayer.Character.Name,
        this.name,
      ),
    );
  }
}
