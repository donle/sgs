import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { AllStage, LoseHpStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CompulsorySkill({ name: 'zhaxiang', description: 'zhaxiang_description' })
export class ZhaXiang extends TriggerSkill {
  private check: boolean = false;

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>, stage?: AllStage): boolean {
    return stage === LoseHpStage.AfterLostHp;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>) {
    return owner.Id === content.toId;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.LoseHpEvent>) {
    return event.lostHp;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.drawCards(3, skillUseEvent.fromId);
    const num = room.getFlag<number>(skillUseEvent.fromId, this.GeneralName) || 0;
    room.setFlag<number>(skillUseEvent.fromId, this.GeneralName, num + 1);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZhaXiang.GeneralName, description: ZhaXiang.Description })
export class ZhaXiangShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AskForCardUseEvent>,
    stage: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return currentEvent.from === PlayerPhase.FinishStage && stage === PhaseChangeStage.AfterPhaseChanged;
    } else {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      return (
        currentEvent.byCardId !== undefined &&
        Sanguosha.getCardById(currentEvent.byCardId).GeneralName === 'slash' &&
        Sanguosha.getCardById(currentEvent.byCardId).isRed()
      );
    }
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AskForCardUseEvent>,
  ): boolean {
    if (room.getFlag<number>(owner.Id, this.GeneralName) === 0) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      const currentEvent = event as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      return owner.Id === currentEvent.cardUserId;
    }

    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const unknownEvent = triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.AskForCardUseEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const currentEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      currentEvent.fromPlayer && room.removeFlag(currentEvent.fromPlayer, this.GeneralName);
    } else if (identifier === GameEventIdentifiers.AskForCardUseEvent) {
      const currentEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardUseEvent>;
      if (room.getFlag<number>(currentEvent.cardUserId!, this.GeneralName) > 0) {
        currentEvent.cardMatcher = new CardMatcher(currentEvent.cardMatcher)
          .without({ name: ['jink'] })
          .toSocketPassenger();
      }
    }

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZhaXiangShadow.Name, description: ZhaXiang.Description })
export class ZhaXiangDistance extends RulesBreakerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.CurrentPlayer !== owner || !room.getFlag<number>(owner.Id, this.GeneralName)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ suit: [CardSuit.Heart, CardSuit.Diamond], generalName: ['slash'] }));
    } else {
      const card = Sanguosha.getCardById(cardId);
      match = card.GeneralName === 'slash' && card.isRed();
    }

    return match ? INFINITE_DISTANCE : 0;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const extra = room.getFlag<number>(owner.Id, this.GeneralName);
    if (room.CurrentPlayer !== owner || !extra) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    return match ? extra : 0;
  }
}
