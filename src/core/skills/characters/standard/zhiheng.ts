import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'zhiheng', description: 'zhiheng_description' })
export class ZhiHeng extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public isRefreshAt(room: Room, owner: Player, phase: PlayerPhase): boolean {
    return phase === PlayerPhase.PlayCardStage;
  }

  public numberOfTargets(): number {
    return 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableTarget(): boolean {
    return false;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    skillUseEvent.cardIds = Precondition.exists(skillUseEvent.cardIds, 'Unable to get zhiheng cards');

    const handCards = room.getPlayerById(skillUseEvent.fromId).getCardIds(PlayerCardsArea.HandArea);
    let additionalCardDraw = 0;
    if (
      skillUseEvent.cardIds.filter(zhihengCard => handCards.includes(zhihengCard)).length === handCards.length &&
      handCards.length > 0
    ) {
      additionalCardDraw++;
    }

    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );

    await room.drawCards(
      skillUseEvent.cardIds.length + additionalCardDraw,
      skillUseEvent.fromId,
      undefined,
      skillUseEvent.fromId,
      this.Name,
    );

    return true;
  }
}
