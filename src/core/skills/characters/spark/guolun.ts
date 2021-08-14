import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guolun', description: 'guolun_description' })
export class GuoLun extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    const to = room.getPlayerById(toIds[0]);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = EventPacker.createUncancellableEvent<
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent
    >({
      fromId,
      toId: toIds![0],
      options,
      triggeredBySkills: [this.Name],
    });

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      chooseCardEvent,
      fromId,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    const showCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: [response.selectedCard],
      fromId: toIds![0],
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} display hand card {1} from {2}',
        TranslationPack.patchPlayerInTranslation(from),
        TranslationPack.patchCardInTranslation(response.selectedCard),
        TranslationPack.patchPlayerInTranslation(to),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, showCardEvent);

    if (from.getPlayerCards().length > 0) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: 1,
          toId: fromId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you can show a hand card and exchange this card for {1}',
            this.Name,
            TranslationPack.patchCardInTranslation(response.selectedCard),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      if (resp.selectedCards && resp.selectedCards.length > 0) {
        const diff =
          Sanguosha.getCardById(response.selectedCard).CardNumber -
          Sanguosha.getCardById(resp.selectedCards[0]).CardNumber;

        const newShowCardEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
          displayCards: [resp.selectedCards[0]],
          fromId,
          translationsMessage: TranslationPack.translationJsonPatcher(
            '{0} display hand card {1}',
            TranslationPack.patchPlayerInTranslation(from),
            TranslationPack.patchCardInTranslation(resp.selectedCards[0]),
          ).extract(),
        };
        room.broadcast(GameEventIdentifiers.CardDisplayEvent, newShowCardEvent);

        await room.asyncMoveCards([
          {
            moveReason: CardMoveReason.PassiveMove,
            movingCards: [{ card: resp.selectedCards[0], fromArea: CardMoveArea.HandArea }],
            fromId,
            toArea: CardMoveArea.ProcessingArea,
            proposer: fromId,
            movedByReason: this.Name,
          },
          {
            moveReason: CardMoveReason.PassiveMove,
            movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.HandArea }],
            fromId: toIds[0],
            toArea: CardMoveArea.ProcessingArea,
            proposer: toIds[0],
            movedByReason: this.Name,
          },
        ]);

        await room.asyncMoveCards([
          {
            moveReason: CardMoveReason.PassiveMove,
            movingCards: [{ card: resp.selectedCards[0], fromArea: CardMoveArea.ProcessingArea }],
            toId: toIds[0],
            toArea: CardMoveArea.HandArea,
            proposer: fromId,
            movedByReason: this.Name,
          },
          {
            moveReason: CardMoveReason.PassiveMove,
            movingCards: [{ card: response.selectedCard, fromArea: CardMoveArea.ProcessingArea }],
            toId: fromId,
            toArea: CardMoveArea.HandArea,
            proposer: toIds[0],
            movedByReason: this.Name,
          },
        ]);

        if (diff > 0) {
          await room.drawCards(1, fromId, 'top', fromId, this.Name);
        } else if (diff < 0) {
          await room.drawCards(1, toIds[0], 'top', toIds[0], this.Name);
        }
      }
    }

    return true;
  }
}
