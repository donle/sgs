import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'mingshi', description: 'mingshi_description' })
export class MingShi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.toId === owner.Id &&
      content.fromId !== undefined &&
      !room.getPlayerById(content.fromId).Dead &&
      room.getPlayerById(content.fromId).getPlayerCards().length > 0
    );
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    const source = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;

    const response = await room.askForCardDrop(
      source,
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      true,
      undefined,
      this.Name,
    );

    response.droppedCards.length > 0 &&
      (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, source, source, this.Name));

    return true;
  }
}
