import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'beige', description: 'beige_description' })
export class BeiGe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const { cardIds } = content;
    if (cardIds === undefined) {
      return false;
    }

    const card = Sanguosha.getCardById(cardIds[0]);
    return (
      card.GeneralName === 'slash' &&
      content.fromId !== undefined &&
      !room.getPlayerById(content.toId).Dead &&
      !content.isFromChainedDamage
    );
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );
    const { toId, fromId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    const judge = await room.judge(toId, undefined, this.Name);
    const judgeCard = Sanguosha.getCardById(judge.judgeCardId);
    const damageFrom = room.getPlayerById(fromId!);
    if (judgeCard.Suit === CardSuit.Club) {
      const numOfCards = damageFrom.getPlayerCards().length;
      if (!damageFrom.Dead && numOfCards > 0) {
        const numOfDiscard = Math.min(numOfCards, 2);
        const response = await room.askForCardDrop(
          fromId!,
          numOfDiscard,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          undefined,
          this.Name,
        );
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, fromId);
      }
    } else if (judgeCard.Suit === CardSuit.Spade) {
      if (!damageFrom.Dead) {
        await room.turnOver(fromId!);
      }
    } else if (judgeCard.Suit === CardSuit.Heart) {
      const damageEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      await room.recover({
        recoveredHp: damageEvent.damage,
        recoverBy: toId,
        toId: toId!,
        triggeredBySkills: [this.Name],
      });
    } else if (judgeCard.Suit === CardSuit.Diamond) {
      await room.drawCards(3, toId, 'top', undefined, this.Name);
    }

    return true;
  }
}
