import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CircleSkill, CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CircleSkill
@CommonSkill({ name: 'sheyi', description: 'sheyi_description' })
export class SheYi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      event.toId !== owner.Id &&
      owner.hasUsedSkill(this.Name) &&
      !room.getPlayerById(event.toId).Dead &&
      owner.Hp > room.getPlayerById(event.toId).Hp &&
      owner.getPlayerCards().length >= owner.Hp
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length >= owner.Hp;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to give at least {1} card(s) to {2} to prevent the damage?',
      this.Name,
      owner.Hp,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    if (event.cardIds && event.cardIds.length > 0) {
      await room.moveCards({
        movingCards: event.cardIds.map(card => ({ card, fromArea: room.getPlayerById(event.fromId).cardFrom(card) })),
        fromId: event.fromId,
        toId: damageEvent.toId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    damageEvent.damage = 0;
    EventPacker.terminate(damageEvent);

    return true;
  }
}
