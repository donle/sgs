import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { translateNote } from 'translations/translations';

export class ZhiHeng extends ActiveSkill {
  constructor() {
    super('zhiheng', 'zhiheng_description', SkillType.Common);
  }

  canUse(room: Room, owner: Player) {
    return room.CurrentPlayer === owner && !owner.hasUsedSkill(this.name);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(): boolean {
    return false;
  }

  isAvailableCard(room: Room, cardId: CardId): boolean {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(
      room.CurrentPlayer.cardFrom(cardId),
    );
  }

  onUse(room: Room, owner: PlayerId, cardIds: CardId[]) {
    room.broadcast(
      GameEventIdentifiers.SkillUseEvent,
      {
        cardIds,
        fromId: room.CurrentPlayer.Id,
        triggeredBySkillName: this.name,
      },
      translateNote(
        '{0} activates skill {1}',
        room.CurrentPlayer.Character.Name,
        this.name,
      ),
    );
  }

  onEffect(
    room: Room,
    skillUseEvent: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): void {
    const numberOfCards = skillUseEvent.cardIds!.length;
    room.dropCards(skillUseEvent.cardIds!);
    room.drawCards(numberOfCards);
  }
}
