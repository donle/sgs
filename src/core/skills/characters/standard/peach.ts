import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerStage } from 'core/game/stage';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { translateNote } from 'translations/translations';

export class PeachSkill extends ActiveSkill {
  constructor() {
    super('peach', 'peach_skill_description', SkillType.Common);
  }

  canUse(room: Room, owner: Player) {
    return room.CurrentPlayer === owner && room.CurrentPlayerStage === PlayerStage.PlayCardStage;
  }

  cardFilter() {
    return true;
  }
  targetFilter(): boolean {
    return true;
  }

  isAvailableCard() {
    return false;
  }
  isAvailableTarget() {
    return false;
  }

  onUse(room: Room, owner: PlayerId, cardIds?: CardId[]) {
    room.broadcast(
      GameEventIdentifiers.CardUseEvent,
      {
        fromId: room.getPlayerById(owner).Id,
        cardId: cardIds![0],
        triggeredBySkillName: this.name,
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
      triggeredBySkillName: this.name,
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
