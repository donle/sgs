import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AimStage, AllStage, CardUseStage, PlayerDiedStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'god_fuhai', description: 'god_fuhai_description' })
export class GodFuHai extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public whenRefresh(room: Room, owner: Player): void {
    owner.removeFlag(this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage) {
    return (
      stage === CardUseStage.CardUsing ||
      stage === AimStage.OnAim ||
      stage === PlayerDiedStage.PlayerDied
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent | GameEventIdentifiers.PlayerDiedEvent>,
  ) {
    const identifer = EventPacker.getIdentifier(content);
    if (identifer === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).find(
          playerId => room.getMark(playerId, MarkEnum.PingDing) > 0,
        ) !== undefined
      );
    } else if (identifer === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return aimEvent.fromId === owner.Id && room.getMark(aimEvent.toId, MarkEnum.PingDing) > 0 && (owner.getFlag<number>(this.Name) || 0) < 2;
    } else if (identifer === GameEventIdentifiers.PlayerDiedEvent) {
      const toId = (content as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId;
      return toId !== owner.Id && room.getPlayerById(toId).getMark(MarkEnum.PingDing) > 0;
    }

    return false;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent | GameEventIdentifiers.PlayerDiedEvent
    >;

    const identifer = EventPacker.getIdentifier(unknownEvent);
    if (identifer === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      cardUseEvent.disresponsiveList = cardUseEvent.disresponsiveList || [];
      cardUseEvent.disresponsiveList.push(
        ...TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).filter(
          target => room.getPlayerById(target).getMark(MarkEnum.PingDing) > 0,
        ),
      );
    } else if (identifer === GameEventIdentifiers.AimEvent) {
      room.getPlayerById(fromId).setFlag<number>(this.Name, (room.getFlag<number>(fromId, this.Name) || 0) + 1);
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    } else {
      const toId = (unknownEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId;
      const markNum = room.getMark(toId, MarkEnum.PingDing);
      await room.changeMaxHp(fromId, markNum);
      await room.drawCards(markNum, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}
