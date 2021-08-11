import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';
import { ExtralCardSkillProperty } from '../interface/extral_property';

@CommonSkill({ name: 'shunshouqianyang', description: 'shunshouqianyang_description' })
export class ShunShouQianYangSkill extends ActiveSkill implements ExtralCardSkillProperty {
  public canUse() {
    return true;
  }

  public numberOfTargets() {
    return 1;
  }

  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }

  public isCardAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ) {
    const to = room.getPlayerById(target);

    return (
      target !== owner &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      to.getCardIds().length > 0
    );
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    const from = room.getPlayerById(owner);
    const to = room.getPlayerById(target);

    return (
      this.isCardAvailableTarget(owner, room, target, selectedCards, selectedTargets, containerCard) &&
      room.cardUseDistanceBetween(room, containerCard, from, to) <=
        Sanguosha.getCardById(containerCard).EffectUseDistance
    );
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const to = room.getPlayerById(Precondition.exists(event.toIds, 'Unknown targets in shunshouqianyang')[0]);
    if (to.getCardIds().length === 0) {
      return true;
    }

    const options: CardChoosingOptions = {
      [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: event.fromId!,
      toId: to.Id,
      options,
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      event.fromId!,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      event.fromId!,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
      fromId: chooseCardEvent.toId,
      toId: chooseCardEvent.fromId,
      moveReason: CardMoveReason.ActivePrey,
      toArea: CardMoveArea.HandArea,
      proposer: chooseCardEvent.fromId,
    });
    return true;
  }
}
