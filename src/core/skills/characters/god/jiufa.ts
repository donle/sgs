import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'jiufa', description: 'jiufa_description' })
export class JiuFa extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.AfterCardUseEffect || stage === CardResponseStage.AfterCardResponseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    return (
      content.fromId === owner.Id &&
      (!owner.getFlag<string[]>(this.Name) ||
        !owner.getFlag<string[]>(this.Name).includes(Sanguosha.getCardById(content.cardId).GeneralName))
    );
  }

  isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ) {
    return !owner.getFlag<string[]>(this.Name) || owner.getFlag<string[]>(this.Name).length < 8;
  }

  public async onTrigger(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    if (
      !room.getFlag<string[]>(skillEffectEvent.fromId, this.Name) ||
      room.getFlag<string[]>(skillEffectEvent.fromId, this.Name).length < 8
    ) {
      skillEffectEvent.translationsMessage = undefined;
    }
    return true;
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const event = skillEffectEvent.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;

    const flags = room.getFlag<string[]>(skillEffectEvent.fromId, this.Name) || [];
    if (flags.length < 8) {
      flags.push(Sanguosha.getCardById(event.cardId).GeneralName);
      room.setFlag(event.fromId, this.Name, flags, this.Name);
    } else {
      room.removeFlag(skillEffectEvent.fromId, this.Name);

      const displayCardIds = room.getCards(9, 'top');
      const selectedCardIds: { card: CardId; player?: PlayerId }[] = displayCardIds
        .filter(
          (cardId, _, allCardIds) =>
            allCardIds.filter(id => Sanguosha.getCardById(id).CardNumber === Sanguosha.getCardById(cardId).CardNumber)
              .length === 1,
        )
        .map(cardId => ({
          card: cardId,
        }));

      room.addProcessingCards(displayCardIds.toString(), ...displayCardIds);

      const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
        cardIds: displayCardIds,
        selected: selectedCardIds,
      };
      room.broadcast(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent);

      while (selectedCardIds.length < 9) {
        const chooseJiuFaCardEvent: ServerEventFinder<GameEventIdentifiers.AskForContinuouslyChoosingCardEvent> = {
          cardIds: displayCardIds,
          selected: selectedCardIds,
          toId: skillEffectEvent.fromId,
          userId: skillEffectEvent.fromId,
          triggeredBySkills: [this.Name],
        };

        room.notify(
          GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
          chooseJiuFaCardEvent,
          skillEffectEvent.fromId,
        );

        const response = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForContinuouslyChoosingCardEvent,
          skillEffectEvent.fromId,
        );

        const resCard = Sanguosha.getCardById(response.selectedCard);
        for (const id of displayCardIds) {
          const card = Sanguosha.getCardById(id);
          if (card.CardNumber === resCard.CardNumber) {
            const node: { card: CardId; player?: PlayerId } = { card: id };
            if (resCard.Id === id) {
              node.player = skillEffectEvent.fromId;
            }
            selectedCardIds.push(node);
          }
        }

        room.broadcast(GameEventIdentifiers.ObserveCardsEvent, chooseJiuFaCardEvent);
      }
      room.endProcessOnTag(displayCardIds.toString());

      await room.moveCards({
        movingCards: [
          ...selectedCardIds
            .filter(node => !!node.player)
            .map(node => ({ card: node.card, fromArea: CardMoveArea.ProcessingArea })),
        ],
        toId: skillEffectEvent.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: skillEffectEvent.fromId,
        movedByReason: this.Name,
      });

      const droppedCards: CardId[] = selectedCardIds.filter(node => !node.player).map(node => node.card);
      await room.moveCards({
        movingCards: [...droppedCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea }))],
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: skillEffectEvent.fromId,
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
    }

    return true;
  }
}
