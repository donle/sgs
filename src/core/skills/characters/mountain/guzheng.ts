import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'guzheng', description: 'guzheng_description' })
export class GuZheng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    if (
      content.playerId === owner.Id ||
      content.toStage !== PlayerPhaseStages.DropCardStageEnd ||
      room.getPlayerById(content.playerId).Dead
    ) {
      return false;
    }

    const events = room.Analytics.getCardDropRecord(content.playerId, true, [PlayerPhase.DropCardStage]);
    const findFunc = (event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) => {
      return event.movingCards.find(({ card, fromArea }) => {
        return fromArea === CardMoveArea.HandArea;
      });
    };
    return events.find(findFunc) !== undefined;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;

    const events = room.Analytics.getRecordEvents<GameEventIdentifiers.MoveCardEvent>(
      event => {
        return (
          EventPacker.getIdentifier(event) === GameEventIdentifiers.MoveCardEvent &&
          (event.moveReason === CardMoveReason.SelfDrop || event.moveReason === CardMoveReason.PassiveDrop)
        );
      },
      undefined,
      true,
      [PlayerPhase.DropCardStage],
    );

    if (events === undefined) {
      return false;
    }

    const allCards: { cardId: CardId; enableToReturn: boolean }[] = [];
    const guzhengee = (triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;

    events.forEach(event => {
      const isGuzhengee = event.fromId === guzhengee;
      event.movingCards.forEach(({ card, fromArea }) => {
        if (
          !allCards
            .map(card => {
              return card.cardId;
            })
            .includes(card)
        ) {
          if (room.isCardInDropStack(card)) {
            if (isGuzhengee === true && fromArea === CardMoveArea.HandArea) {
              allCards.push({ cardId: card, enableToReturn: true });
            } else {
              allCards.push({ cardId: card, enableToReturn: false });
            }
          }
        } else {
          const index = allCards.findIndex(({ cardId, enableToReturn }) => {
            return cardId === card && enableToReturn === false;
          });
          if (index >= 0) {
            allCards[index].enableToReturn = true;
          }
        }
      });
    });

    const displayCardIds: CardId[] = [];
    const selectedCardIds: { card: CardId; player?: PlayerId }[] = [];

    allCards.forEach(cardInfo => {
      displayCardIds.push(cardInfo.cardId);
      if (cardInfo.enableToReturn === false) {
        selectedCardIds.push({ card: cardInfo.cardId });
      }
    });

    room.addProcessingCards(displayCardIds.toString(), ...displayCardIds);

    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: displayCardIds,
      selected: selectedCardIds,
    };
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent);

    const chooseGuZhengCardEvent: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> = {
      cardIds: displayCardIds,
      selected: selectedCardIds,
      toId: fromId,
      userId: fromId,
    };

    room.notify(GameEventIdentifiers.AskForContinuouslyChoosingCardEvent, chooseGuZhengCardEvent, fromId);

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
      fromId,
    );

    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, chooseGuZhengCardEvent);
    room.endProcessOnTag(displayCardIds.toString());

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.DropStack }],
      toId: guzhengee,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.Name,
    });

    const obtainCards: CardId[] = displayCardIds.filter(node => node !== response.selectedCard);

    if (obtainCards.length > 0) {
      const askForChoice: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: ['yes', 'no'],
        conversation: 'guzheng: do you wanna obtain the rest of cards?',
      };

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForChoice, fromId);

      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        fromId,
      );

      room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {});

      if (selectedOption === 'yes') {
        await room.moveCards({
          movingCards: obtainCards.map(card => {
            return { card, fromArea: CardMoveArea.DropStack };
          }),
          toId: fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: fromId,
          movedByReason: this.Name,
        });
      }
    } else {
      room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {});
    }

    return true;
  }
}
