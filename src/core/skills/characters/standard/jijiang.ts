import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import {
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  LordSkill,
  ResponsiveSkill,
  ShadowSkill,
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
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        triggeredBySkillName: this.name,
      };

      room.notify(
        GameEventIdentifiers.AskForCardResponseEvent,
        jijiangEvent,
        player.Id,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForCardResponseEvent,
        player.Id,
      );
      if (response.cardId !== undefined) {
        const useCardEvent = {
          cardId: response.cardId,
          fromId: skillUseEvent.fromId,
          toIds: skillUseEvent.toIds,
        };
        room.useCard(useCardEvent);
      }
    }

    return true;
  }
}

@CommonSkill
@ShadowSkill
@LordSkill
export class JiJiangShadow extends ResponsiveSkill {
  constructor() {
    super('jijiang', 'jijiang_description');
  }
  public responsiveFor() {
    return new CardMatcher({ name: ['slash'] });
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
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        triggeredBySkillName: this.name,
      };

      room.notify(
        GameEventIdentifiers.AskForCardResponseEvent,
        jijiangEvent,
        player.Id,
      );

      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForCardResponseEvent,
        player.Id,
      );
      if (response.cardId !== undefined) {
        const { triggeredOnEvent } = skillUseEvent;
        const identifier = EventPacker.getIdentifier(
          triggeredOnEvent as ServerEventFinder<
            | GameEventIdentifiers.AskForCardUseEvent
            | GameEventIdentifiers.AskForCardResponseEvent
          >,
        );
        if (identifier === undefined) {
          throw new Error(`Unknown event identifier ${identifier}`);
        }
        const useCardEvent = {
          cardId: response.cardId,
          fromId: skillUseEvent.fromId,
          toIds: skillUseEvent.toIds,
        };

        identifier === GameEventIdentifiers.AskForCardUseEvent
          ? await room.useCard(useCardEvent)
          : await room.responseCard(useCardEvent);
      }
    }

    return true;
  }
}
