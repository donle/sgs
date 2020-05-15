import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Precondition } from 'core/shares/libs/precondition/precondition';
import { ActiveSkill, CommonSkill } from 'core/skills/skill';

@CommonSkill({ name: 'guohechaiqiao', description: 'guohechaiqiao_description' })
export class GuoHeChaiQiaoSkill extends ActiveSkill {
  public canUse() {
    return true;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }
  public cardFilter(): boolean {
    return true;
  }
  public isAvailableCard(): boolean {
    return false;
  }
  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard: CardId,
  ): boolean {
    return (
      target !== owner &&
      room.getPlayerById(owner).canUseCardTo(room, containerCard, target) &&
      room.getPlayerById(target).getCardIds().length > 0
    );
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>) {
    const to = room.getPlayerById(Precondition.exists(event.toIds, 'Unknown targets in guohechaiqiao')[0]);
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
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      event.fromId!,
    );

    const response = await room.onReceivingAsyncReponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      event.fromId!,
    );

    if (response.selectedCard === undefined) {
      response.selectedCard = to.getCardIds(PlayerCardsArea.HandArea)[response.selectedCardIndex!];
    }

    if (response.fromArea !== PlayerCardsArea.JudgeArea) {
      await room.dropCards(
        CardMoveReason.PassiveDrop,
        [response.selectedCard],
        chooseCardEvent.toId,
        chooseCardEvent.fromId,
        this.Name,
      );
    } else {
      await room.moveCards({
        movingCards: [
          {
            card: response.selectedCard!,
            fromArea: to.cardFrom(response.selectedCard!),
          },
        ],
        moveReason: CardMoveReason.PassiveDrop,
        fromId: to.Id,
        toArea: CardMoveArea.DropStack,
      });
    }
    return true;
  }
}
