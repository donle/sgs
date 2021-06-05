import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yuce', description: 'yuce_description' })
export class YuCe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard() {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, triggeredOnEvent } = skillUseEvent;

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: cardIds!,
      fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        TranslationPack.patchCardInTranslation(...cardIds!),
      ).extract(),
    };

    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const damageFromId = damageEvent.fromId!;
    const damageFrom = room.getPlayerById(damageFromId!);

    if (damageFrom && !damageFrom.Dead) {
      const handCards = damageFrom.getCardIds(PlayerCardsArea.HandArea);
      if (handCards.length <= 0) {
        await room.recover({
          toId: fromId,
          recoveredHp: 1,
        });
      } else {
        const allTypes = [CardType.Basic, CardType.Trick, CardType.Equip];
        const availableTypes = allTypes.filter(type => type !== Sanguosha.getCardById(cardIds![0]).BaseType);

        const askForDiscard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
          toId: damageFromId,
          amount: 1,
          cardMatcher: new CardMatcher({ type: availableTypes }).toSocketPassenger(),
          customCardFields: {
            [PlayerCardsArea.HandArea]: handCards,
          },
        };

        room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForDiscard, damageFromId);

        const { selectedCards } = await room.onReceivingAsyncResponseFrom(
          GameEventIdentifiers.AskForChoosingCardEvent,
          damageFromId,
        );

        if (selectedCards !== undefined && selectedCards.length > 0) {
          await room.dropCards(CardMoveReason.SelfDrop, selectedCards, damageFromId, damageFromId, this.Name);
        } else {
          await room.recover({
            toId: fromId,
            recoveredHp: 1,
          });
        }
      }
    }

    return true;
  }
}
