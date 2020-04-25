import { CardType } from 'core/cards/card';
import { CardTargetEnum } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { LimitSkill, TriggerSkill } from 'core/skills/skill';

@LimitSkill({ name: 'fenwei', description: 'fenwei_description' })
export class FenWei extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    const card = Sanguosha.getCardById(event.byCardId!);
    return (
      stage === AimStage.AfterAim &&
      card.AOE !== CardTargetEnum.Single &&
      card.is(CardType.Trick) &&
      event.toIds.length > 1
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    room.setFlag(owner.Id, this.Name, event.toIds);
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]) {
    return targets.length > 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    const cardTargets = room.getPlayerById(owner).getFlag<PlayerId[]>(this.Name);
    return cardTargets.includes(targetId);
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, toIds } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    aimEvent.toIds = aimEvent.toIds.filter(toId => !toIds!.includes(toId));

    return true;
  }
}
