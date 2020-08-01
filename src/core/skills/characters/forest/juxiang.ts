import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'juxiang', description: 'juxiang_description' })
export class JuXiang extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.CardUseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardEffectStage.PreCardEffect || stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.CardUseEvent>,
  ): boolean {
    const unknownEvent = EventPacker.getIdentifier(event);
    if (unknownEvent === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = event as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      return (
        cardEffectEvent.toIds !== undefined &&
        cardEffectEvent.toIds.includes(owner.Id) &&
        Sanguosha.getCardById(cardEffectEvent.cardId).GeneralName === 'nanmanruqing'
      );
    } else if (unknownEvent === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'nanmanruqing' && cardUseEvent.fromId !== owner.Id
      );
    }

    return false;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = content.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.CardUseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      content.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}, nullify {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
      ).extract();
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      content.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
        this.Name,
      ).extract();
    }

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.CardUseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      cardEffectEvent.nullifiedTargets?.push(event.fromId);
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const { cardId } = cardUseEvent;
      const cardIds: CardId[] = [];
      cardIds.push(cardId);

      await room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toId: event.fromId,
        moveReason: CardMoveReason.ActivePrey,
        toArea: CardMoveArea.HandArea,
      });
    }

    return true;
  }
}
