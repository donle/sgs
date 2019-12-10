import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Room } from 'core/game/room';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { ActiveSkill } from 'core/skills/skill';
import { translate } from 'translations/translations';

export class ZhiHeng extends ActiveSkill {
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

  availableTargets(room: Room, targets: PlayerId[]): PlayerId[] {
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
    const language = room.CurrentPlayer.PlayerLanguage;

    room.broadcast(GameEventIdentifiers.SkillUseEvent, {
      cardIds,
      message: translate(
        '{0} activates skill {1}',
        translate(room.CurrentPlayer.Character.Name).to(language),
        translate(this.Name).to(language),
      ).to(language),
    });
  }

  isAutoActivate() {
    return false;
  }
}
