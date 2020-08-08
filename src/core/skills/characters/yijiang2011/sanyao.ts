import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'sanyao', description: 'sanyao_description' })
export class SanYao extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number[] {
    return [];
  }

  public targetFilter(
    room: Room,
    owner: Player,
    targets: PlayerId[],
    selectedCards: CardId[],
  ): boolean {
    return targets.length === selectedCards.length;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      owner !== target &&
      room.getOtherPlayers(owner).find(player => player.Hp > room.getPlayerById(target).Hp) === undefined
    );
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    for (const toId of skillUseEvent.toIds!) {
      const to = room.getPlayerById(toId);
      if (to.Dead) {
        continue;
      }

      await room.damage({
        fromId: skillUseEvent.fromId,
        toId,
        damage: 1,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
