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
export class KuangFeng extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.KuangFeng) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.KuangFeng);
    }
  }

  public async whenDead(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.KuangFeng) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.KuangFeng);
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      content.playerId === owner.Id &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).length > 0
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId,room: Room, pendingCardId: CardId) {
    return room.getPlayerById(owner).getCardIds(PlayerCardsArea.OutsideArea, QiXing.Name).includes(pendingCardId);
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(ownerId: PlayerId, room: Room, targetId: PlayerId) {
    return ownerId !== targetId;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.dropCards(CardMoveReason.PlaceToDropStack, skillUseEvent.cardIds!, skillUseEvent.fromId, skillUseEvent.fromId, this.Name);
    room.addMark(skillUseEvent.toIds![0], MarkEnum.KuangFeng, 1);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: KuangFeng.Name, description: KuangFeng.Description })
export class KuangFengShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PrepareStage;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== DamageEffectStage.DamagedEffect;
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
