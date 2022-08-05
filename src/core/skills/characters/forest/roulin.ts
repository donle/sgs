import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CharacterGender } from 'core/characters/character';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, OnDefineReleaseTiming, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'roulin', description: 'roulin_description' })
export class RouLin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    if (stage === AimStage.AfterAim) {
      return event.byCardId !== undefined && Sanguosha.getCardById(event.byCardId).GeneralName === 'slash';
    } else if (stage === AimStage.AfterAimmed) {
      return event.byCardId !== undefined && Sanguosha.getCardById(event.byCardId).GeneralName === 'slash';
    }
    return false;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    if (EventPacker.getMiddleware<boolean>(this.Name, event)) {
      return false;
    }

    return (
      (owner.Id === event.fromId && room.getPlayerById(event.toId).Gender === CharacterGender.Female) ||
      (owner.Id === event.toId && room.getPlayerById(event.fromId).Gender === CharacterGender.Female)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const rouLinEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    EventPacker.addMiddleware(
      {
        tag: this.Name,
        data: true,
      },
      rouLinEvent,
    );

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: RouLin.GeneralName, description: RouLin.Description })
export class RouLinShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (!event.responseToEvent) {
      return false;
    }

    let canUse = false;
    const { responseToEvent } = event;
    const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    canUse =
      Sanguosha.getCardById(event.cardId).GeneralName === 'jink' &&
      slashEvent &&
      Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash' &&
      !EventPacker.getMiddleware<boolean>(this.Name, event);

    return canUse && !!EventPacker.getMiddleware<boolean>(this.GeneralName, responseToEvent);
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;

    const jinkEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    const { responseToEvent } = jinkEvent;
    const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    EventPacker.removeMiddleware(this.GeneralName, slashEvent);
    EventPacker.terminate(jinkEvent);

    const askForUseCardEvent = {
      toId: jinkEvent.fromId,
      cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
      byCardId: slashEvent.cardId,
      cardUserId: slashEvent.fromId,
      triggeredBySkills: [this.Name],
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

    return true;
  }
}
