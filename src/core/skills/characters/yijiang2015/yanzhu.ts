import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { XingXue, XingXueEX } from 'core/skills';
import { ActiveSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yanzhu', description: 'yanzhu_description' })
export class YanZhu extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const response = await room.askForCardDrop(
      toIds[0],
      1,
      [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
      room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.EquipArea).length === 0,
      undefined,
      this.Name,
      room.getPlayerById(toIds[0]).getCardIds(PlayerCardsArea.EquipArea).length > 0
        ? TranslationPack.translationJsonPatcher(
            '{0}: please discard a card, or you must give {1} all the cards in your eqiup area',
            this.Name,
          ).extract()
        : undefined,
    );
    if (response.droppedCards.length > 0) {
      await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name);

      const originalDamage = room.getFlag<number>(toIds[0], this.Name) || 0;
      room.setFlag<number>(
        toIds[0],
        this.Name,
        originalDamage + 1,
        TranslationPack.translationJsonPatcher('yanzhu points: {0}', originalDamage + 1).toString(),
      );

      room.getPlayerById(toIds[0]).hasShadowSkill(YanZhuDebuff.Name) ||
        (await room.obtainSkill(toIds[0], YanZhuDebuff.Name));
    } else {
      await room.moveCards({
        movingCards: room
          .getPlayerById(toIds[0])
          .getCardIds(PlayerCardsArea.EquipArea)
          .map(card => ({ card, fromArea: CardMoveArea.EquipArea })),
        fromId: toIds[0],
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });

      room.getPlayerById(fromId).hasSkill(this.Name) && (await room.updateSkill(fromId, this.Name, YanZhuEX.Name));
      room.getPlayerById(fromId).hasSkill(XingXue.Name) &&
        (await room.updateSkill(fromId, XingXue.Name, XingXueEX.Name));
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_yanzhu_debuff', description: 's_yanzhu_debuff_description' })
export class YanZhuDebuff extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      content.toPlayer === owner &&
      room.CurrentPlayerPhase === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public async whenDead(room: Room, player: Player) {
    await room.loseSkill(player.Id, this.Name);
    room.removeFlag(player.Id, YanZhu.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.DamagedEffect || stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return (event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId === owner.Id;
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.toPlayer === owner.Id && phaseChangeEvent.to === PlayerPhase.PhaseBegin;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const additionalDamage = room.getFlag<number>(event.fromId, YanZhu.Name);
    if (additionalDamage) {
      room.removeFlag(event.fromId, YanZhu.Name);
      const unkownEvent = event.triggeredOnEvent as ServerEventFinder<
        GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
      >;

      if (EventPacker.getIdentifier(unkownEvent) === GameEventIdentifiers.DamageEvent) {
        (unkownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).damage += additionalDamage;
      }
    }

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}

@CommonSkill({ name: 'yanzhu_ex', description: 'yanzhu_ex_description' })
export class YanZhuEX extends YanZhu {
  public get GeneralName() {
    return YanZhu.Name;
  }

  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && !owner.hasUsedSkill(this.GeneralName);
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const originalDamage = room.getFlag<number>(toIds[0], this.GeneralName) || 0;
    room.setFlag<number>(
      toIds[0],
      this.GeneralName,
      originalDamage + 1,
      TranslationPack.translationJsonPatcher('yanzhu points: {0}', originalDamage + 1).toString(),
    );

    room.getPlayerById(toIds[0]).hasShadowSkill(YanZhuDebuff.Name) ||
      (await room.obtainSkill(toIds[0], YanZhuDebuff.Name));

    return true;
  }
}
