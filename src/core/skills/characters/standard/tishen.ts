import { CardType } from 'core/cards/card';
import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AimStage,
  AllStage,
  CardUseStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, CompulsorySkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CommonSkill({ name: 'tishen', description: 'tishen_description' })
export class TiShen extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && PlayerPhaseStages.PlayCardStageEnd === content.toStage;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const cards = room
      .getPlayerById(skillUseEvent.fromId)
      .getPlayerCards()
      .filter((cardId) => {
        const card = Sanguosha.getCardById(cardId);
        return card.is(CardType.OffenseRide) || card.is(CardType.DefenseRide) || card.is(CardType.Trick);
      });

    await room.dropCards(CardLostReason.ActiveDrop, cards, skillUseEvent.fromId, skillUseEvent.fromId, this.Name);
    room.getPlayerById(skillUseEvent.fromId).addInvisibleMark(this.Name, 1);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: TiShen.GeneralName, description: TiShen.Description })
export class TiShenShadow extends TriggerSkill implements OnDefineReleaseTiming {
  onLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.PrepareStage && room.CurrentPlayer.Id === playerId;
  }

  isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
    stage?: AllStage,
  ) {
    return (
      stage === AimStage.AfterAimmed ||
      stage === CardUseStage.CardUseFinishedEffect ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >,
  ) {
    if (owner.getInvisibleMark(this.GeneralName) <= 0) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.AimEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.AimEvent>).toIds.includes(owner.Id);
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return !!content.toIds?.includes(owner.Id) && Sanguosha.getCardById(content.cardId).GeneralName === 'slash';
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId === owner.Id;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return content.toPlayer === owner.Id && content.to === PlayerPhase.PrepareStage;
    }

    return false;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, fromId } = skillUseEvent;
    const event = triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.AimEvent
      | GameEventIdentifiers.CardUseEvent
      | GameEventIdentifiers.DamageEvent
      | GameEventIdentifiers.PhaseChangeEvent
    >;
    const player = room.getPlayerById(fromId);

    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.AimEvent) {
      player.setFlag(this.Name, true);
    } else if (identifier === GameEventIdentifiers.CardUseEvent) {
      if (player.getFlag<boolean>(this.Name)) {
        player.removeFlag(this.Name);
        const { cardId } = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
        await room.obtainCards(
          {
            toId: fromId,
            cardIds: [cardId],
            reason: CardObtainedReason.ActivePrey,
          },
          true,
        );
      }
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      player.removeFlag(this.Name);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      player.removeInvisibleMark(this.GeneralName);
    }

    return true;
  }
}
