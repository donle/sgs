import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'mingjian', description: 'mingjian_description' })
export class MingJian extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
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

    await room.moveCards({
      movingCards: room
        .getPlayerById(fromId)
        .getCardIds(PlayerCardsArea.HandArea)
        .map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    room.addMark(toIds[0], MarkEnum.Jian, 1);

    room.getPlayerById(toIds[0]).hasShadowSkill(MingJianBuff.Name) ||
      (await room.obtainSkill(toIds[0], MingJianBuff.Name));
    room.getPlayerById(toIds[0]).hasShadowSkill(MingJianRemover.Name) ||
      (await room.obtainSkill(toIds[0], MingJianRemover.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_mingjian_buff', description: 's_mingjian_buff_description' })
export class MingJianBuff extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (room.getMark(owner.Id, MarkEnum.Jian) === 0) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return owner.getMark(MarkEnum.Jian);
    } else {
      return 0;
    }
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player) {
    return owner.getMark(MarkEnum.Jian) || 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_mingjian_remover', description: 's_mingjian_remover_description' })
export class MingJianRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public async whenDead(room: Room, player: Player) {
    player.hasShadowSkill(MingJianBuff.Name) && (await room.loseSkill(player.Id, MingJianBuff.Name));
    await room.loseSkill(player.Id, this.Name);
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return owner.Id === event.fromPlayer && event.from === PlayerPhase.PhaseFinish;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeMark(event.fromId, MarkEnum.Jian);

    room.getPlayerById(event.fromId).hasShadowSkill(MingJianBuff.Name) &&
      (await room.loseSkill(event.fromId, MingJianBuff.Name));
    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
