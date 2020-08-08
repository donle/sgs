import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
  StagePriority,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { TranslationPack } from 'core/translations/translation_json_tool';
import { QiXing } from './qixing';

@CommonSkill({ name: 'dawu', description: 'dawu_description' })
export class DaWu extends TriggerSkill {
  async whenLosingSkill(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.DaWu) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.DaWu);
    }
  }
  async whenDead(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.DaWu) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.DaWu);
    }
  }

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
    const boundValue = Math.min(room.getAlivePlayersFrom().length, star.length);
    const askForChooseCards: ServerEventFinder<GameEventIdentifiers.AskForPlaceCardsInDileEvent> = {
      toId: skillEffectEvent.fromId,
      cardIds: star,
      top: star.length,
      topStackName: QiXing.GeneralName,
      bottom: boundValue,
      bottomStackName: 'dawu: card to drop',
      bottomMaxCard: boundValue,
      bottomMinCard: 1,
      movable: true,
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>(askForChooseCards),
      skillEffectEvent.fromId,
    );

    const { bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      skillEffectEvent.fromId,
    );

    await room.dropCards(
      CardMoveReason.PlaceToDropStack,
      bottom,
      skillEffectEvent.fromId,
      skillEffectEvent.fromId,
      this.Name,
    );

    const askForChoosingPlayerEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
      players: room.getAlivePlayersFrom().map(player => player.Id),
      toId: skillEffectEvent.fromId,
      requiredAmount: bottom.length,
      conversation: TranslationPack.translationJsonPatcher(
        'Please choose {0} player to set {1} mark',
        bottom.length,
        this.Name,
      ).extract(),
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

    for (const playerId of selectedPlayers!) {
      room.addMark(playerId, MarkEnum.DaWu, 1);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: DaWu.Name, description: DaWu.Description })
export class DaWuShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PrepareStage;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== DamageEffectStage.DamagedEffect;
  }

  public getPriority(): StagePriority {
    return StagePriority.Low;
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
      return damageEvent.damageType !== DamageType.Thunder && room.getMark(damageEvent.toId, MarkEnum.DaWu) > 0;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.PrepareStage &&
        phaseChangeEvent.toPlayer === owner.Id &&
        !!room.getAlivePlayersFrom().find(player => player.getMark(MarkEnum.DaWu) > 0)
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
      skillUseEvent.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, nullified damage event',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
        this.GeneralName,
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
      EventPacker.terminate(damageEvent);
    } else {
      for (const player of room.getAlivePlayersFrom()) {
        if (player.getMark(MarkEnum.DaWu) > 0) {
          room.removeMark(player.Id, MarkEnum.DaWu);
        }
      }
    }

    return true;
  }
}
