import { CardSuit } from 'core/cards/libs/card_props';
import { Lightning } from 'core/cards/standard/lightning';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  FilterSkill,
  TriggerableTimes,
} from 'core/skills/skill';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class LightningSkill extends ActiveSkill {
  constructor() {
    super('lightning', 'lightning_description');
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner
        .getCardIds(PlayerCardsArea.JudgeArea)
        .find(cardId => Sanguosha.getCardById(cardId) instanceof Lightning) ===
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
  public async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.CardUseEvent>,
  ) {
    for (const player of room.getAlivePlayersFrom(event.fromId)) {
      if (room.isAvailableTarget(event.cardId, event.fromId, player.Id)) {
        await room.moveCard(
          event.cardId,
          event.fromId,
          player.Id,
          PlayerCardsArea.HandArea,
          PlayerCardsArea.JudgeArea,
        );
        event.toIds = [player.Id];
        break;
      }
    }

    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>,
  ) {
    const { toIds, cardId } = event;

    const judgeCard = room.getCards(1, 'top')[0];

    const judgeEvent: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      cardId,
      judgeCardId: judgeCard,
      toId: toIds![0],
    };

    await room.judge(judgeEvent);

    const card = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (
      card.Suit === CardSuit.Spade &&
      card.CardNumber >= 2 &&
      card.CardNumber <= 9
    ) {
      const damageEvent: ServerEventFinder<GameEventIdentifiers.DamageEvent> = {
        damageType: DamageType.Thunder,
        damage: 3,
        toId: judgeEvent.toId,
      };

      //TODO: doesn't trigger jianxiong
      await room.damage(damageEvent);

      room.notify(
        GameEventIdentifiers.CardDropEvent,
        {
          fromId: judgeEvent.toId,
          cardIds: [cardId],
        },
        judgeEvent.toId,
      );
      room.getPlayerById(judgeEvent.toId).dropCards(cardId);
    } else {
      while (true) {
        const player = room.getNextPlayer(judgeEvent.toId);
        const skip =
          player
            .getSkills<FilterSkill>('filter')
            .find(
              skill => !skill.canBeUsedCard(judgeEvent.cardId, room, player.Id),
            ) !== undefined ||
          player
            .getCardIds(PlayerCardsArea.JudgeArea)
            .find(
              cardId => Sanguosha.getCardById(cardId) instanceof Lightning,
            ) !== undefined;

        if (skip && player.Id !== judgeEvent.toId) {
          continue;
        }

        if (player.Id !== judgeEvent.toId) {
          await room.moveCard(
            judgeEvent.cardId,
            judgeEvent.toId,
            player.Id,
            PlayerCardsArea.JudgeArea,
            PlayerCardsArea.JudgeArea,
          );
        }
        break;
      }
    }
    return true;
  }
}
