import { CardMatcher } from 'core/cards/libs/card_matcher';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, CardEffectStage, CardResponseStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill({ name: 'wushuang', description: 'wushuang_description' })
export class WuShuang extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    if (stage === AimStage.AfterAim) {
      return (
        !!event.byCardId &&
        (Sanguosha.getCardById(event.byCardId).GeneralName === 'slash' ||
          Sanguosha.getCardById(event.byCardId).GeneralName === 'duel')
      );
    }
    return false;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    if (Sanguosha.getCardById(event.byCardId!).GeneralName === 'slash') {
      return owner.Id === event.fromId;
    }
    return owner.Id === event.fromId || event.toIds.includes(owner.Id);
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

    let toids: PlayerId[];
    if (Sanguosha.getCardById(wushuangEvent.byCardId!).GeneralName === 'slash') {
      toids = wushuangEvent.toIds;
    } else {
      if (wushuangEvent.fromId === skillUseEvent.fromId) {
        toids = wushuangEvent.toIds;
      } else {
        toids = [wushuangEvent.fromId];
      }
    }

    for (const id of toids) {
      room.setFlag<boolean>(id, this.Name, true);
    }

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
    return stage === CardUseStage.CardUseFinishedEffect || stage === CardResponseStage.AfterCardResponseEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    const { responseToEvent } = event;
    if (!responseToEvent || !event.fromId || room.getFlag<boolean>(event.fromId, this.GeneralName) !== true) {
      return false;
    }

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'jink';
    } else {
      const wushuangSourceEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return !!wushuangSourceEvent.cardId && Sanguosha.getCardById(wushuangSourceEvent.cardId).GeneralName === 'duel';
    }
  }

  async onTrigger(): Promise<boolean> {
    return true;
  }

  async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent } = skillUseEvent;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const jinkEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const { responseToEvent } = jinkEvent;
      const slashEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

      const askForUseCardEvent = {
        toId: jinkEvent.fromId,
        cardMatcher: new CardMatcher({ name: ['jink'] }).toSocketPassenger(),
        byCardId: slashEvent.cardId,
        cardUserId: slashEvent.fromId,
        triggeredBySkills: [Sanguosha.getCardById(slashEvent.cardId).Skill.Name],
        conversation: 'wushuang: please use extral jink',
        triggeredOnEvent: skillUseEvent,
      };

      const result = await room.askForCardUse(askForUseCardEvent, jinkEvent.fromId);
      const { responseEvent } = result;
      if (!responseEvent || responseEvent.cardId === undefined) {
        responseToEvent && EventPacker.recall(responseToEvent);
      } else {
        room.removeFlag(jinkEvent.fromId, this.GeneralName);
        await room.useCard({
          fromId: jinkEvent.fromId,
          cardId: responseEvent.cardId,
          toCardIds: [slashEvent.cardId],
          responseToEvent,
        });
      }
    } else if (identifier === GameEventIdentifiers.CardResponseEvent) {
      //can,t solve
      const slashEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardResponseEvent>;
      const { responseToEvent } = slashEvent;
      const duelEvent = responseToEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      const askForResponseCardEvent = {
        toId: slashEvent.fromId,
        cardMatcher: new CardMatcher({ name: ['slash'] }).toSocketPassenger(),
        byCardId: duelEvent.cardId,
        cardUserId: duelEvent.fromId,
        conversation: 'wushuang: please use extral slash',
      };
      const result = await room.askForCardResponse(askForResponseCardEvent, slashEvent.fromId);
      const { responseEvent } = result;
      if (!responseEvent || responseEvent.cardId === undefined) {
        EventPacker.terminate(slashEvent);
      } else {
        room.removeFlag(slashEvent.fromId, this.GeneralName);
        await room.responseCard({
          fromId: slashEvent.fromId,
          cardId: responseEvent.cardId,
          responseToEvent: duelEvent,
        });
        room.setFlag<boolean>(slashEvent.fromId, this.GeneralName, true);
      }
    }
    return true;
  }
}
