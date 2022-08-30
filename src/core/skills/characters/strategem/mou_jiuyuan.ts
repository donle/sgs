import { CharacterNationality } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, LordSkill } from 'core/skills/skill_wrappers';

@LordSkill
@CompulsorySkill({ name: 'mou_jiuyuan', description: 'mou_jiuyuan_description' })
export class MouJiuYuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing || stage === AimStage.AfterAimmed;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId !== owner.Id &&
        room.getPlayerById(cardUseEvent.fromId).Nationality === CharacterNationality.Wu &&
        Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'peach'
      );
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.fromId !== owner.Id &&
        room.getPlayerById(aimEvent.fromId).Nationality === CharacterNationality.Wu &&
        Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'peach'
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
    } else {
      const aimEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      aimEvent.additionalRecoveredHp = (aimEvent.additionalRecoveredHp || 0) + 1;
    }

    return true;
  }
}
