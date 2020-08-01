import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'cuike', description: 'cuike_description' })
export class CuiKe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.toStage === PlayerPhaseStages.PlayCardStageStart && content.playerId === owner.Id;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length === 1;
  }

  public isAvailableTarget(ownerId: PlayerId, room: Room, targetId: PlayerId) {
    const target = room.getPlayerById(targetId);
    if (room.getMark(ownerId, MarkEnum.JunLve) % 2 === 0) {
      return !target.ChainLocked || target.getPlayerCards().length > 0;
    } else {
      return true;
    }
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    const to = room.getPlayerById(toIds![0]);
    if (room.getMark(fromId, MarkEnum.JunLve) % 2 === 0) {
      if (!to.ChainLocked) {
        await room.chainedOn(toIds![0]);
      }
      if (to.getPlayerCards().length > 0) {
        const options = {
          [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        };
        if (toIds![0] === fromId) {
          options[PlayerCardsArea.HandArea] = to.getCardIds(PlayerCardsArea.HandArea);
        } else {
          options[PlayerCardsArea.HandArea] = to.getCardIds(PlayerCardsArea.HandArea).length;
        }

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
          chooseCardEvent.fromId,
          this.Name,
        );
      }
    } else {
      await room.damage({
        fromId,
        damage: 1,
        damageType: DamageType.Normal,
        toId: toIds![0],
        triggeredBySkills: [this.Name],
      });
    }

    const numOfName = room.getMark(fromId, MarkEnum.JunLve);
    if (numOfName > 7) {
      const askForInvokeSkill: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
        toId: fromId,
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          'cuike: do you wanna to throw {0} marks to do special skill',
          numOfName,
        ).extract(),
      };

      room.notify(GameEventIdentifiers.AskForChoosingOptionsEvent, askForInvokeSkill, fromId);
      const { selectedOption } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        fromId,
      );

      if (selectedOption === 'yes') {
        room.addMark(fromId, MarkEnum.JunLve, -numOfName);
        for (const player of room.getOtherPlayers(fromId)) {
          await room.damage({
            fromId,
            toId: player.Id,
            damage: 1,
            damageType: DamageType.Normal,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    return true;
  }
}
