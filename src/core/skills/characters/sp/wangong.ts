import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, CardUseStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'wangong', description: 'wangong_description' })
export class WanGong extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenLosingSkill(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.Name);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.BeforeCardUseEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      !content.extraUse &&
      owner.getFlag<boolean>(this.Name) &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash'
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;

    cardUseEvent.extraUse = true;
    room.CurrentPlayerPhase === PlayerPhase.PlayCardStage &&
      room.CurrentPhasePlayer === room.getPlayerById(event.fromId) &&
      room.syncGameCommonRules(event.fromId, user => {
        room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), 1, user);
        user.addInvisibleMark(this.Name, 1);
      });
    cardUseEvent.additionalDamage = cardUseEvent.additionalDamage || 0;
    cardUseEvent.additionalDamage++;

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WanGong.Name, description: WanGong.Description })
export class WanGongShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      (owner.getFlag<boolean>(this.GeneralName)
        ? !Sanguosha.getCardById(content.cardId).is(CardType.Basic)
        : Sanguosha.getCardById(content.cardId).is(CardType.Basic))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const cardId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).cardId;
    const card = Sanguosha.getCardById(cardId);

    card.is(CardType.Basic)
      ? room.setFlag<boolean>(event.fromId, this.GeneralName, true, this.GeneralName)
      : room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: WanGongShadow.Name, description: WanGongShadow.Description })
export class WanGongBuff extends RulesBreakerSkill {
  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!owner.getFlag<boolean>(this.GeneralName)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_DISTANCE : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_DISTANCE : 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    if (!owner.getFlag<boolean>(this.GeneralName)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: WanGongBuff.Name, description: WanGongBuff.Description })
export class WanGongClear extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  private clearWanGongHistory(room: Room, from: Player) {
    const extraUse = from.getInvisibleMark(this.GeneralName);
    if (extraUse === 0) {
      return;
    }

    room.syncGameCommonRules(from.Id, user => {
      room.CommonRules.addCardUsableTimes(new CardMatcher({ generalName: ['slash'] }), -extraUse, user);
      from.removeInvisibleMark(this.GeneralName);
    });
  }

  public async whenDead(room: Room, player: Player) {
    this.clearWanGongHistory(room, player);
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.fromPlayer === owner.Id &&
      content.from === PlayerPhase.PlayCardStage &&
      owner.getInvisibleMark(this.GeneralName) > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    this.clearWanGongHistory(room, room.getPlayerById(event.fromId));

    return true;
  }
}
