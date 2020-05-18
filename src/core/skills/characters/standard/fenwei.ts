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
  private readonly hasSkillAskedTag = 'fenwei-asked';

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      Sanguosha.getCardById(event.byCardId!).AOE !== CardTargetEnum.Single &&
      Sanguosha.getCardById(event.byCardId!).is(CardType.Trick) &&
      event.allTargets.length > 1
    );
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    if (room.getFlag<typeof event>(owner.Id, this.hasSkillAskedTag) === event) {
      return false;
    }

    room.setFlag(owner.Id, this.Name, event.allTargets);
    room.setFlag(owner.Id, this.hasSkillAskedTag, event);
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

    aimEvent.nullifiedTargets = [...aimEvent.nullifiedTargets, ...toIds!];

    return true;
  }
}
