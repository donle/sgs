import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'keji', description: 'keji_description'})
export class KeJi extends TriggerSkill {
  isAutoTrigger(
    content: ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return false;
    } else {
      return true;
    }
  }

  isTriggerable(
    event: ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >,
    stage?: AllStage,
  ) {
    return (
      stage === CardUseStage.AfterCardUseEffect ||
      stage === CardResponseStage.AfterCardResponseEffect ||
      stage === PhaseChangeStage.BeforePhaseChange
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const enabled = !owner.getFlag(this.Name);
      owner.removeFlag(this.Name);

      return enabled && content.to === PlayerPhase.DropCardStage && owner.Id === content.toPlayer;
    } else {
      content = content as ServerEventFinder<
        GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
      >;
      return owner.Id === content.fromId && room.CurrentPlayer.Id === owner.Id;
    }
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    if (identifier === GameEventIdentifiers.CardResponseEvent || identifier === GameEventIdentifiers.CardUseEvent) {
      skillUseEvent.translationsMessage = undefined;
    }

    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const identifier = triggeredOnEvent && EventPacker.getIdentifier(triggeredOnEvent);
    const player = room.getPlayerById(skillUseEvent.fromId);

    if (identifier === GameEventIdentifiers.CardResponseEvent || identifier === GameEventIdentifiers.CardUseEvent) {
      const { cardId } = triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
      >;
      if (Sanguosha.getCardById(cardId).GeneralName === 'slash') {
        player.setFlag(this.Name, true);
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      if (!player.getFlag<boolean>(this.Name)) {
        room.skip(player.Id, PlayerPhase.DropCardStage);
      } else {
        player.removeFlag(this.Name);
      }
    }

    return true;
  }
}
