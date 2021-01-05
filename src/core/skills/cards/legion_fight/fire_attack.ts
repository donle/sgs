import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'fire_attack', description: 'fire_attack_description' })
export class FireAttackSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    const to = room.getPlayerById(target);
    return (
      to.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target)
    );
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, fromId } = event;
    const toId = Precondition.exists(toIds, 'Unknown targets in fire_attack')[0];
    const to = room.getPlayerById(toId);
    if (to.getCardIds(PlayerCardsArea.HandArea).length === 0) {
      return false;
    }

    const askForDisplayCardEvent = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardDisplayEvent>({
      cardAmount: 1,
      toId,
      triggeredBySkills: [this.Name],
      conversation:
        fromId !== undefined
          ? TranslationPack.translationJsonPatcher(
              '{0} used {1} to you, please present a hand card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
              TranslationPack.patchCardInTranslation(event.cardId),
            ).extract()
          : TranslationPack.translationJsonPatcher(
              '{0}: please present a hand card',
              TranslationPack.patchCardInTranslation(event.cardId),
            ).extract(),
    });

    room.notify(GameEventIdentifiers.AskForCardDisplayEvent, askForDisplayCardEvent, toId);
    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForCardDisplayEvent,
      toId,
    );

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      displayCards: selectedCards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(to),
        TranslationPack.patchCardInTranslation(...selectedCards),
      ).extract(),
    });

    if (fromId !== undefined) {
      const from = room.getPlayerById(fromId);
      if (!from.Dead && to.getCardIds(PlayerCardsArea.HandArea).length > 0) {
        const card = Sanguosha.getCardById(selectedCards[0]);
        const response = await room.askForCardDrop(
          fromId,
          1,
          [PlayerCardsArea.HandArea],
          false,
          from.getCardIds(PlayerCardsArea.HandArea).filter(cardId => Sanguosha.getCardById(cardId).Suit !== card.Suit),
          this.Name,
          TranslationPack.translationJsonPatcher(
            'please drop a {0} hand card to hit {1} 1 hp of damage type fire',
            Functional.getCardSuitRawText(card.Suit),
            TranslationPack.patchPlayerInTranslation(to),
          ).extract(),
        );

        if (response.droppedCards.length > 0) {
          await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, fromId, fromId, this.Name);

          const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
            fromId,
            toId,
            damage: 1,
            damageType: DamageType.Fire,
            cardIds: [event.cardId],
            triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.Name] : [this.Name],
          };

          await room.damage(damageEvent);
        }
      }
    }
    return true;
  }
}
