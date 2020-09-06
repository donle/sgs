import { CardId } from 'core/cards/libs/card_props';
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
export class DaWu extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      event.toStage === PlayerPhaseStages.FinishStageStart &&
      event.playerId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).length > 0
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, pendingCardId: CardId) {
    return room.getPlayerById(owner).getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).includes(pendingCardId);
  }

  public targetFilter(room: Room, owner: Player, targets: string[], selectedCards: CardId[]) {
    return targets.length === selectedCards.length;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ) {
    return selectedTargets.length < selectedCards.length;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.dropCards(
      CardMoveReason.PlaceToDropStack,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    for (const player of skillUseEvent.toIds!) {
      room.addMark(player, MarkEnum.DaWu, 1);
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
