import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'liuli', description: 'liuli_description' })
export class LiuLi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.OnAimmed &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    room.setFlag(owner.Id, this.Name, event.fromId);
    return event.toId === owner.Id && owner.getPlayerCards().length > 0;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }
  public availableCardAreas() {
    return [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea];
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    const from = room.getPlayerById(owner);
    const to = room.getPlayerById(targetId);
    const userId = from.getFlag<PlayerId>(this.Name);
    return room.canAttack(from, to) && targetId !== userId;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, cardIds, toIds, fromId } = skillUseEvent;
    if (!toIds) {
      return false;
    }

    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);

    AimGroupUtil.cancelTarget(aimEvent, fromId);
    AimGroupUtil.addTargets(room, aimEvent, toIds[0]);
    EventPacker.terminate(aimEvent);

    return true;
  }
}
