import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardMoveStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'zongxuan', description: 'zongxuan_description' })
export class ZongXuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage) {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>) {
    return (
      content.infos.find(
        info =>
          info.fromId === owner.Id &&
          (info.moveReason === CardMoveReason.PassiveDrop || info.moveReason === CardMoveReason.SelfDrop) &&
          info.movingCards.find(node => room.isCardInDropStack(node.card)) !== undefined,
      ) !== undefined
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = skillUseEvent;
    const moveCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;

    const cardIds: CardId[] = [];
    if (moveCardEvent.infos.length === 1) {
      cardIds.push(
        ...moveCardEvent.infos[0].movingCards.filter(node => room.isCardInDropStack(node.card)).map(node => node.card),
      );
    } else {
      const infos = moveCardEvent.infos.filter(
        info =>
          info.fromId === fromId &&
          (info.moveReason === CardMoveReason.PassiveDrop || info.moveReason === CardMoveReason.SelfDrop) &&
          info.movingCards.find(node => room.isCardInDropStack(node.card)) !== undefined,
      );

      cardIds.push(
        ...infos.reduce<CardId[]>((ids, info) => {
          return ids.concat(info.movingCards.filter(node => room.isCardInDropStack(node.card)).map(node => node.card));
        }, []),
      );
    }

    const tricks = cardIds.filter(id => Sanguosha.getCardById(id).is(CardType.Trick));
    if (tricks.length > 0) {
      const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
        toId: fromId,
        cardIds: tricks,
        amount: 1,
        customTitle: 'zongxuan: please choose one of these cards',
        ignoreNotifiedStatus: true,
      };

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardEvent>(
        GameEventIdentifiers.AskForChoosingCardEvent,
        askForChooseCardEvent,
        fromId,
      );

      if (response.selectedCards && response.selectedCards.length > 0) {
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players: room.getOtherPlayers(fromId).map(player => player.Id),
            toId: fromId,
            requiredAmount: 1,
            conversation: 'zongxuan: please choose another player',
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        if (resp.selectedPlayers && resp.selectedPlayers.length > 0) {
          await room.moveCards({
            movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.DropStack }],
            toId: resp.selectedPlayers[0],
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActiveMove,
            triggeredBySkills: [this.Name],
          });

          const index = cardIds.findIndex(id => id === response.selectedCards![0]);
          cardIds.splice(index, 1);
        }
      }
    }

    if (cardIds.length < 1) {
      return true;
    }

    const numOfCards = cardIds.length;

    const askForGuanxing = EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForPlaceCardsInDileEvent>({
      toId: fromId,
      cardIds,
      top: numOfCards,
      topStackName: 'drop stack',
      bottom: numOfCards,
      bottomStackName: 'draw stack top',
      bottomMinCard: 1,
      movable: true,
      triggeredBySkills: [this.GeneralName],
    });

    room.notify(GameEventIdentifiers.AskForPlaceCardsInDileEvent, askForGuanxing, fromId);
    const { bottom } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForPlaceCardsInDileEvent,
      fromId,
    );

    room.putCards('top', ...bottom);

    return true;
  }
}
