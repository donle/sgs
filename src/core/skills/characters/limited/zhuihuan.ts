import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zhuihuan', description: 'zhuihuan_description' })
export class ZhuiHuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event.playerId === owner.Id && event.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    room.setFlag<boolean>(event.toIds[0], this.Name, true, this.Name, [event.fromId]);
    room.getPlayerById(event.toIds[0]).hasShadowSkill(ZhuiHuanBuff.Name) ||
      (await room.obtainSkill(event.toIds[0], ZhuiHuanBuff.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_zhuihuan_buff', description: 's_zhuihuan_buff_description' })
export class ZhuiHuanBuff extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, player: Player) {
    player.removeFlag(this.Name);
    player.getFlag<boolean>(ZhuiHuan.Name) !== undefined && room.removeFlag(player.Id, ZhuiHuan.Name);
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageDone;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageDone || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.toId === owner.Id && !!damageEvent.fromId;
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.DamageEvent) {
      const sources = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
      const source = (unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!;
      if (!sources.includes(source)) {
        sources.push(source);
        room.getPlayerById(event.fromId).setFlag<PlayerId[]>(this.Name, sources);
      }
    } else {
      const sources = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
      if (sources.length > 0) {
        room.sortPlayersByPosition(sources);

        for (const source of sources) {
          const sourcePlayer = room.getPlayerById(source);
          if (sourcePlayer.Dead) {
            continue;
          }

          if (sourcePlayer.Hp > room.getPlayerById(event.fromId).Hp) {
            await room.damage({
              fromId: event.fromId,
              toId: source,
              damage: 2,
              damageType: DamageType.Normal,
              triggeredBySkills: [ZhuiHuan.Name],
            });
          } else if (sourcePlayer.getCardIds(PlayerCardsArea.HandArea).length > 0) {
            let toDiscard = sourcePlayer
              .getCardIds(PlayerCardsArea.HandArea)
              .filter(cardId => room.canDropCard(source, cardId));
            toDiscard.length > 2 && (toDiscard = Algorithm.randomPick(2, toDiscard));
            await room.dropCards(CardMoveReason.SelfDrop, toDiscard, source, source, ZhuiHuan.Name);
          }
        }
      }

      room.getPlayerById(event.fromId).removeFlag(this.Name);
      room.getFlag<boolean>(event.fromId, ZhuiHuan.Name) !== undefined && room.removeFlag(event.fromId, ZhuiHuan.Name);
      await room.loseSkill(event.fromId, this.Name);
    }

    return true;
  }
}
