import { CardMatcher } from 'core/cards/libs/card_matcher';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'duanbing', description: 'duanbing_description' })
export class DuanBing extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardTargetDeclared || stage === AimStage.AfterAim;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return cardUseEvent.fromId === owner.Id && Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash';
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const aimEvent = content as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return aimEvent.fromId === owner.Id && Sanguosha.getCardById(aimEvent.byCardId).GeneralName === 'slash';
    }

    return false;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const from = room.getPlayerById(event.fromId);
      const targets = room
        .getOtherPlayers(event.fromId)
        .filter(
          player =>
            room.distanceBetween(from, player) === 1 &&
            !TargetGroupUtil.getRealTargets(cardUseEvent.targetGroup).includes(player.Id) &&
            room.canUseCardTo(cardUseEvent.cardId, from, player, true),
        )
        .map(player => player.Id);

      if (targets.length < 1) {
        return false;
      }

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players: targets,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to choose a target with 1 distance between you to be the target of {1}?',
            this.Name,
            TranslationPack.patchCardInTranslation(cardUseEvent.cardId),
          ).extract(),
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (response.selectedPlayers && response.selectedPlayers.length > 0) {
        event.toIds = response.selectedPlayers;
        return true;
      }
    }

    return EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.AimEvent;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.AimEvent
    >;
    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.CardUseEvent) {
      if (!event.toIds) {
        return false;
      }

      TargetGroupUtil.pushTargets(
        (unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup!,
        event.toIds[0],
      );
    } else {
      EventPacker.addMiddleware({ tag: this.Name, data: true }, unknownEvent);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: DuanBing.Name, description: DuanBing.Description })
export class DuanBingShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === CardUseStage.AfterCardUseEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    if (!event.responseToEvent) {
      return false;
    }

    const slashEvent = event.responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    return (
      event.toCardIds !== undefined &&
      !!EventPacker.getMiddleware<boolean>(this.GeneralName, event.responseToEvent) &&
      Sanguosha.getCardById(event.cardId).GeneralName === 'jink' &&
      slashEvent &&
      Sanguosha.getCardById(slashEvent.cardId).GeneralName === 'slash' &&
      !EventPacker.getMiddleware<boolean>(this.Name, event)
    );
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const jinkEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
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
      if (!EventPacker.terminate(useJinkEvent) || useJinkEvent.toCardIds) {
        EventPacker.recall(jinkEvent);
      }
    }

    return true;
  }
}
