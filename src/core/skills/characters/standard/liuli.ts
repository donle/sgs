import { CardId } from 'core/cards/libs/card_props';
import { CardLostReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'liuli', description: 'liuli_description' })
export class LiuLi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAimmed &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    room.setFlag(owner.Id, this.Name, event.fromId);
    return event.toId === owner.Id;
  }

  public targetFilter(room: Room, targets: PlayerId[]) {
    return targets.length === 1;
  }

  public cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea;
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
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    await room.dropCards(CardLostReason.ActiveDrop, cardIds!, fromId, fromId, this.Name);

    aimEvent.allTargets = aimEvent.allTargets.filter((toId) => toId !== fromId);
    aimEvent.allTargets.push(toIds![0]);
    aimEvent.toId = toIds![0];

    return true;
  }
}
