import { CardId } from 'core/cards/libs/card_props';
import {
  ClientEventFinder,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, TriggerableTimes } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@TriggerableTimes(1)
export class ZhiHeng extends ActiveSkill {
  constructor() {
    super('zhiheng', 'zhiheng_description');
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 0;
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  isAvailableTarget(): boolean {
    return false;
  }

  isAvailableCard(room: Room, cardId: CardId): boolean {
    const cardFromArea = room.CurrentPlayer.cardFrom(cardId);
    return (
      cardFromArea !== undefined &&
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea].includes(
        cardFromArea,
      )
    );
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.CurrentPlayer.Character.Name,
      this.name,
    );

    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    if (!skillUseEvent.cardIds) {
      throw new Error('Unable to get zhiheng cards');
    }

    const dropCardEvent: ServerEventFinder<GameEventIdentifiers.CardDropEvent> = {
      fromId: skillUseEvent.fromId,
      cardIds: skillUseEvent.cardIds,
    };

    await room.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.CardDropEvent,
      dropCardEvent,
    );

    const numberOfCards = skillUseEvent.cardIds.length;
    await room.Processor.onHandleIncomingEvent(
      GameEventIdentifiers.DrawCardEvent,
      {
        playerId: room.CurrentPlayer.Id,
        numberOfCards,
      },
    );

    return true;
  }
}
