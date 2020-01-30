import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, GameEventIdentifiers } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, SkillType } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

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
    room.broadcast(GameEventIdentifiers.CardUseEvent, {
      fromId: room.getPlayerById(owner).Id,
      cardId: cardIds![0],
      toIds: targets!,
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} uses card {2} to {1}',
        room.CurrentPlayer.Name,
        room.getPlayerById(targets![0]).Name,
        this.name,
      ),
    });
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
      cardIds: [event.cardId],
      triggeredBySkillName: this.name,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} hits {1} for {2} {3} hp',
        room.getPlayerById(event.fromId).Name,
        room.getPlayerById(event.toId!).Name,
        1,
        this.damageType,
      ),
    };

    room.broadcast(GameEventIdentifiers.DamageEvent, eventContent);
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
