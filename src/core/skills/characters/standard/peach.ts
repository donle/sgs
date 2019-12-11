import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { translateNote } from 'translations/translations';

export class PeachSkill extends ActiveSkill {
  constructor() {
    super('peach', 'peach_skill_description');
  }

  isAvailable() {
    return true;
  }

  cardFilter() {
    return true;
  }
  targetFilter(): boolean {
    return true;
  }

  availableCards() {
    return [];
  }
  availableTargets(): PlayerId[] {
    return [];
  }

  onUse(room: Room, cardIds?: CardId[]) {
    room.broadcast(
      GameEventIdentifiers.CardUseEvent,
      {
        fromId: room.CurrentPlayer.Id,
        cardId: cardIds![0],
      },
      translateNote(
        '{0} uses card {1}',
        room.CurrentPlayer.Name,
        Sanguosha.getCardById(cardIds![0]).Name,
      ),
    );
  }

  onEffect(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    const recoverContent = {
      fromId: event.fromId,
      toId: event.toId,
      recover: 1,
    };

    room.broadcast(
      GameEventIdentifiers.RecoverEvent,
      recoverContent,
      translateNote(
        '{0} recovers {1} hp',
        room.getPlayerById(recoverContent.toId).Name,
        recoverContent.recover.toString(),
      ),
    );
  }
}
