import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { AimStage, AllStage, LoseHpStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

import { CardMatcher } from 'core/cards/libs/card_matcher';

@CompulsorySkill({ name: 'zhaxiang', description: 'zhaxiang_description' })
export class ZhaXiang extends TriggerSkill {
  private check: boolean = false;

  constructor() {
    super();
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>, stage?: AllStage): boolean {
    return stage === LoseHpStage.AfterLostHp;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>) {
    return owner.Id === content.toId;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const event = skillUseEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.LoseHpEvent>;
    let hp = event.lostHp;

    while (hp--) {
      await room.drawCards(3, skillUseEvent.fromId);
      room.addMark(skillUseEvent.fromId, '!zhaxiang', 1);
    }

    return true;
  }
}

@ShadowSkill({ remainStatus: true })
@CompulsorySkill({ name: ZhaXiang.GeneralName, description: ZhaXiang.Description })
export class ZhaXiangShadow extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AimEvent>,
    stage: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const current_event = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return current_event.from === PlayerPhase.FinishStage && stage === PhaseChangeStage.AfterPhaseChanged;
    } else {
      const current_event = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return (
        stage === AimStage.AfterAim &&
        current_event.byCardId !== undefined &&
        Sanguosha.getCardById(current_event.byCardId).GeneralName === 'slash' &&
        Sanguosha.getCardById(current_event.byCardId).isRed()
      );
    }
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AimEvent>,
  ): boolean {
    if (room.getMark(owner.Id, '!zhaxiang') === 0) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AimEvent) {
      const current_event = event as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      return owner.Id === current_event.fromId;
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AimEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const current_event = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      current_event.fromPlayer && room.removeMark(current_event.fromPlayer, '!zhaxiang');
    } else if (identifier === GameEventIdentifiers.AimEvent) {
      const current_event = unknownEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
      if (room.getMark(current_event.fromId, '!zhaxiang') > 0) {
        EventPacker.setDisresponsiveEvent(current_event);
      }
    }

    return true;
  }
}

@ShadowSkill({ remainStatus: true })
@CompulsorySkill({ name: '#zhaxiang', description: ZhaXiang.Description })
export class ZhaXiangDistance extends RulesBreakerSkill {
  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.CurrentPlayer !== owner || room.getMark(owner.Id, '!zhaxiang') === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: [CardSuit.Heart, CardSuit.Diamond], name: ['slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.GeneralName === 'slash' && card.isRed();
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const extra = room.CurrentPlayer === owner ? room.getMark(owner.Id, '!zhaxiang') : 0;
    if (extra === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ name: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return extra;
    } else {
      return 0;
    }
  }
}
