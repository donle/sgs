import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import {
  AllStage,
  CardUseStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'yangwei', description: 'yangwei_description' })
export class YangWei extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.getFlag<boolean>(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);
    room.setFlag<boolean>(event.fromId, this.Name, true);
    room.getPlayerById(event.fromId).setFlag<boolean>(YangWeiRemover.Name, true);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YangWei.Name, description: YangWei.Description })
export class YangWeiShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !room.getPlayerById(owner).getFlag<boolean>(this.GeneralName);
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!owner.getFlag<boolean>(this.GeneralName)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? 1 : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? 1 : 0;
    }
  }

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
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: YangWeiShadow.Name, description: YangWeiShadow.Description })
export class YangWeiRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, owner: PlayerId): boolean {
    return !!room.getPlayerById(owner).getFlag<string>(this.GeneralName);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage !== PhaseStageChangeStage.StageChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === CardUseStage.BeforeCardUseEffect ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        cardUseEvent.fromId === owner.Id &&
        Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash' &&
        owner.getFlag<boolean>(this.GeneralName)
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        owner.getFlag<boolean>(this.GeneralName) &&
        !owner.getFlag<boolean>(this.Name)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        phaseChangeEvent.from === PlayerPhase.PhaseFinish &&
        phaseChangeEvent.fromPlayer === owner.Id &&
        (owner.getFlag<boolean>(this.GeneralName) || owner.getFlag<boolean>(this.Name))
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      cardUseEvent.triggeredBySkills = cardUseEvent.triggeredBySkills || [];
      cardUseEvent.triggeredBySkills.push(this.GeneralName); 
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      room.removeFlag(event.fromId, this.GeneralName);
    } else {
      room.getPlayerById(event.fromId).removeFlag(this.Name);
    }

    return true;
  }
}
