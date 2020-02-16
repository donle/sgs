import { CardSuit } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  FilterSkill,
  TriggerableTimes,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(INFINITE_TRIGGERING_TIMES)
export class LightningSkill extends ActiveSkill {
  constructor() {
    super('lightning', 'lightning_description');
  }

  public canUse() {
    return true;
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

      await room.damage(damageEvent);
    } else {
      while (true) {
        const player = room.getNextPlayer(judgeEvent.toId);
        for (const skill of player.getSkills<FilterSkill>('filter')) {
          if (!skill.canBeUsedCard(judgeEvent.cardId, room, player.Id)) {
            continue;
          }

          await room.moveCard(
            judgeEvent.cardId,
            judgeEvent.toId,
            player.Id,
            PlayerCardsArea.JudgeArea,
            PlayerCardsArea.JudgeArea,
          );
          break;
        }
      }
    }
    return true;
  }
}
