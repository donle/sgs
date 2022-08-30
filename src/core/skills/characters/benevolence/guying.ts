import { VirtualCard } from 'core/cards/card';
import { CardType } from 'core/cards/card';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardMoveStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'guying', description: 'guying_description' })
export class GuYing extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.MoveCardEvent) {
      return (
        !owner.hasUsedSkill(this.Name) &&
        room.CurrentPlayer !== owner &&
        room.CurrentPlayer !== undefined &&
        !room.CurrentPlayer.Dead &&
        !!(event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
          info =>
            info.fromId === owner.Id &&
            (info.moveReason === CardMoveReason.CardUse ||
              info.moveReason === CardMoveReason.CardResponse ||
              info.moveReason === CardMoveReason.PassiveDrop ||
              info.moveReason === CardMoveReason.SelfDrop) &&
            info.movingCards.length === 1 &&
            VirtualCard.getActualCards([info.movingCards[0].card]).length === 1 &&
            (info.movingCards[0].fromArea === CardMoveArea.HandArea ||
              info.movingCards[0].fromArea === CardMoveArea.EquipArea),
        )
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        owner.getFlag<number>(this.Name) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.MoveCardEvent | GameEventIdentifiers.PhaseStageChangeEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.MoveCardEvent) {
      const originalTimes = room.getFlag<number>(event.fromId, this.Name) || 0;
      room.setFlag<number>(
        event.fromId,
        this.Name,
        originalTimes + 1,
        TranslationPack.translationJsonPatcher('guying: {0}', originalTimes + 1).toString(),
      );

      const moveCardInfo = (unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.find(
        info =>
          info.fromId === event.fromId &&
          (info.moveReason === CardMoveReason.CardUse ||
            info.moveReason === CardMoveReason.CardResponse ||
            info.moveReason === CardMoveReason.PassiveDrop ||
            info.moveReason === CardMoveReason.SelfDrop) &&
          info.movingCards.length === 1 &&
          VirtualCard.getActualCards([info.movingCards[0].card]).length === 1 &&
          (info.movingCards[0].fromArea === CardMoveArea.HandArea ||
            info.movingCards[0].fromArea === CardMoveArea.EquipArea),
      );

      if (!moveCardInfo) {
        return false;
      }

      const cardId = VirtualCard.getActualCards([moveCardInfo.movingCards[0].card])[0];
      let currentArea: CardMoveArea | undefined;
      if (
        moveCardInfo.moveReason === CardMoveReason.CardUse ||
        moveCardInfo.moveReason === CardMoveReason.CardResponse
      ) {
        room.isCardOnProcessing(cardId) && (currentArea = CardMoveArea.ProcessingArea);
      } else {
        room.isCardInDropStack(cardId) && (currentArea = CardMoveArea.DropStack);
      }

      const options: string[] = [];
      const currentPlayerCards = room.CurrentPlayer.getPlayerCards();

      currentPlayerCards.length > 0 && options.push('guying:giveRandomly');
      currentArea !== undefined && options.push('guying:gainCard');

      if (options.length > 0) {
        const currentPlayerId = room.CurrentPlayer.Id;
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
          GameEventIdentifiers.AskForChoosingOptionsEvent,
          {
            options,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please choose guying options: {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
            ).extract(),
            toId: currentPlayerId,
            triggeredBySkills: [this.Name],
          },
          currentPlayerId,
          true,
        );

        response.selectedOption = response.selectedOption || options[0];
        if (response.selectedOption === 'guying:giveRandomly') {
          const randomCard = currentPlayerCards[Math.floor(Math.random() * currentPlayerCards.length)];
          await room.moveCards({
            movingCards: [{ card: randomCard, fromArea: room.CurrentPlayer.cardFrom(randomCard) }],
            fromId: currentPlayerId,
            toId: event.fromId,
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            proposer: currentPlayerId,
            triggeredBySkills: [this.Name],
          });
        } else {
          if (Sanguosha.getCardById(cardId).is(CardType.Equip)) {
            await room.useCard(
              {
                fromId: event.fromId,
                targetGroup: [[event.fromId]],
                cardId,
                customFromArea: currentArea,
              },
              true,
            );
          } else {
            await room.moveCards({
              movingCards: [{ card: cardId, fromArea: currentArea }],
              toId: event.fromId,
              toArea: CardMoveArea.HandArea,
              moveReason: CardMoveReason.ActivePrey,
              proposer: event.fromId,
              triggeredBySkills: [this.Name],
            });
          }
        }
      }
    } else {
      const response = await room.askForCardDrop(
        event.fromId,
        room.getFlag<number>(event.fromId, this.Name),
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.Name,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, event.fromId, event.fromId, this.Name));

      room.removeFlag(event.fromId, this.Name);
    }

    return true;
  }
}
