import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { ActiveSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'weimeng', description: 'weimeng_description' })
export class WeiMeng extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.Hp > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const handCards = room.getPlayerById(event.toIds[0]).getCardIds(PlayerCardsArea.HandArea);
    const response = await room.doAskForCommonly(
      GameEventIdentifiers.AskForChoosingCardWithConditionsEvent,
      {
        toId: event.toIds[0],
        customCardFields: {
          [PlayerCardsArea.HandArea]: handCards.length,
        },
        customTitle: this.Name,
        amount: [1, room.getPlayerById(event.fromId).Hp],
        triggeredBySkills: [this.Name],
      },
      event.fromId,
      true,
    );

    response.selectedCardsIndex = response.selectedCardsIndex || [0];
    response.selectedCards = Algorithm.randomPick(response.selectedCardsIndex.length, handCards);
    const gainedNum = response.selectedCards.length;

    await room.moveCards({
      movingCards: response.selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: event.toIds[0],
      toId: event.fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });
    const numberGained = response.selectedCards.reduce<number>((sum, cardId) => {
      return sum + Sanguosha.getCardById(cardId).CardNumber;
    }, 0);

    if (room.getPlayerById(event.fromId).getPlayerCards().length > 0 && !room.getPlayerById(event.toIds[0]).Dead) {
      const amount = Math.min(room.getPlayerById(event.fromId).getPlayerCards().length, gainedNum);
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: amount,
          toId: event.fromId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: you need to give {1} card(s) to {2}',
            this.Name,
            amount,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toIds[0])),
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      resp.selectedCards =
        resp.selectedCards.length > 0
          ? resp.selectedCards
          : Algorithm.randomPick(amount, room.getPlayerById(event.fromId).getPlayerCards());
      const numberGiven = resp.selectedCards.reduce<number>((sum, cardId) => {
        return sum + Sanguosha.getCardById(cardId).CardNumber;
      }, 0);

      await room.moveCards({
        movingCards: resp.selectedCards.map(card => ({
          card,
          fromArea: room.getPlayerById(event.fromId).cardFrom(card),
        })),
        fromId: event.fromId,
        toId: event.toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      if (numberGiven > numberGained) {
        await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);
      } else if (numberGiven < numberGained) {
        const to = room.getPlayerById(event.toIds[0]);
        const options: CardChoosingOptions = {
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
          [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
        };

        const chooseCardEvent = {
          fromId: event.fromId,
          toId: event.toIds[0],
          options,
          triggeredBySkills: [this.Name],
        };

        const resp2 = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);
        if (!resp2) {
          return false;
        }

        await room.dropCards(
          CardMoveReason.PassiveDrop,
          [resp2.selectedCard!],
          event.toIds[0],
          event.fromId,
          this.Name,
        );
      }
    }

    return true;
  }
}
