import { CardId } from 'core/cards/card';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { PlayerStage } from 'core/game/stage';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { translateNote } from 'translations/translations';

export class SlashSkill extends ActiveSkill {
  private damageType: DamageType = DamageType.Normal;

  constructor() {
    super('slash', 'slash_skill_description', SkillType.Common);
  }

  canUse(room: Room, owner: Player) {
    return (
      owner.cardUsedTimes(this.Name) < owner.availableCardUseTimes(this.Name)
    );
  }

  isAvailableCard() {
    return false;
  }

  cardFilter() {
    return true;
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  isAvailableTarget(room: Room, target: PlayerId) {
    return room.canAttack(room.CurrentPlayer, room.getPlayerById(target));
  }

  onUse(room: Room, owner: PlayerId, cardIds?: CardId[], targets?: PlayerId[]) {
    room.broadcast(
      GameEventIdentifiers.CardUseEvent,
      {
        fromId: room.getPlayerById(owner).Id,
        cardId: cardIds![0],
        toId: targets![0],
        triggeredBySkillName: this.name,
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
      triggeredBySkillName: this.name,
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
