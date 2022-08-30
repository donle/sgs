import { CardColor } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'fenyin', description: 'fenyin_description' })
export class FenYin extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenObtainingSkill(room: Room, player: Player) {
    if (room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage || room.CurrentPhasePlayer !== player) {
      return;
    }

    const records = room.Analytics.getCardUseRecord(player.Id, 'phase');
    if (records.length > 0) {
      const lastColor = Sanguosha.getCardById(records[records.length - 1].cardId).Color;
      if (lastColor !== CardColor.None) {
        player.setFlag<CardColor>(this.Name, lastColor);
        const precolor = Sanguosha.getCardById(records[records.length - 2].cardId).Color;
        if (records.length > 1 && precolor !== CardColor.None && lastColor !== precolor) {
          EventPacker.addMiddleware({ tag: this.Name, data: true }, records[records.length - 1]);
        }
      }
    }
  }

  public async whenDead(room: Room, player: Player) {
    player.removeFlag(this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      event.fromId === owner.Id &&
      room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === owner &&
      EventPacker.getMiddleware<boolean>(this.Name, event) === true
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FenYin.Name, description: FenYin.Description })
export class FenYinShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      return (
        (event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId === owner.Id &&
        room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
        room.CurrentPhasePlayer === owner
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.fromPlayer === owner.Id &&
        phaseChangeEvent.from === PlayerPhase.PlayCardStage &&
        owner.getFlag<CardColor>(this.GeneralName) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      const card = Sanguosha.getCardById(
        (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId,
      );
      if (card.Color === CardColor.None) {
        room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
      } else {
        const precolor = room.getFlag<CardColor>(event.fromId, this.GeneralName);
        if (precolor !== undefined && precolor !== card.Color) {
          EventPacker.addMiddleware(
            { tag: this.GeneralName, data: true },
            unknownEvent,
          );
        }

        room.getPlayerById(event.fromId).setFlag<CardColor>(this.GeneralName, card.Color);
      }
    } else {
      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}
