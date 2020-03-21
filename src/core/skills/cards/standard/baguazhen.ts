import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
export class BaGuaZhenSkill extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      identifier === GameEventIdentifiers.AskForCardResponseEvent ||
      identifier === GameEventIdentifiers.AskForCardUseEvent
    );
  }

  constructor() {
    super('baguazhen', 'baguazhen_description');
  }

  canUse(
    room: Room,
    owner: Player,
    content?: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    if (!content) {
      return true;
    }

    const { cardMatcher } = content;
    return (
      owner.Id === content.toId &&
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['jink'],
        }),
      )
    );
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.name,
    ).extract();

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = event;
    const jinkCardEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const identifier = Precondition.exists(
      EventPacker.getIdentifier<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>(
        jinkCardEvent,
      ),
      `Unwrapped event without identifier in ${this.name}`,
    );

    const judgeCardId = room.getCards(1, 'top')[0];
    const judgeEvent: ServerEventFinder<GameEventIdentifiers.JudgeEvent> = {
      toId: event.fromId,
      judgeCardId,
      bySkill: this.name,
    };

    await room.judge(judgeEvent);

    if (Sanguosha.getCardById(judgeCardId).isRed()) {
      const jink = VirtualCard.create({
        cardName: 'jink',
      });

      const cardUseEvent = {
        cardId: jink.Id,
        fromId,
        responseToEvent: jinkCardEvent,
      };

      if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
        await room.useCard(cardUseEvent);
        EventPacker.terminate(jinkCardEvent);
      } else {
        await room.responseCard(cardUseEvent);
        EventPacker.terminate(jinkCardEvent);
      }

      return !EventPacker.isTerminated(cardUseEvent);
    }

    return true;
  }
}
