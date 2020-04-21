import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class FanJian extends ActiveSkill {
  constructor() {
    super('fanjian', 'fanjian_description');
  }

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.name);
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const toId = skillUseEvent.toIds![0];
    await room.moveCards(
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      toId,
      CardLostReason.ActiveMove,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HandArea,
      CardObtainedReason.PassiveObtained,
      skillUseEvent.fromId,
    );

    const moveCard = Sanguosha.getCardById(skillUseEvent.cardIds![0]);
    const from = room.getPlayerById(skillUseEvent.fromId);
    const to = room.getPlayerById(toId);
    let selectedOption: string | undefined;
    if (to.getPlayerCards().length > 0) {
      const chooseOptionEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId,
        options: [
          TranslationPack.translationJsonPatcher(
            'drop all {0} cards',
            Functional.getCardSuitRawText(moveCard.Suit),
          ).toString(),
          'lose a hp',
        ],
        conversation: TranslationPack.translationJsonPatcher(
          '{0} used skill {1} to you, please choose',
          TranslationPack.patchPlayerInTranslation(from),
          this.name,
        ).extract(),
        askedBy: skillUseEvent.fromId,
      };
      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(chooseOptionEvent),
        toId,
      );
      const response = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
      selectedOption = response.selectedOption;
    }

    if (!selectedOption || selectedOption === 'lose a hp') {
      await room.loseHp(toId, 1);
    } else {
      const to = room.getPlayerById(toId);
      const handCards = to.getCardIds(PlayerCardsArea.HandArea);
      const displayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
        fromId: toId,
        displayCards: handCards,
        translationsMessage: TranslationPack.translationJsonPatcher(
          '{0} displayed cards {1}',
          TranslationPack.patchPlayerInTranslation(to),
          TranslationPack.patchCardInTranslation(...handCards),
        ).extract(),
      };
      room.broadcast(GameEventIdentifiers.CardDisplayEvent, displayEvent);
      await room.dropCards(
        CardLostReason.PassiveDrop,
        to.getPlayerCards().filter(card => Sanguosha.getCardById(card).Suit === moveCard.Suit),
        toId,
      );
    }

    return true;
  }
}
