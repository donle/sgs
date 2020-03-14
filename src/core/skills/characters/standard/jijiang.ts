import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  LordSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill
@LordSkill
export class JiJiang extends ActiveSkill {
  constructor() {
    super('jijiang', 'jijiang_description');
  }

  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return (
      targets.length ===
      room.CurrentPlayer.getCardAdditionalUsableNumberOfTargets(
        new CardMatcher({
          name: ['slash'],
        }),
      ) +
        1
    );
  }

  cardFilter(room: Room, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return room.canAttack(
      room.getPlayerById(owner),
      room.getPlayerById(targetId),
    );
  }

  isAvailableCard(): boolean {
    return false;
  }

  async onUse(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} activates skill {1}',
      room.getPlayerById(event.fromId).Name,
      this.name,
    ).extract();

    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    for (const player of room.getAlivePlayersFrom()) {
      if (
        player === room.CurrentPlayer ||
        player.Nationality !== CharacterNationality.Shu
      ) {
        continue;
      }

      const jijiangEvent = {
        toId: player.Id,
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        triggeredBySkillName: this.name,
        conversation: TranslationPack.translationJsonPatcher(
          '{0} used skill {1} to you, please response a {2} card',
          room.getPlayerById(skillUseEvent.fromId).Character.Name,
          this.name,
          'slash',
        ).extract(),
      };

      const result = await room.askForCardResponse(jijiangEvent, player.Id);
      const { terminated, responseEvent } = result;

      if (terminated) {
        return false;
      }
      else if (responseEvent && responseEvent.cardId !== undefined) {
        const useCardEvent = {
          cardId: responseEvent.cardId,
          fromId: skillUseEvent.fromId,
          toIds: skillUseEvent.toIds,
        };
        await room.useCard(useCardEvent);
      }
    }

    return true;
  }
}

@CommonSkill
@ShadowSkill
@LordSkill
export class JiJiangShadow extends TriggerSkill {
  public isAutoTrigger() {
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForCardUseEvent
    >,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return (
      identifier === GameEventIdentifiers.AskForCardResponseEvent ||
      identifier === GameEventIdentifiers.AskForCardUseEvent
    );
  }

  constructor() {
    super('jijiang', 'jijiang_description');
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.AskForCardResponseEvent
      | GameEventIdentifiers.AskForCardUseEvent
    >,
  ) {
    const { cardMatcher } = content;
    return (
      owner.Id === content.toId &&
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['slash'],
        }),
      )
    );
  }

  async onTrigger(
    room: Room,
    event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>,
  ) {
    return true;
  }

  async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ) {
    const { triggeredOnEvent, fromId } = event;
    const slashCardEvent = triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.AskForCardUseEvent
      | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const identifier = EventPacker.getIdentifier<
      | GameEventIdentifiers.AskForCardUseEvent
      | GameEventIdentifiers.AskForCardResponseEvent
    >(slashCardEvent);

    if (identifier === undefined) {
      throw new Error(`Unwrapped event without identifier in ${this.name}`);
    }

    for (const player of room.getAlivePlayersFrom()) {
      if (
        player.Nationality === CharacterNationality.Shu &&
        player.Id !== fromId
      ) {
        room.notify(identifier, slashCardEvent, player.Id);

        const response = await room.onReceivingAsyncReponseFrom(
          identifier,
          player.Id,
        );

        if (response.cardId !== undefined) {
          const responseCard = Sanguosha.getCardById(response.cardId);

          const cardUseEvent = {
            cardId: VirtualCard.create({
              cardName: responseCard.Name,
              cardNumber: responseCard.CardNumber,
              cardSuit: responseCard.Suit,
            }).Id,
            fromId,
            responseToEvent: triggeredOnEvent,
          };

          if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
            await room.useCard(
              EventPacker.createIdentifierEvent(
                GameEventIdentifiers.CardUseEvent,
                { ...cardUseEvent, fromId: response.fromId },
              ),
            );
            await room.useCard(
              EventPacker.createIdentifierEvent(
                GameEventIdentifiers.CardUseEvent,
                cardUseEvent,
              ),
            );
          } else {
            await room.responseCard(
              EventPacker.createIdentifierEvent(
                GameEventIdentifiers.CardResponseEvent,
                { ...cardUseEvent, fromId: response.fromId },
              ),
            );
            await room.responseCard(
              EventPacker.createIdentifierEvent(
                GameEventIdentifiers.CardResponseEvent,
                cardUseEvent,
              ),
            );
          }

          return !EventPacker.isTerminated(cardUseEvent);
        }
      }
    }
    return true;
  }
}
