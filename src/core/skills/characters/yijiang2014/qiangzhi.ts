import { CardType } from 'core/cards/card';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiangzhi', description: 'qiangzhi_description' })
export class QiangZhi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      room.getOtherPlayers(owner.Id).find(player => player.getCardIds(PlayerCardsArea.HandArea).length > 0) !==
        undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const response = await room.askForChoosingPlayerCard(
      {
        options: {
          [PlayerCardsArea.HandArea]: room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.HandArea).length,
        },
        fromId,
        toId: toIds[0],
        triggeredBySkills: [this.Name],
      },
      fromId,
      false,
      true,
    );
    if (!response) {
      return false;
    }

    const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      fromId: toIds[0],
      displayCards: [response.selectedCard!],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(response.selectedCard!),
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);

    room.setFlag<CardType>(
      fromId,
      this.Name,
      Sanguosha.getCardById(response.selectedCard!).BaseType,
      TranslationPack.translationJsonPatcher(
        'qiangzhi type: {0}',
        Functional.getCardBaseTypeAbbrRawText(Sanguosha.getCardById(response.selectedCard!).BaseType),
      ).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: QiangZhi.Name, description: QiangZhi.Description })
export class QiangZhiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    return event !== undefined && EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseChangeEvent;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.CardUsing || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    const type = owner.getFlag<CardType>(this.GeneralName);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        type !== undefined &&
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).BaseType === type
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.fromPlayer === owner.Id &&
        phaseChangeEvent.from === PlayerPhase.PlayCardStage &&
        type !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(
      event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
      >,
    );

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      await room.drawCards(1, event.fromId, 'top', event.fromId, this.GeneralName);
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
