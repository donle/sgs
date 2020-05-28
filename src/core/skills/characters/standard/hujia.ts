import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CharacterNationality } from 'core/characters/character';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CommonSkill, LordSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'hujia', description: 'hujia_description' })
@LordSkill
export class Hujia extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      identifier === GameEventIdentifiers.AskForCardResponseEvent ||
      identifier === GameEventIdentifiers.AskForCardUseEvent
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const { cardMatcher } = content;
    return (
      owner.Id === content.toId &&
      room.AlivePlayers.filter(player => player !== owner && player.Nationality === CharacterNationality.Wei).length >
        0 &&
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['jink'],
        }),
      )
    );
  }

  async onTrigger(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.toIds = room
      .getAlivePlayersFrom()
      .filter(player => player.Nationality === CharacterNationality.Wei && player.Id !== event.fromId)
      .map(player => player.Id);
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId, toIds } = event;
    const jinkCardEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const from = room.getPlayerById(fromId);

    for (const playerId of toIds!) {
      const responseJinkEvent: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent> = {
        cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
        toId: playerId,
        conversation: TranslationPack.translationJsonPatcher(
          'do you wanna response a {0} card for skill {1} from {2}',
          'jink',
          this.Name,
          TranslationPack.patchPlayerInTranslation(from),
        ).extract(),
      };
      room.notify(GameEventIdentifiers.AskForCardResponseEvent, responseJinkEvent, playerId);

      const response = await room.askForCardResponse(responseJinkEvent, playerId);
      if (response.cardId !== undefined) {
        const responseCard = Sanguosha.getCardById(response.cardId);

        const cardUseEvent: ClientEventFinder<
          GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent
        > = {
          cardId: VirtualCard.create({
            cardName: responseCard.Name,
            cardNumber: responseCard.CardNumber,
            cardSuit: responseCard.Suit,
            bySkill: this.Name,
          }).Id,
          fromId,
        };

        await room.responseCard(
          EventPacker.createIdentifierEvent(GameEventIdentifiers.CardResponseEvent, {
            cardId: responseCard.Id,
            fromId: playerId,
            responseToEvent: responseJinkEvent,
          }),
        );

        jinkCardEvent.responsedEvent = cardUseEvent;
        break;
      }
    }

    return true;
  }
}
