import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE } from 'core/game/game_props';
import { PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  FilterSkill,
  OnDefineReleaseTiming,
  RulesBreakerSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@CommonSkill({ name: 'tianyi', description: 'tianyi_description' })
export class TianYi extends ActiveSkill {
  public static readonly Win = 'tianyi_win';
  public static readonly Lose = 'tianyi_lose';

  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const targetPlayer = room.getPlayerById(target);
    return (
      target !== owner && targetPlayer.getCardIds(PlayerCardsArea.HandArea).length > 0 && room.canPindian(owner, target)
    );
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = event;
    const { pindianRecord } = await room.pindian(fromId, toIds!);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      room.setFlag<boolean>(fromId, TianYi.Win, true, true);
    } else {
      room.setFlag<boolean>(fromId, TianYi.Lose, true, true);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: TianYi.Name, description: TianYi.Description })
export class TianYiRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage: PhaseChangeStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      content.fromPlayer === owner.Id &&
      (room.getFlag<boolean>(owner.Id, TianYi.Win) !== undefined ||
        room.getFlag<boolean>(owner.Id, TianYi.Lose) !== undefined)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    if (room.getFlag<boolean>(skillUseEvent.fromId, TianYi.Win) !== undefined) {
      room.removeFlag(skillUseEvent.fromId, TianYi.Win);
    }

    if (room.getFlag<boolean>(skillUseEvent.fromId, TianYi.Lose) !== undefined) {
      room.removeFlag(skillUseEvent.fromId, TianYi.Lose);
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: TianYiRemove.Name, description: TianYiRemove.Description })
export class TianYiExtra extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room, playerId: PlayerId): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public breakCardUsableTargets(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<boolean>(owner.Id, TianYi.Win)) {
      return 0;
    }

    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? 1 : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? 1 : 0;
    }
  }

  public breakCardUsableDistance(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<boolean>(owner.Id, TianYi.Win)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<boolean>(owner.Id, TianYi.Win)) {
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
}

@ShadowSkill
@CommonSkill({ name: TianYiExtra.Name, description: TianYiExtra.Description })
export class TianYiBlock extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
    if (!room.getFlag<boolean>(owner, TianYi.Lose)) {
      return true;
    }

    return cardId instanceof CardMatcher
      ? !cardId.match(new CardMatcher({ generalName: ['slash'] }))
      : Sanguosha.getCardById(cardId).GeneralName !== 'slash';
  }
}
