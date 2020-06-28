import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'baiyinshizi', description: 'baiyinshizi_description' })
export class BaiYinShiZiSkill extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.DamagedEffect || stage === CardMoveStage.BeforeCardMoving;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent>) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && damageEvent.damage > 1;
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveEvent = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const equipCards = moveEvent.movingCards
        .filter(card => card.fromArea === PlayerCardsArea.EquipArea)
        .filter(equip => Sanguosha.getCardById(equip.card).GeneralName === 'baiyinshizi');
      return (
        moveEvent.fromId === owner.Id &&
        equipCards.length > 0
      );
    }
    return false;
  }

  async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    content.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activated skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
      this.Name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.MoveCardEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage = 1;
      damageEvent.messages = damageEvent.messages || [];
      damageEvent.messages.push(
        TranslationPack.translationJsonPatcher(
          '{0} activated skill {1}, damage reduces to {2}',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
          this.Name,
          damageEvent.damage,
        ).toString(),
      );
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const from = room.getPlayerById(fromId);
      if (!from.Dead && from.Hp < from.MaxHp) {
        await room.recover({
          recoveredHp: 1,
          toId: fromId,
          triggeredBySkills: [this.Name],
        });
      }
    }

    return true;
  }
}
