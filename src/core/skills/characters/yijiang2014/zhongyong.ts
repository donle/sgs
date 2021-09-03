import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhongyong', description: 'zhongyong_description' })
export class ZhongYong extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash' &&
      room
        .getOtherPlayers(owner.Id)
        .find(player => !TargetGroupUtil.getRealTargets(content.targetGroup).includes(player.Id)) !== undefined &&
      ((VirtualCard.getActualCards([content.cardId]).length > 0 && room.isCardOnProcessing(content.cardId)) ||
        (content.cardIdsResponded !== undefined &&
          content.cardIdsResponded.find(
            id =>
              VirtualCard.getActualCards([id]).length > 0 &&
              VirtualCard.getActualCards([id]).find(cardId => !room.isCardInDropStack(cardId)) === undefined,
          ) !== undefined))
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const allCards: CardId[] = [];

    room.isCardOnProcessing(cardUseEvent.cardId) && allCards.push(...VirtualCard.getActualCards([cardUseEvent.cardId]));
    cardUseEvent.cardIdsResponded &&
      allCards.push(
        ...VirtualCard.getActualCards(cardUseEvent.cardIdsResponded.filter(
          id =>
            VirtualCard.getActualCards([id]).length > 0 &&
            VirtualCard.getActualCards([id]).find(cardId => !room.isCardInDropStack(cardId)) === undefined,
        )),
      );

    const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
      cardIds: allCards,
      selected: [],
    };
    room.notify(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent, fromId);

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
      GameEventIdentifiers.AskForChoosingPlayerEvent,
      {
        players: room
          .getOtherPlayers(fromId)
          .filter(player => !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(player.Id))
          .map(player => player.Id),
        toId: fromId,
        requiredAmount: 1,
        conversation: 'zhongyong: do you want to choose a target to gain these cards?',
        triggeredBySkills: [this.Name],
      },
      fromId,
    );

    room.notify(GameEventIdentifiers.ObserveCardFinishEvent, {}, fromId);

    if (response.selectedPlayers && response.selectedPlayers.length > 0) {
      event.toIds = response.selectedPlayers;
      event.cardIds = allCards;
      return true;
    }

    return false;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    const hasRed = cardIds.find(id => Sanguosha.getCardById(id).isRed());
    const hasBlack = cardIds.find(id => Sanguosha.getCardById(id).isBlack());

    await room.moveCards({
      movingCards: cardIds.map(card => ({
        card,
        fromArea: room.isCardOnProcessing(card) ? CardMoveArea.ProcessingArea : CardMoveArea.DropStack,
      })),
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    const cardId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId;
    if (VirtualCard.getActualCards([cardId]).length > 0 && room.isCardOnProcessing(cardId)) {
      room.endProcessOnTag(cardId.toString());
    }

    hasBlack && (await room.drawCards(1, toIds[0], 'top', fromId, this.Name));

    if (hasRed) {
      const availableTargets = room
        .getOtherPlayers(fromId)
        .filter(
          player =>
            room.withinAttackDistance(room.getPlayerById(fromId), player) &&
            room.canUseCardTo(new CardMatcher({ generalName: ['slash'] }), room.getPlayerById(toIds[0]), player, true),
        )
        .map(player => player.Id);

      if (availableTargets.length > 0) {
        const askForUseCard: ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent> = {
          toId: toIds[0],
          scopedTargets: availableTargets,
          extraUse: true,
          cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
          conversation: TranslationPack.translationJsonPatcher('{0}: do you want to use a slash?', this.Name).extract(),
          triggeredBySkills: [this.Name],
        };
        const response = await room.askForCardUse(askForUseCard, toIds[0]);

        if (response.cardId && response.toIds) {
          await room.useCard(
            {
              fromId: toIds[0],
              targetGroup: [response.toIds],
              cardId: response.cardId,
              extraUse: true,
            },
            true,
          );
        }
      }
    }

    return true;
  }
}
