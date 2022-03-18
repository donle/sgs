import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, CircleStartStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zongkui', description: 'zongkui_description' })
export class ZongKui extends TriggerSkill {
  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CircleStartEvent>,
  ): boolean {
    return event !== undefined && EventPacker.getIdentifier(event) === GameEventIdentifiers.CircleStartEvent;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CircleStartEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged || stage === CircleStartStage.AfterCircleStarted;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.CircleStartEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PhaseBegin &&
        phaseChangeEvent.toPlayer === owner.Id &&
        room.getOtherPlayers(owner.Id).find(player => player.getMark(MarkEnum.Kui) === 0) !== undefined
      );
    } else if (identifier === GameEventIdentifiers.CircleStartEvent) {
      const minimun = room.getOtherPlayers(owner.Id).reduce<number>((min, player) => {
        player.Hp < min && (min = player.Hp);
        return min;
      }, room.getOtherPlayers(owner.Id)[0].Hp);
      return (
        room.getOtherPlayers(owner.Id).find(player => player.getMark(MarkEnum.Kui) === 0 && player.Hp === minimun) !==
        undefined
      );
    }

    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getMark(target, MarkEnum.Kui) === 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to gain 1 ‘Kui’ token?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (
      EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>) ===
      GameEventIdentifiers.PhaseChangeEvent
    ) {
      if (!event.toIds) {
        return false;
      }

      room.addMark(event.toIds[0], MarkEnum.Kui, 1);
    } else {
      const minimun = room.getOtherPlayers(event.fromId).reduce<number>((min, player) => {
        player.Hp < min && (min = player.Hp);
        return min;
      }, room.getOtherPlayers(event.fromId)[0].Hp);

      const players = room
        .getOtherPlayers(event.fromId)
        .filter(player => player.getMark(MarkEnum.Kui) === 0 && player.Hp === minimun)
        .map(player => player.Id);

      let chosen = players[0];
      if (players.length > 1) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players,
            toId: event.fromId,
            requiredAmount: 1,
            conversation: 'zongkui: please choose a target to gain 1 ‘Kui’ token',
            triggeredBySkills: [this.Name],
          },
          event.fromId,
          true,
        );

        resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

        chosen = resp.selectedPlayers[0];
      }

      room.addMark(chosen, MarkEnum.Kui, 1);
    }

    return true;
  }
}
