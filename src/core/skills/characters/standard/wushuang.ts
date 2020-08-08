import { CardMatcher } from 'core/cards/libs/card_matcher';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'wushuang', description: 'wushuang_description' })
export class WuShuang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    if (stage === AimStage.AfterAim) {
      return (
        event.byCardId !== undefined &&
        (Sanguosha.getCardById(event.byCardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(event.byCardId).GeneralName === 'duel')
      );
    } else if (stage === AimStage.AfterAimmed) {
      return event.byCardId !== undefined && Sanguosha.getCardById(event.byCardId).GeneralName === 'duel';
    }
    return false;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    if (EventPacker.getMiddleware<boolean>(this.Name, event)) {
      return false;
    }

    if (Sanguosha.getCardById(event.byCardId!).GeneralName === 'slash') {
      return owner.Id === event.fromId;
    }
    return owner.Id === event.fromId || event.toId === owner.Id;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const wushuangEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.addMiddleware(
      {
        tag: this.Name,
        data: true,
      },
      wushuangEvent,
    );

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WuShuang.GeneralName, description: WuShuang.Description })
export class WuShuangShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === CardUseStage.AfterCardUseEffect || stage === CardResponseStage.AfterCardResponseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    const { responseToEvent } = event;
    if (!responseToEvent) {
      return false;
    }

    let canUse = false;
    switch (identifier) {
      case GameEventIdentifiers.CardUseEvent: {
        const jinkEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
        const { responseToEvent } = jinkEvent;
        const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
        canUse =
          Sanguosha.getCardById(jinkEvent.cardId).GeneralName === 'jink' &&
          slashEvent &&
          Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash' &&
          !EventPacker.getMiddleware<boolean>(this.Name, jinkEvent);
        break;
      }
      case GameEventIdentifiers.CardResponseEvent: {
        const slashEvent = event as ServerEventFinder<GameEventIdentifiers.CardResponseEvent>;
        const { responseToEvent } = slashEvent;
        const duelEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
        canUse = Sanguosha.getCardById(duelEvent.cardId).GeneralName === 'duel' && slashEvent.fromId !== owner.Id;
        break;
      }
      default:
        return false;
    }

    return canUse && !!EventPacker.getMiddleware<boolean>(this.GeneralName, responseToEvent);
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const jinkEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const { responseToEvent } = jinkEvent;
      const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      EventPacker.removeMiddleware(this.GeneralName, slashEvent);
      EventPacker.terminate(jinkEvent);

      const askForUseCardEvent = {
        toId: jinkEvent.fromId,
        cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
        byCardId: slashEvent.cardId,
        cardUserId: slashEvent.fromId,
        triggeredBySkills: [Sanguosha.getCardById(slashEvent.cardId).Skill.GeneralName],
        conversation:
          slashEvent.fromId !== undefined
            ? TranslationPack.translationJsonPatcher(
                '{0} used {1} to you, please use a {2} card',
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(slashEvent.fromId)),
                TranslationPack.patchCardInTranslation(slashEvent.cardId),
                'jink',
              ).extract()
            : TranslationPack.translationJsonPatcher(
                'please use a {0} card to response {1}',
                'jink',
                TranslationPack.patchCardInTranslation(slashEvent.cardId),
              ).extract(),
        triggeredOnEvent: slashEvent,
      };

      const response = await room.askForCardUse(askForUseCardEvent, jinkEvent.fromId);
      if (response.cardId !== undefined) {
        const useJinkEvent = {
          fromId: jinkEvent.fromId,
          cardId: response.cardId,
          toCardIds: jinkEvent.toCardIds,
          responseToEvent: slashEvent,
        };
        EventPacker.addMiddleware({ tag: this.Name, data: true }, useJinkEvent);
        await room.useCard(useJinkEvent, true);
        if (!EventPacker.isTerminated(useJinkEvent)) {
          EventPacker.recall(jinkEvent);
        }
      }
    } else {
      const duelResponseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardResponseEvent>;
      if (EventPacker.getMiddleware<boolean>(this.Name, duelResponseEvent)) {
        return true;
      }

      const { responseToEvent } = duelResponseEvent;
      const duelEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const askForResponseCardEvent = {
        toId: duelResponseEvent.fromId,
        cardMatcher: new CardMatcher({ generalName: ['slash'] }).toSocketPassenger(),
        byCardId: duelEvent.cardId,
        cardUserId: duelResponseEvent.fromId,
        conversation: TranslationPack.translationJsonPatcher(
          'please response a {0} card to response {1}',
          'slash',
          TranslationPack.patchCardInTranslation(duelEvent.cardId),
        ).extract(),
      };
      const response = await room.askForCardResponse(askForResponseCardEvent, duelResponseEvent.fromId);
      if (response.cardId === undefined) {
        EventPacker.terminate(duelResponseEvent);
      } else {
        const responseCardEvent = {
          fromId: duelResponseEvent.fromId,
          cardId: response.cardId,
          responseToEvent: duelEvent,
        };
        EventPacker.addMiddleware({ tag: this.Name, data: true }, responseCardEvent);
        await room.responseCard(responseCardEvent);
      }
    }
    return true;
  }
}
