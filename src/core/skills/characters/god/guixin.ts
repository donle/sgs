import { CardChoosingOptions } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
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

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const { damage, toId } = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    let triggerTimes = damage;
    while (triggerTimes-- > 0) {
      for (const player of room.getOtherPlayers(toId)) {
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
          fromId: toId,
          toId: player.Id,
          triggeredBySkills: [this.Name],
        };
        room.notify(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
          toId,
        );

        const { selectedCard, selectedCardIndex, fromArea } = await room.onReceivingAsyncReponseFrom(
          GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
          toId,
        );
        const moveCard =
          selectedCard !== undefined ? selectedCard : player.getCardIds(PlayerCardsArea.HandArea)[selectedCardIndex!];
        await room.moveCards(
          [moveCard],
          player.Id,
          toId,
          CardLostReason.PassiveMove,
          fromArea,
          PlayerCardsArea.HandArea,
          CardObtainedReason.ActivePrey,
          toId,
          this.Name,
        );
      }
      await room.turnOver(toId);
    }
    return true;
  }
}
