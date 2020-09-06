import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'zhiyu', description: 'zhiyu_description' })
export class ZhiYu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  isAvailableTarget() {
    return false;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const from = room.getPlayerById(skillUseEvent.fromId);
    const damageEvent = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const handCards = from.getCardIds(PlayerCardsArea.HandArea);
    await room.drawCards(1, skillUseEvent.fromId, undefined, skillUseEvent.fromId, this.Name);
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, {
      fromId: skillUseEvent.fromId,
      displayCards: handCards,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(...handCards),
      ).extract(),
    });

    if (!damageEvent.fromId || room.getPlayerById(damageEvent.fromId).getPlayerCards().length === 0) {
      return true;
    }

    const firstCardColor = Sanguosha.getCardById(handCards[0]).Color;
    const inSameColor = handCards.find(cardId => Sanguosha.getCardById(cardId).Color !== firstCardColor) === undefined;
    if (inSameColor) {
      const askForCardDropEvent: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent> = {
        toId: damageEvent.fromId,
        cardAmount: 1,
        fromArea: [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea],
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForCardDropEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardDropEvent>(askForCardDropEvent),
        damageEvent.fromId,
      );

      const { droppedCards } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForCardDropEvent,
        damageEvent.fromId,
      );
      await room.dropCards(CardMoveReason.PassiveDrop, droppedCards, damageEvent.fromId, damageEvent.toId, this.Name);
    }
    return true;
  }
}
