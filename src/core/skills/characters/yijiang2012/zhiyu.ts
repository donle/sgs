import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
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

  targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 0;
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

    if (
      !damageEvent.fromId ||
      room.getPlayerById(damageEvent.fromId).getCardIds(PlayerCardsArea.HandArea).length === 0
    ) {
      return true;
    }

    const firstCardColor = Sanguosha.getCardById(handCards[0]).Color;
    const inSameColor = handCards.find(cardId => Sanguosha.getCardById(cardId).Color !== firstCardColor) === undefined;
    if (inSameColor) {
      const { droppedCards } = await room.askForCardDrop(
        damageEvent.fromId,
        1,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.Name,
      );
      await room.dropCards(CardMoveReason.SelfDrop, droppedCards, damageEvent.fromId, damageEvent.fromId, this.Name);
    }
    return true;
  }
}
