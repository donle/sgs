import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { AimGroupUtil } from 'core/shares/libs/utils/aim_group';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bingjie', description: 'bingjie_description' })
export class BingJie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public getSkillLog(room: Room): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to reduce 1 max hp to use this skill?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.changeMaxHp(event.fromId, -1);
    room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: BingJie.Name, description: BingJie.Description })
export class BingJieShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAim || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (!owner.getFlag<boolean>(this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        aimEvent.fromId === owner.Id &&
        aimEvent.isFirstTarget &&
        (Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(aimEvent.byCardId).isCommonTrick()) &&
        !!AimGroupUtil.getAllTargets(aimEvent.allTargets).find(playerId => playerId !== owner.Id)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AimEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent) {
      const allTargets = AimGroupUtil.getAllTargets(
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>).allTargets,
      );
      for (const toId of allTargets) {
        if (toId === event.fromId || room.getPlayerById(toId).getPlayerCards().length === 0) {
          continue;
        }

        const response = await room.askForCardDrop(
          toId,
          1,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          undefined,
          this.GeneralName,
        );
        response.droppedCards.length > 0 &&
          (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId, toId, this.GeneralName));
      }
    } else {
      room.getPlayerById(event.fromId).removeFlag(this.GeneralName);
    }

    return true;
  }
}
