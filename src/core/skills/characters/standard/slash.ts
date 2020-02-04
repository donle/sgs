import {
  ClientEventFinder,
  EventPicker,
  GameEventIdentifiers,
  ServerEventFinder,
  WorkPlace,
} from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class SlashSkill extends ActiveSkill {
  protected damageType: DamageType = DamageType.Normal;

  constructor() {
    super('slash', 'slash_skill_description');
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

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} uses card {2} to {1}',
      room.CurrentPlayer.Name,
      room.getPlayerById(event.toIds![0]).Name,
      this.name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, fromId, cardId } = event;

    for (const toId of toIds || []) {
      const eventContent: EventPicker<
        GameEventIdentifiers.DamageEvent,
        WorkPlace.Server
      > = {
        fromId,
        toId,
        damage: 1,
        damageType: this.damageType,
        cardIds: [cardId],
        triggeredBySkillName: this.name,
        translationsMessage: fromId
          ? TranslationPack.translationJsonPatcher(
              '{0} hurts {1} for {2} {3} hp',
              room.getPlayerById(fromId).Name,
              room.getPlayerById(toId).Name,
              1,
              this.damageType,
            )
          : TranslationPack.translationJsonPatcher('${0} got '),
      };

      await room.Processor.onHandleIncomingEvent(
        GameEventIdentifiers.DamageEvent,
        eventContent,
      );
    }

    return true;
  }
}

export class ThunderSlashSkill extends SlashSkill {
  protected damageType = DamageType.Thunder;
}

export class FireSlashSkill extends SlashSkill {
  protected damageType = DamageType.Fire;
}
