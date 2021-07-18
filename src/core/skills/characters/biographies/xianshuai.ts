import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'xianshuai', description: 'xianshuai_description' })
export class XianShuai extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId !== undefined &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
        event => EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent,
        undefined,
        undefined,
        undefined,
        true,
      ).length === 1
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    await room.drawCards(1, fromId, 'top', fromId, this.Name);

    damageEvent.fromId === fromId &&
      (await room.damage({
        fromId,
        toId: damageEvent.toId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
