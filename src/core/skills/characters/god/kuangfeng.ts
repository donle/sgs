import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { QiXing } from './qixing';

@CommonSkill({ name: 'kuangfeng', description: 'kuangfeng_description' })
export class KuangFeng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      event.toStage === PlayerPhaseStages.FinishStageStart &&
      event.playerId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);
    const star = player.getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name);

    const askForChoosingCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: skillEffectEvent.fromId,
      cardIds: star,
      amount: 1,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardEvent>(askForChoosingCardEvent),
      skillEffectEvent.fromId,
    );

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      skillEffectEvent.fromId,
    );

    await room.dropCards(
      CardMoveReason.PlaceToDropStack,
      selectedCards!,
      skillEffectEvent.fromId,
      skillEffectEvent.fromId,
      this.GeneralName,
    );

    const askForChoosingPlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room.getAlivePlayersFrom().map(player => player.Id),
      toId: skillEffectEvent.fromId,
      requiredAmount: 1,
      conversation: 'Please choose a player to set a KuangFeng mark',
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForChoosingPlayerEvent),
      skillEffectEvent.fromId,
    );

    const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      skillEffectEvent.fromId,
    );

    room.addMark(selectedPlayers![0], MarkEnum.KuangFeng, 1);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: KuangFeng.Name, description: KuangFeng.Description })
export class KuangFengShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public onLosingSkill(room: Room, owner: PlayerId): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PrepareStage;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    if (stage === DamageEffectStage.DamagedEffect) {
      return false;
    }
    return true;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect || stage === PhaseChangeStage.BeforePhaseChange;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return damageEvent.damageType === DamageType.Fire && room.getMark(damageEvent.toId, MarkEnum.KuangFeng) > 0;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PrepareStage &&
        phaseChangeEvent.toPlayer === owner.Id &&
        !!room.getAlivePlayersFrom().find(player => player.getMark(MarkEnum.KuangFeng) > 0)
      );
    }
    return false;
  }

  public async onTrigger(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, damage increases to {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
        this.GeneralName,
        damageEvent.damage + 1,
      ).extract();
    }
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const unknownEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
    } else {
      for (const player of room.getAlivePlayersFrom()) {
        if (player.getMark(MarkEnum.KuangFeng) > 0) {
          room.removeMark(player.Id, MarkEnum.KuangFeng);
        }
      }
    }

    return true;
  }
}
