import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shelie', description: 'shelie_description' })
export class SheLie extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage): boolean {
    return stage === DrawCardStage.BeforeDrawCardEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount = 0;

    const displayCardIds = room.getCards(5, 'top');
    const selectedCardIds: { card: CardId; player?: PlayerId }[] = [];
    room.addProcessingCards(displayCardIds.toString(), ...displayCardIds);

    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: displayCardIds,
      selected: selectedCardIds,
    };
    room.broadcast(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent);

    while (selectedCardIds.length < 5) {
      const chooseSheLieCardEvent: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> = {
        cardIds: displayCardIds,
        selected: selectedCardIds,
        toId: skillUseEvent.fromId,
        userId: skillUseEvent.fromId,
      };

      room.notify(
        GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
        chooseSheLieCardEvent,
        skillUseEvent.fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
        skillUseEvent.fromId,
      );

      const resCard = Sanguosha.getCardById(response.selectedCard);
      displayCardIds.forEach(id => {
        const card = Sanguosha.getCardById(id);
        if (card.Suit === resCard.Suit) {
          const node: { card: CardId; player?: PlayerId } = { card: id };
          if (resCard.Id === id) {
            node.player = skillUseEvent.fromId;
          }
          selectedCardIds.push(node);
        }
      });

      room.broadcast(GameEventIdentifiers.ObserveCardsEvent, chooseSheLieCardEvent);
    }
    room.endProcessOnTag(displayCardIds.toString());

    await room.moveCards({
      movingCards: [
        ...selectedCardIds
          .filter(node => !!node.player)
          .map(node => ({ card: node.card, fromArea: CardMoveArea.ProcessingArea })),
      ],
      toId: skillUseEvent.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    const droppedCards: CardId[] = selectedCardIds.filter(node => !node.player).map(node => node.card);
    await room.moveCards({
      movingCards: [...droppedCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea }))],
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    room.broadcast(GameEventIdentifiers.ObserveCardFinishEvent, {
      translationsMessage:
        droppedCards.length > 0
          ? TranslationPack.translationJsonPatcher(
              '{0} has been placed into drop stack',
              TranslationPack.patchCardInTranslation(...droppedCards),
            ).extract()
          : undefined,
    });

    return true;
  }
}
