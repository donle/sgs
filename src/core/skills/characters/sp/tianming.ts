import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tianming', description: 'tianming_description' })
export class TianMing extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return event.toId === owner.Id && Sanguosha.getCardById(event.byCardId).GeneralName === 'slash';
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === (owner.getPlayerCards().filter(id => room.canDropCard(owner.Id, id)).length > 2 ? 2 : 0);
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    const canDropCards = owner.getPlayerCards().filter(id => room.canDropCard(owner.Id, id));
    return canDropCards.length > 0
      ? canDropCards.length <= 2
        ? TranslationPack.translationJsonPatcher(
            '{0}: do you want to discard {1} to draw 2 cards?',
            this.Name,
            TranslationPack.patchCardInTranslation(...canDropCards),
          ).extract()
        : TranslationPack.translationJsonPatcher(
            '{0}: do you want to discard 2 cards to draw 2 cards?',
            this.Name,
          ).extract()
      : TranslationPack.translationJsonPatcher('{0}: do you want to draw 2 cards?', this.Name).extract();
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.cardIds =
      event.cardIds && event.cardIds.length > 0
        ? event.cardIds
        : room
            .getPlayerById(event.fromId)
            .getPlayerCards()
            .filter(id => room.canDropCard(event.fromId, id));

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (!event.cardIds) {
      return false;
    }

    event.cardIds.length > 0 &&
      (await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, fromId, fromId, this.Name));

    await room.drawCards(2, fromId, 'top', fromId, this.Name);

    let richest = room.getPlayerById(fromId);
    for (const player of room.getOtherPlayers(fromId)) {
      player.getCardIds(PlayerCardsArea.HandArea).length > richest.getCardIds(PlayerCardsArea.HandArea).length &&
        (richest = player);
    }

    if (
      richest.Id !== fromId &&
      !room
        .getOtherPlayers(richest.Id)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length === richest.getCardIds(PlayerCardsArea.HandArea).length,
        )
    ) {
      const canDropCards = richest.getPlayerCards().filter(id => room.canDropCard(richest.Id, id));
      const canDropNum = Math.min(canDropCards.length, 2);

      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        {
          invokeSkillNames: [this.Name],
          toId: richest.Id,
          conversation:
            canDropNum > 0
              ? TranslationPack.translationJsonPatcher(
                  '{0}: do you want to discard {1} card(s) to draw 2 cards?',
                  this.Name,
                  canDropNum,
                ).extract()
              : TranslationPack.translationJsonPatcher('{0}: do you want to draw 2 cards?', this.Name).extract(),
        },
        richest.Id,
      );
      const resp = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, richest.Id);

      if (resp.cardIds) {
        const toDiscard = resp.cardIds.length > 0 ? resp.cardIds : canDropCards;
        toDiscard.length > 0 &&
          (await room.dropCards(CardMoveReason.SelfDrop, toDiscard, richest.Id, richest.Id, this.Name));

        await room.drawCards(2, richest.Id, 'top', richest.Id, this.Name);
      }
    }

    return true;
  }
}
