import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CharacterGender } from 'core/characters/character';
import { CardMoveReason, ClientEventFinder, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'lijian', description: 'lijian_description' })
export class LiJian extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 2;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    let canUse = room.getPlayerById(target).Gender === CharacterGender.Male;
    if (selectedTargets.length === 0) {
      canUse = canUse && room.getPlayerById(owner).canUseCardTo(room, new CardMatcher({ name: ['duel'] }), target);
    }

    return canUse;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    return [
      { from: fromId, tos: [toIds![1]] },
      { from: toIds![1], tos: [toIds![0]] },
    ];
  }

  public nominateForwardTarget(targets?: PlayerId[]) {
    return [targets![0]];
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.animation = this.getAnimationSteps(event);
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );
    const duel = VirtualCard.create({
      cardName: 'duel',
      bySkill: this.Name,
    });

    await room.useCard({
      fromId: skillUseEvent.toIds![1],
      toIds: [skillUseEvent.toIds![0]],
      cardId: duel.Id,
    });

    return true;
  }
}
