import { CardType } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_ATTACK_RANGE } from 'core/game/game_props';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, CommonSkill, RulesBreakerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'gongji', description: 'gongji_description' })
export class GongJi extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const to = room.getPlayerById(target);
    return target !== owner && to.getPlayerCards().length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return !Sanguosha.getCardById(cardId).is(CardType.Basic);
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);

    const to = room.getPlayerById(toIds![0]);
    if (to.getPlayerCards().length < 1) {
      return true;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId,
      toId: toIds![0],
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      fromId,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.dropCards(
      CardMoveReason.PassiveDrop,
      [response.selectedCard],
      chooseCardEvent.toId,
      fromId,
      this.Name,
    );

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: GongJi.Name, description: GongJi.Description })
export class GongJiBuff extends RulesBreakerSkill {
  public breakFinalAttackRange(room: Room, owner: Player): number {
    const hasRide = owner.getEquipment(CardType.OffenseRide) || owner.getEquipment(CardType.DefenseRide);
    return hasRide ? INFINITE_ATTACK_RANGE : -1;
  }
}
