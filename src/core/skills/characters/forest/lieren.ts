import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { MoveCardEventInfos } from 'core/event/event.server';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'lieren', description: 'lieren_description' })
export class LieRen extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAim;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return (
      owner.Id === content.fromId &&
      room.getPlayerById(content.fromId).getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      content.byCardId !== undefined &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' &&
      owner.Id !== content.toId &&
      room.getPlayerById(content.toId).getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      room.canPindian(owner.Id, content.toId)
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, triggeredOnEvent } = event;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const { toId } = aimEvent;
    const toIds: PlayerId[] = [toId];

    const { pindianCardId, pindianRecord } = await room.pindian(fromId, toIds, this.Name);
    if (!pindianRecord.length) {
      return false;
    }

    if (pindianRecord[0].winner === fromId) {
      const to = room.getPlayerById(toId);
      if (to.getPlayerCards().length > 0) {
        const options: CardChoosingOptions = {
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
          fromId,
          toId,
          options,
          triggeredBySkills: [this.Name],
        };

        const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);

        if (!response) {
          return false;
        }

        await room.moveCards({
          movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
          fromId: chooseCardEvent.toId,
          toId: chooseCardEvent.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: chooseCardEvent.fromId,
          movedByReason: this.Name,
        });
      }
    } else {
      const playerIds: PlayerId[] = [fromId, toId];
      room.sortPlayersByPosition(playerIds);

      const moveInfos: MoveCardEventInfos[] = [];
      for (const playerId of playerIds) {
        const cardId = fromId === playerId ? pindianCardId : pindianRecord[0].cardId;
        if (cardId && room.isCardInDropStack(cardId)) {
          moveInfos.push({
            movingCards: [{ card: cardId, fromArea: CardMoveArea.DropStack }],
            toId: playerIds.filter(id => id !== playerId)[0],
            toArea: CardMoveArea.HandArea,
            moveReason: CardMoveReason.ActivePrey,
            proposer: playerId,
            movedByReason: this.Name,
          });
        }
      }

      await room.moveCards(...moveInfos);
    }

    return true;
  }
}
