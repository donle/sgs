import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterNationality } from 'core/characters/character';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill, LordSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jijiang', description: 'jijiang_description' })
@LordSkill
export class JiJiang extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.canUseCard(room, new CardMatcher({ name: ['slash'] }));
  }

  targetFilter(room: Room, targets: PlayerId[]): boolean {
    return (
      targets.length ===
      room.CurrentPlayer.getCardAdditionalUsableNumberOfTargets(
        room,
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
    return owner !== targetId && room.canAttack(room.getPlayerById(owner), room.getPlayerById(targetId));
  }

  isAvailableCard(): boolean {
    return false;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    for (const player of room.getAlivePlayersFrom()) {
      if (player.Id === skillUseEvent.fromId || player.Nationality !== CharacterNationality.Shu) {
        continue;
      }

      const jijiangEvent = {
        toId: player.Id,
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        triggeredBySkills: [this.Name],
        conversation: TranslationPack.translationJsonPatcher(
          '{0} used skill {1} to you, please response a {2} card',
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
          this.Name,
          'slash',
        ).extract(),
      };

      const result = await room.askForCardResponse(jijiangEvent, player.Id);
      const { terminated, responseEvent } = result;

      if (terminated) {
        return false;
      } else if (responseEvent && responseEvent.cardId !== undefined) {
        room.addProcessingCards(responseEvent.cardId.toString(), responseEvent.cardId);
        await room.responseCard({
          fromId: responseEvent.fromId,
          cardId: responseEvent.cardId!,
        });

        const useCardEvent = {
          cardId: responseEvent.cardId,
          fromId: skillUseEvent.fromId,
          toIds: skillUseEvent.toIds,
          skipDrop: true,
        };
        await room.useCard(useCardEvent);
        break;
      }
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: 'jijiang', description: 'jijiang_description' })
@LordSkill
export class JiJiangShadow extends TriggerSkill {
  public isAutoTrigger(
    room: Room,
    event?: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ) {
    const identifier = event && EventPacker.getIdentifier(event);
    return identifier === GameEventIdentifiers.AskForCardUseEvent ? true : false;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AskForCardResponseEvent>) {
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
      CardMatcher.match(
        cardMatcher,
        new CardMatcher({
          name: ['slash'],
        }),
      )
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = event;
    const identifier = EventPacker.getIdentifier(
      triggeredOnEvent! as ServerEventFinder<
        GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
      >,
    );
    if (identifier === undefined) {
      EventPacker.terminate(event);
      return false;
    }

    event.translationsMessage = TranslationPack.translationJsonPatcher(
      '{0} used skill {1}',
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
      this.Name,
    ).extract();

    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      const { scopedTargets } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      const slashMatcher = new CardMatcher({
        name: ['slash'],
      });
      const from = room.getPlayerById(event.fromId);
      const chooseTargetEvent = {
        fromId: event.fromId,
        players:
          scopedTargets ||
          room.AlivePlayers.filter(player => from.canUseCardTo(room, slashMatcher, player.Id)).map(player => player.Id),
        requiredAmount: 1,
        conversation: TranslationPack.translationJsonPatcher('do you want to trigger skill {0} ?', this.Name).extract(),
      };

      room.notify(GameEventIdentifiers.AskForChoosingPlayerEvent, chooseTargetEvent, event.fromId);
      const response = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        event.fromId,
      );
      if (response.selectedPlayers === undefined) {
        EventPacker.terminate(event);
        return false;
      }

      EventPacker.addMiddleware(
        {
          tag: this.Name,
          data: response.selectedPlayers[0],
        },
        event,
      );
    }

    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = event;
    const slashCardEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent
    >;
    const identifier = Precondition.exists(
      EventPacker.getIdentifier<GameEventIdentifiers.AskForCardUseEvent | GameEventIdentifiers.AskForCardResponseEvent>(
        slashCardEvent,
      ),
      `Unwrapped event without identifier in ${this.Name}`,
    );

    for (const player of room.getAlivePlayersFrom()) {
      if (player.Nationality === CharacterNationality.Shu && player.Id !== fromId) {
        room.notify(
          GameEventIdentifiers.AskForCardResponseEvent,
          {
            toId: player.Id,
            fromId: event.fromId,
            cardMatcher: slashCardEvent.cardMatcher,
            triggeredBySkills: [this.Name],
            conversation: TranslationPack.translationJsonPatcher(
              '{0} used skill {1} to you, please response a {2} card',
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
              this.Name,
              'slash',
            ).extract(),
          },
          player.Id,
        );

        const response = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForCardResponseEvent,
          player.Id,
        );
        if (response.cardId !== undefined) {
          const responseCard = Sanguosha.getCardById(response.cardId);
          const cardUseEvent = {
            cardId: VirtualCard.create({
              cardName: responseCard.Name,
              cardNumber: responseCard.CardNumber,
              cardSuit: responseCard.Suit,
              bySkill: this.Name,
            }).Id,
            fromId,
            responseToEvent: triggeredOnEvent,
          };

          await room.responseCard({
            cardId: response.cardId,
            fromId: response.fromId,
          });

          if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
            const target = Precondition.exists(
              EventPacker.getMiddleware<PlayerId>(this.Name, event),
              'Unexpected jijiang target',
            );
            await room.useCard({
              ...cardUseEvent,
              toIds: [target],
            });
            EventPacker.terminate(slashCardEvent);
          } else {
            await room.responseCard(cardUseEvent);
          }

          return !EventPacker.isTerminated(cardUseEvent);
        }
      }
    }
    return true;
  }
}
