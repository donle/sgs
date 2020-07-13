import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'shenfen', description: 'shenfen_description' })
export class ShenFen extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return room.getMark(owner.Id, MarkEnum.Wrath) >= 6 && !owner.hasUsedSkill(this.GeneralName);
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onAngry(
    room: Room,
    fromId: PlayerId,
    effect: (fromId: PlayerId, to: Player) => Promise<void>,
  ): Promise<void> {
    const targets = room.getOtherPlayers(fromId);
    for (const target of targets) {
      if (target.Dead) {
        continue;
      }

      await effect(fromId, target);
    }
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    room.addMark(skillEffectEvent.fromId, MarkEnum.Wrath, -6);

    await this.onAngry(room, skillEffectEvent.fromId, async (fromId, to) => {
      await room.damage({
        fromId,
        toId: to.Id,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.GeneralName],
      });
    });

    await this.onAngry(room, skillEffectEvent.fromId, async (fromId, to) => {
      const equipCardIds = to.getCardIds(PlayerCardsArea.EquipArea);
      await room.dropCards(CardMoveReason.SelfDrop, equipCardIds, to.Id, to.Id, this.GeneralName);
    });

    await this.onAngry(room, skillEffectEvent.fromId, async (fromId, to) => {
      const handCardIds = to.getCardIds(PlayerCardsArea.HandArea);
      if (handCardIds.length <= 4) {
        await room.dropCards(CardMoveReason.SelfDrop, handCardIds, to.Id, to.Id, this.GeneralName);
      } else {
        const response = await room.askForCardDrop(
          to.Id,
          4,
          [PlayerCardsArea.HandArea],
          true,
          undefined,
          this.GeneralName,
          'shenfen: please select 4 cards to drop',
        );
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, to.Id, to.Id, this.GeneralName);
      }
    });

    await room.turnOver(skillEffectEvent.fromId);

    return true;
  }
}
