import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { Lightning } from 'core/cards/standard/lightning';
import { CardLostReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, FilterSkill, TriggerableTimes } from 'core/skills/skill';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class LightningSkill extends ActiveSkill {
  constructor() {
    super('lightning', 'lightning_description');
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.getCardIds(PlayerCardsArea.JudgeArea).find(cardId => Sanguosha.getCardById(cardId) instanceof Lightning) ===
      undefined
    );
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(): boolean {
    return false;
  }
  public async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>) {
    for (const player of room.getAlivePlayersFrom(event.fromId)) {
      if (room.isAvailableTarget(event.cardId, event.fromId, player.Id)) {
        await room.moveCard(
          event.cardId,
          event.fromId,
          player.Id,
          CardLostReason.PassiveMove,
          PlayerCardsArea.HandArea,
          PlayerCardsArea.JudgeArea,
        );
        event.toIds = [player.Id];
        break;
      }
    }

    return true;
  }

  public async moveToNextPlayer(room: Room, cardId: CardId, currentPlayer: PlayerId) {
    while (true) {
      const player = room.getNextPlayer(currentPlayer);
      if (player.Id === currentPlayer) {
        break;
      }

      const skip =
        player.getSkills<FilterSkill>('filter').find(skill => !skill.canBeUsedCard(cardId, room, player.Id)) !==
          undefined ||
        player
          .getCardIds(PlayerCardsArea.JudgeArea)
          .find(cardId => Sanguosha.getCardById(cardId) instanceof Lightning) !== undefined;

      if (skip) {
        continue;
      }

      if (player.Id !== currentPlayer) {
        await room.moveCard(
          cardId,
          currentPlayer,
          player.Id,
          CardLostReason.PassiveMove,
          PlayerCardsArea.JudgeArea,
          PlayerCardsArea.JudgeArea,
        );
      }
      break;
    }
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const { toIds, cardId } = event;

    const judgeCard = room.getCards(1, 'top')[0];

    const judgeEvent: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      bySkill: this.name,
      judgeCardId: judgeCard,
      toId: toIds![0],
    };

    await room.judge(judgeEvent);

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (card.Suit === CardSuit.Spade && card.CardNumber >= 2 && card.CardNumber <= 9) {
      const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
        damageType: DamageType.Thunder,
        damage: 3,
        toId: judgeEvent.toId,
        triggeredBySkills: event.triggeredBySkills ? [...event.triggeredBySkills, this.name] : [this.name],
      };

      await room.damage(damageEvent);

      room.broadcast(GameEventIdentifiers.CardDropEvent, {
        fromId: judgeEvent.toId,
        cardIds: [cardId],
      });
      room.getPlayerById(judgeEvent.toId).dropCards(cardId);
    } else {
      await this.moveToNextPlayer(room, cardId, judgeEvent.toId);
    }
    return true;
  }

  public async onEffectRejected(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    await this.moveToNextPlayer(room, event.cardId, event.toIds![0]);
  }
}
