import { CardId } from 'core/cards/card';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  WorkPlace,
} from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { translateNote } from 'translations/translations';

export class SlashSkill extends ActiveSkill {
  private damageType: DamageType = DamageType.Normal;

  isAvailable() {
    return !this.hasUsed();
  }

  availableCards(room: Room<WorkPlace>, cards: CardId[]) {
    return [];
  }

  cardFilter() {
    return true;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  availableTargets(room: Room, targets: PlayerId[]): PlayerId[] {
    return targets.filter(target =>
      room.canAttack(room.CurrentPlayer, room.getPlayerById(target)),
    );
  }

  onUse(room: Room, cardIds?: CardId[], targets?: PlayerId[]) {
    room.broadcast(
      GameEventIdentifiers.CardUseEvent,
      {
        fromId: room.CurrentPlayer.Id,
        cardId: cardIds![0],
        toId: targets![0],
      },
      translateNote(
        '{0} uses card {2} to {1}',
        room.CurrentPlayer.Name,
        room.getPlayerById(targets![0]).Name,
        this.name,
      ),
    );
  }

  onEffect(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    const eventContent = {
      fromId: event.fromId,
      toId: event.toId,
      damage: 1,
      damageType: this.damageType,
    };

    room.broadcast(
      GameEventIdentifiers.DamageEvent,
      eventContent,
      translateNote(
        '{0} hits {1} for {2} hp',
        room.getPlayerById(eventContent.fromId).Name,
        room.getPlayerById(eventContent.toId!).Name,
        eventContent.damage.toString(),
      ),
    );
  }
}
