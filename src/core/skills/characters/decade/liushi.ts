import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'liushi', description: 'liushi_description' })
export class LiuShi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.getPlayerCards().length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner &&
      room.getPlayerById(owner).canUseCardTo(room, new CardMatcher({ name: ['slash'] }), target, true)
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).Suit === CardSuit.Heart;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toArea: CardMoveArea.DrawStack,
      moveReason: CardMoveReason.PlaceToDrawStack,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    await room.useCard({
      fromId: event.fromId,
      targetGroup: [event.toIds],
      cardId: VirtualCard.create({ cardName: 'slash', bySkill: this.Name }).Id,
      extraUse: true,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LiuShi.Name, description: LiuShi.Description })
export class LiuShiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseBegin && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      !event.isFromChainedDamage &&
      event.cardIds !== undefined &&
      Sanguosha.isVirtualCardId(event.cardIds[0]) &&
      Sanguosha.getCardById<VirtualCard>(event.cardIds[0]).findByGeneratedSkill(this.GeneralName)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.syncGameCommonRules(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId,
      user => {
        room.CommonRules.addAdditionalHoldCardNumber(user, -1);
        const liushiNum = room.getFlag<number>(user.Id, this.GeneralName) || 0;
        room.setFlag<number>(
          user.Id,
          this.GeneralName,
          liushiNum + 1,
          TranslationPack.translationJsonPatcher('liushi: {0}', liushiNum + 1).toString(),
        );
      },
    );

    return true;
  }
}
