import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { LeBuSiShu } from 'core/cards/standard/lebusishu';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, RulesBreakerSkill, ShadowSkill } from 'core/skills/skill';

@CommonSkill({ name: 'limu', description: 'limu_description' })
export class LiMu extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return owner.canUseCardTo(
      room,
      VirtualCard.create({ cardName: 'lebusishu', cardSuit: CardSuit.Diamond, bySkill: this.Name }).Id,
      owner.Id,
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public numberOfTargets() {
    return 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).Suit === CardSuit.Diamond;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.useCard({
      fromId,
      targetGroup: [[fromId]],
      cardId: VirtualCard.create<LeBuSiShu>({ cardName: 'lebusishu', bySkill: this.Name }, cardIds).Id,
    });

    await room.recover({
      toId: fromId,
      recoveredHp: 1,
      recoverBy: fromId,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LiMu.Name, description: LiMu.Description })
export class LiMuShadow extends RulesBreakerSkill {
  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    if (owner.getCardIds(PlayerCardsArea.JudgeArea).length > 0 && room.withinAttackDistance(owner, target)) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    if (owner.getCardIds(PlayerCardsArea.JudgeArea).length > 0 && room.withinAttackDistance(owner, target)) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}
