import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, CardMoveStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'liji', description: 'liji_description' })
export class LiJi extends ActiveSkill {
  isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      owner.hasUsedSkillTimes(this.Name) <
      Math.floor((owner.getFlag<number>(this.Name) || 0) / (owner.getFlag<number>(LiJiShadow.Name) || 8))
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, fromId, fromId, this.Name);

    await room.damage({
      fromId,
      toId: event.toIds[0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiJi.Name, description: LiJi.Description })
export class LiJiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      stage === PhaseChangeStage.PhaseChanged ||
      stage === PhaseChangeStage.AfterPhaseChanged ||
      stage === CardMoveStage.AfterCardMoved
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return (
        (stage === PhaseChangeStage.PhaseChanged &&
          phaseChangeEvent.fromPlayer === owner.Id &&
          phaseChangeEvent.from === PlayerPhase.PhaseFinish) ||
        (stage === PhaseChangeStage.AfterPhaseChanged &&
          phaseChangeEvent.toPlayer === owner.Id &&
          phaseChangeEvent.to === PlayerPhase.PhaseBegin)
      );
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      const moveCardEvent = event as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      return (
        room.CurrentPlayer === owner &&
        moveCardEvent.infos.find(info => info.toArea === CardMoveArea.DropStack) !== undefined
      );
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PhaseChangeEvent | GameEventIdentifiers.MoveCardEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      if (room.CurrentPlayerPhase === PlayerPhase.PhaseBegin) {
        const count = room.AlivePlayers.length > 4 ? 8 : 4;
        room.setFlag<number>(fromId, this.Name, count);

        const droppedNum = room.getFlag<number>(fromId, LiJi.Name) || 0;
        room.setFlag<number>(
          fromId,
          LiJi.Name,
          droppedNum,
          TranslationPack.translationJsonPatcher(
            'liji times: {0} {1}',
            count - (droppedNum % count),
            Math.floor(droppedNum / count),
          ).toString(),
        );
      } else {
        room.removeFlag(fromId, this.Name);
        room.removeFlag(fromId, LiJi.Name);
      }
    } else {
      let droppedNum = room.getFlag<number>(fromId, LiJi.Name) || 0;
      droppedNum += (unknownEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>).infos.reduce<number>(
        (sum, info) => {
          return info.toArea === CardMoveArea.DropStack
            ? sum + info.movingCards.filter(card => !Sanguosha.isVirtualCardId(card.card)).length
            : sum;
        },
        0,
      );

      const count = room.getFlag<number>(fromId, this.Name) || 8;
      room.setFlag<number>(
        fromId,
        LiJi.Name,
        droppedNum,
        TranslationPack.translationJsonPatcher(
          'liji times: {0} {1}',
          count - (droppedNum % count),
          Math.floor(droppedNum / count) - room.getPlayerById(fromId).hasUsedSkillTimes(this.GeneralName),
        ).toString(),
      );
    }

    return true;
  }
}
