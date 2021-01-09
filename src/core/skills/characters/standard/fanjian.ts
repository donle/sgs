import { CardId } from 'core/cards/libs/card_props';
import {
  CardMoveArea,
  CardMoveReason,
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

@CommonSkill({ name: 'fanjian', description: 'fanjian_description' })
export class FanJian extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 1;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const toId = skillUseEvent.toIds![0];

    room.displayCards(skillUseEvent.fromId, skillUseEvent.cardIds!);

    await room.moveCards({
      movingCards: [{ card: skillUseEvent.cardIds![0], fromArea: CardMoveArea.HandArea }],
      fromId: skillUseEvent.fromId,
      toId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: skillUseEvent.fromId,
      engagedPlayerIds: room.getAllPlayersFrom().map(player => player.Id),
    });

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
          this.Name,
        ).extract(),
        askedBy: skillUseEvent.fromId,
      };
      room.notify(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(chooseOptionEvent),
        toId,
      );
      const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, toId);
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
        CardMoveReason.SelfDrop,
        to.getPlayerCards().filter(card => Sanguosha.getCardById(card).Suit === moveCard.Suit),
        toId,
      );
    }

    return true;
  }
}
