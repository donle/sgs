import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'guixin', description: 'guixin_description' })
export class GuiXin extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  async onTrigger() {
    return true;
  }

  private async doGuiXin(room: Room, caocao: PlayerId) {
    for (const player of room.getOtherPlayers(caocao)) {
      const options: CardChoosingOptions = {};
      if (player.getCardIds(PlayerCardsArea.HandArea).length > 0) {
        options[PlayerCardsArea.HandArea] = player.getCardIds(PlayerCardsArea.HandArea).length;
      }
      if (player.getCardIds(PlayerCardsArea.EquipArea).length > 0) {
        options[PlayerCardsArea.EquipArea] = player.getCardIds(PlayerCardsArea.EquipArea);
      }
      if (player.getCardIds(PlayerCardsArea.JudgeArea).length > 0) {
        options[PlayerCardsArea.JudgeArea] = player.getCardIds(PlayerCardsArea.JudgeArea);
      }
      if (Object.keys(options).length === 0) {
        continue;
      }

      const chooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        options,
        fromId: caocao,
        toId: player.Id,
        triggeredBySkills: [this.Name],
      };
      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
        caocao,
      );

      const { selectedCard, selectedCardIndex, fromArea } = await room.onReceivingAsyncReponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        caocao,
      );
      const moveCard =
        selectedCard !== undefined ? selectedCard : player.getCardIds(PlayerCardsArea.HandArea)[selectedCardIndex!];
      await room.moveCards({
        movingCards: [{ card: moveCard, fromArea }],
        fromId: player.Id,
        toId: caocao,
        moveReason: CardMoveReason.ActivePrey,
        toArea: CardMoveArea.HandArea,
        proposer: caocao,
        movedByReason: this.Name,
      });
    }
    await room.turnOver(caocao);
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { damage, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    await this.doGuiXin(room, toId);

    let triggerTimes = damage - 1;
    while (triggerTimes-- > 0) {
      const continuouslyTrigger: ServerEventFinder<GameEventIdentifiers.AskForSkillUseEvent> = {
        invokeSkillNames: [this.Name],
        toId,
      };
      room.notify(GameEventIdentifiers.AskForSkillUseEvent, continuouslyTrigger, toId);

      const { invoke } = await room.onReceivingAsyncReponseFrom(GameEventIdentifiers.AskForSkillUseEvent, toId);
      if (!invoke) {
        break;
      }

      await this.doGuiXin(room, toId);
    }
    return true;
  }
}
