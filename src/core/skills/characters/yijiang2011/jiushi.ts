import { CardType, VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, TurnOverStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jiushi', description: 'jiushi_description' })
export class JiuShi extends ViewAsSkill {
  public static readonly levelUp: string = 'JiuShi_LevelUp';

  public canViewAs(): string[] {
    return ['alcohol'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return owner.isFaceUp() && owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] }));
  }

  public cardFilter(): boolean {
    return true;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public viewAs() {
    return VirtualCard.create<Alcohol>(
      {
        cardName: 'alcohol',
        bySkill: this.Name,
      },
      [],
    );
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.turnOver(skillEffectEvent.fromId);

    return true;
  }
}
@ShadowSkill
@CommonSkill({ name: JiuShi.Name, description: JiuShi.Description })
export class JiuShiShadow extends TriggerSkill {
  private static readonly faceDownTag = 'jiushi_face_down';

  public isAutoTrigger(room: Room): boolean {
    return (
      room.CurrentProcessingStage === DamageEffectStage.DamagedEffect ||
      room.CurrentProcessingStage === TurnOverStage.TurningOver
    );
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamagedEffect;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return (
      stage === DamageEffectStage.DamagedEffect ||
      stage === DamageEffectStage.AfterDamagedEffect ||
      stage === TurnOverStage.TurningOver
    );
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers>): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      if (damageEvent.toId === owner.Id && !owner.isFaceUp()) {
        if (room.CurrentProcessingStage === DamageEffectStage.DamagedEffect) {
          EventPacker.addMiddleware({ tag: JiuShiShadow.faceDownTag, data: true }, damageEvent);
        } else {
          return !!EventPacker.getMiddleware(JiuShiShadow.faceDownTag, damageEvent);
        }
      }
      return false;
    } else {
      const turnOverEvent = event as ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>;
      return turnOverEvent.toId === owner.Id && owner.getFlag<boolean>(JiuShi.levelUp);
    }
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async obtainTrickRandomly(room: Room, fromId: PlayerId) {
    const pendingCardIds = room.findCardsByMatcherFrom(new CardMatcher({ type: [CardType.Trick] }));
    if (pendingCardIds.length === 0) {
      return;
    }

    const randomIndex = Math.floor(Math.random() * pendingCardIds.length);
    await room.moveCards({
      movingCards: [{ card: pendingCardIds[randomIndex], fromArea: CardMoveArea.DrawStack }],
      toId: fromId,
      toArea: PlayerCardsArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      movedByReason: this.GeneralName,
    });
  }

  public async onEffect(
    room: Room,
    skillEffectEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const player = room.getPlayerById(skillEffectEvent.fromId);

    const unknownEvent = skillEffectEvent.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      await room.turnOver(skillEffectEvent.fromId);
      if (!player.getFlag<boolean>(JiuShi.levelUp)) {
        await this.obtainTrickRandomly(room, skillEffectEvent.fromId);
      }
    } else {
      await this.obtainTrickRandomly(room, skillEffectEvent.fromId);
    }

    return true;
  }
}
