import { Card, VirtualCard } from 'core/cards/card';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'piaoling', description: 'piaoling_description' })
export class PiaoLing extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PhaseFinishStart && room.CurrentPlayer.Id === owner.Id;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const judgeResult = await room.judge(fromId, undefined, this.Name);
    const card = Sanguosha.getCardById(judgeResult.judgeCardId);
    if (card.Suit !== CardSuit.Heart) {
      return false;
    }

    const askForOptions: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      toId: fromId,
      options: ['option-one', 'option-two'],
      conversation: '#piaoling-select',
      triggeredBySkills: [this.Name],
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForOptions),
      fromId,
    );
    const { selectedOption } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      fromId,
    );

    const cards: CardId[] = [];
    if (Card.isVirtualCardId(judgeResult.judgeCardId)) {
      cards.push(...(card as VirtualCard).ActualCardIds);
    } else {
      cards.push(card.Id);
    }

    if (selectedOption === askForOptions.options[0]) {
      await room.moveCards({
        movingCards: cards.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        moveReason: CardMoveReason.ActiveMove,
        toArea: CardMoveArea.DrawStack,
        movedByReason: this.Name,
      });
    } else {
      const askForPlayer: ServerEventFinder<GameEventIdentifiers.AskForChoosingPlayerEvent> = {
        toId: fromId,
        players: room.AlivePlayers.map(p => p.Id),
        conversation: 'piaoling: select a player to obtain the judge card',
        requiredAmount: 1,
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingPlayerEvent>(askForPlayer),
        fromId,
      );
      const { selectedPlayers } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        fromId,
      );

      await room.moveCards({
        movingCards: cards.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        moveReason: CardMoveReason.ActiveMove,
        toArea: CardMoveArea.HandArea,
        toId: selectedPlayers![0],
        movedByReason: this.Name,
      });

      if (fromId === selectedPlayers![0]) {
        const resp = await room.askForCardDrop(
          fromId,
          1,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          undefined,
          this.Name,
        );

        resp.droppedCards.length > 0 &&
          (await room.dropCards(CardMoveReason.SelfDrop, resp.droppedCards, fromId, fromId, this.Name));
      }
    }
    return true;
  }
}
