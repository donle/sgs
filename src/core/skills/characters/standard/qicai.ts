import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'qicai', description: 'qicai_description' })
export class QiCai extends RulesBreakerSkill {
  public breakCardUsableDistance(cardId: CardId | CardMatcher) {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ type: [CardType.Trick] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.is(CardType.Trick);
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@CompulsorySkill({ name: QiCai.Name, description: QiCai.Description })
export class QiCaiBlock extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage: CardMoveStage) {
    return stage === CardMoveStage.BeforeCardMoving;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      content.fromId === owner.Id &&
      content.moveReason === CardMoveReason.PassiveDrop &&
      content.proposer !== owner.Id &&
      content.movingCards.find(
        cardInfo =>
          cardInfo.fromArea === CardMoveArea.EquipArea &&
          (Sanguosha.getCardById(cardInfo.card).is(CardType.Armor) ||
            Sanguosha.getCardById(cardInfo.card).is(CardType.Precious)),
      ) !== undefined
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} triggered skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = event;
    EventPacker.terminate(triggeredOnEvent!);
    return true;
  }
}
