import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import {
  AllStage,
  DrawCardStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'lirang', description: 'lirang_description' })
export class LiRang extends TriggerSkill {
  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return !!event && EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseChangeEvent;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      return (
        owner.Id !== drawCardEvent.fromId &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        drawCardEvent.bySpecialReason === CardDrawReason.GameStage &&
        drawCardEvent.drawAmount > 0 &&
        owner.getMark(MarkEnum.Qian) === 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.to === PlayerPhase.DrawCardStage &&
        phaseChangeEvent.toPlayer === owner.Id &&
        owner.getMark(MarkEnum.Qian) > 0
      );
    }

    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to let {1} draw 2 card(s) additionally?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      drawCardEvent.drawAmount += 2;

      room.addMark(event.fromId, MarkEnum.Qian, 1);
      room.getPlayerById(event.fromId).setFlag<PlayerId>(this.Name, drawCardEvent.fromId);
    } else {
      await room.skip(event.fromId, PlayerPhase.DrawCardStage);
      room.removeMark(event.fromId, MarkEnum.Qian);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiRang.Name, description: LiRang.Description })
export class LiRangShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    if (!owner.getFlag<PlayerId>(this.GeneralName)) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.getFlag<PlayerId>(this.GeneralName) &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.DropCardStageEnd &&
        room.Analytics.getCardDropRecord(phaseStageChangeEvent.playerId, 'phase', undefined, 1).length > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    if (
      EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>) ===
      GameEventIdentifiers.PhaseStageChangeEvent
    ) {
      const currentId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>)
        .playerId;
      const droppedCardIds = room.Analytics.getCardDropRecord(currentId, 'phase', undefined).reduce<CardId[]>(
        (cardIds, dropEvent) => {
          for (const info of dropEvent.infos) {
            if (info.moveReason === CardMoveReason.SelfDrop || info.moveReason === CardMoveReason.PassiveDrop) {
              cardIds.push(
                ...info.movingCards
                  .filter(cardInfo => room.isCardInDropStack(cardInfo.card))
                  .map(cardInfo => cardInfo.card),
              );
            }
          }

          return cardIds;
        },
        [],
      );

      if (droppedCardIds.length > 0) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardWithConditionsEvent>(
          GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
          {
            toId: event.fromId,
            cardIds: droppedCardIds,
            customTitle: 'lirang: you can choose at most 2 cards of these cards to gain',
            amount: [1, 2],
          },
          event.fromId,
        );

        if (response.selectedCards && response.selectedCards.length > 0) {
          EventPacker.addMiddleware({ tag: this.Name, data: response.selectedCards }, event);
          return true;
        }
      }
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PhaseStageChangeEvent) {
      const cardIdsChosen = EventPacker.getMiddleware<CardId[]>(this.Name, event);
      if (!cardIdsChosen) {
        return false;
      }

      await room.moveCards({
        movingCards: cardIdsChosen.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    } else {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
