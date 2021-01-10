import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardDrawReason, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DrawCardStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jieying', description: 'jieying_description' })
export class JieYing extends TriggerSkill implements OnDefineReleaseTiming {
  async whenLosingSkill(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.Ying) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.Ying);
      await room.loseSkill(other.Id, JieYingEffect.Name);
    }
  }
  async whenDead(room: Room, player: Player) {
    for (const other of room.getOtherPlayers(player.Id)) {
      if (other.getMark(MarkEnum.Ying) === 0) {
        continue;
      }

      room.removeMark(other.Id, MarkEnum.Ying);
      await room.loseSkill(other.Id, JieYingEffect.Name);
    }
  }

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    if (
      (EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseChangeEvent &&
        (event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).to === PlayerPhase.PhaseBegin) ||
      (EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseStageChangeEvent &&
        (event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId !== owner.Id)
    ) {
      return true;
    }
    return false;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === PhaseChangeStage.BeforePhaseChange ||
      (stage === PhaseStageChangeStage.StageChanged &&
        (event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).toStage ===
          PlayerPhaseStages.PhaseFinish)
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      return (
        room.AlivePlayers.find(player => player.getMark(MarkEnum.Ying) > 0) === undefined &&
        room.CurrentPlayer.Id === owner.Id
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      return (
        room
          .getPlayerById((event as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId)
          .getMark(MarkEnum.Ying) > 0
      );
    }
    return false;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ) {
    return !room.getPlayerById(target).getFlag<boolean>(this.jieYingTarget);
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[], selectedCards: CardId[], cardId?: CardId) {
    return targets.length === 1;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  private readonly jieYingTarget = 'jieyingTarget';

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent, fromId, toIds } = skillEffectEvent;
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);
    const from = room.getPlayerById(fromId);

    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.setMark(fromId, MarkEnum.Ying, 1);
      from.setFlag<boolean>(this.jieYingTarget, true);
      await room.obtainSkill(fromId, JieYingEffect.Name);
    } else {
      if (from.getFlag<boolean>(this.jieYingTarget)) {
        if (!toIds) {
          return false;
        }

        const toId = toIds[0];
        from.removeFlag(this.jieYingTarget);
        room.removeMark(fromId, MarkEnum.Ying);
        room.setMark(toId, MarkEnum.Ying, 1);
        await room.loseSkill(fromId, JieYingEffect.Name);
        await room.obtainSkill(toId, JieYingEffect.Name);
      } else {
        const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
        room.removeMark(event.playerId, MarkEnum.Ying);

        await room.moveCards({
          fromId: event.playerId,
          movingCards: room
            .getPlayerById(event.playerId)
            .getCardIds(PlayerCardsArea.HandArea)
            .map(card => ({ card, fromArea: PlayerCardsArea.HandArea })),
          moveReason: CardMoveReason.PassiveMove,
          movedByReason: this.Name,
          toArea: PlayerCardsArea.HandArea,
          toId: fromId,
          engagedPlayerIds: [fromId, event.playerId],
        });
      }
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JieYing.Name, description: JieYing.Description })
export class JieYingDraw extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      room.getPlayerById(content.fromId).getMark(MarkEnum.Ying) > 0 &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount += 1;

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JieYingDraw.Name, description: JieYingDraw.Description })
export class JieYingEffect extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.getMark(owner.Id, MarkEnum.Ying) === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return 1;
    } else {
      return 0;
    }
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player) {
    if (room.getMark(owner.Id, MarkEnum.Ying) === 0) {
      return 0;
    }

    return 1;
  }
}
