import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'xuehen', description: 'xuehen_description' })
export class XueHen extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public numberOfTargets() {
    return [];
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length > 0 && targets.length <= Math.max(owner.LostHp, 1);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return true;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId) && Sanguosha.getCardById(cardId).isRed();
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds || !event.cardIds) {
      return false;
    }
    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    for (const toId of event.toIds) {
      await room.chainedOn(toId);
    }

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: event.toIds,
        toId: event.fromId,
        requiredAmount: 1,
        conversation: 'xuehen: please choose a target to deal 1 fire damage',
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedPlayers = response.selectedPlayers || [
      event.toIds[Math.floor(Math.random() * event.toIds.length)],
    ];

    await room.damage({
      fromId: event.fromId,
      toId: response.selectedPlayers[0],
      damage: 1,
      damageType: DamageType.Fire,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
