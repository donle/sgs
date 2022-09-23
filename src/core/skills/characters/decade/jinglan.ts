import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'jinglan', description: 'jinglan_description' })
export class JingLan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return event.fromId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const hp = room.getPlayerById(event.fromId).Hp;
    const handcardsNum = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length;

    if (handcardsNum > hp) {
      const response = await room.askForCardDrop(
        event.fromId,
        3,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.Name,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name));
    } else if (handcardsNum === hp) {
      const response = await room.askForCardDrop(
        event.fromId,
        1,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.Name,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name));

      await room.recover({
        toId: event.fromId,
        recoveredHp: 1,
        recoverBy: event.fromId,
      });
    } else {
      await room.damage({
        toId: event.fromId,
        damage: 1,
        damageType: DamageType.Fire,
        triggeredBySkills: [this.Name],
      });

      await room.drawCards(4, event.fromId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
