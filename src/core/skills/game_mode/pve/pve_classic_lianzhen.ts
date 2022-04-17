import { CardMoveArea, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'pve_classic_lianzhen', description: 'pve_classic_lianzhen_description' })
export class PveClassicLianZhen extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.toPlayer === owner.Id && content.to === PlayerPhase.PhaseBegin;
  }

  numberOfTargets() {
    return 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (event.toIds && event.toIds[0]) {
      room.getPlayerById(event.fromId).setFlag(this.GeneralName, event.toIds[0]);
    } else {
      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveClassicLianZhen.Name, description: PveClassicLianZhen.Description })
export class PveClassicLianZhenBuf extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      owner.getFlag(this.GeneralName) !== undefined &&
      content.infos.find(
        info => info.toId === owner.getFlag(this.GeneralName) && info.toArea === CardMoveArea.HandArea,
      ) !== undefined
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    const moveCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const cardNumber = moveCardEvent.infos
      .filter(info => info.toId === owner.getFlag(this.GeneralName))
      .map(info => info.movingCards.length)
      .reduce((aur, cur) => {
        return aur + cur;
      });
    await room.drawCards(room.CurrentPlayer === owner ? cardNumber * 2 : cardNumber, owner.Id);
    return true;
  }
}
