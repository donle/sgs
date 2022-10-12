import { XianFu } from './xianfu';
import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'chouce', description: 'chouce_description' })
export class ChouCe extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return content.toId === owner.Id;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = event;

    const judgeEvent = await room.judge(fromId, undefined, this.Name);
    if (Sanguosha.getCardById(judgeEvent.judgeCardId).isBlack()) {
      const players = room
        .getAlivePlayersFrom()
        .filter(player =>
          player.Id === fromId
            ? player.getCardIds().find(id => room.canDropCard(fromId, id))
            : player.getCardIds().length > 0,
        )
        .map(player => player.Id);

      if (players.length === 0) {
        return false;
      }
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: 'chouce: please choose a target to discard a card from his area',
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

      const to = room.getPlayerById(response.selectedPlayers[0]);
      const options: CardChoosingOptions = {
        [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const chooseCardEvent = {
        fromId,
        toId: response.selectedPlayers[0],
        options,
        triggeredBySkills: [this.Name],
      };
      const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
      if (!resp) {
        return false;
      }

      await room.dropCards(
        response.selectedPlayers[0] === fromId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
        [resp.selectedCard!],
        response.selectedPlayers[0],
        fromId,
        this.Name,
      );
    } else if (Sanguosha.getCardById(judgeEvent.judgeCardId).isRed()) {
      const players = room.getAlivePlayersFrom().map(player => player.Id);

      const xianfuPlayer = room.getFlag<PlayerId>(fromId, XianFu.Name);
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
        GameEventIdentifiers.AskForChoosingPlayerEvent,
        {
          players,
          toId: event.fromId,
          requiredAmount: 1,
          conversation: xianfuPlayer
            ? TranslationPack.translationJsonPatcher(
                '{0}: please choose a target to draw a card (If the target is {1}, draw 2 cards instead)',
                this.Name,
                TranslationPack.patchPlayerInTranslation(room.getPlayerById(xianfuPlayer)),
              ).extract()
            : TranslationPack.translationJsonPatcher('{0}: please choose a target to draw a card', this.Name).extract(),
          triggeredBySkills: [this.Name],
        },
        event.fromId,
        true,
      );

      response.selectedPlayers = response.selectedPlayers || [event.fromId];

      if (response.selectedPlayers[0] === xianfuPlayer && !room.getFlag<boolean>(xianfuPlayer, XianFu.XianFuPlayer)) {
        room.setFlag<boolean>(xianfuPlayer, XianFu.XianFuPlayer, true, XianFu.Name);
      }

      await room.drawCards(
        response.selectedPlayers[0] === xianfuPlayer ? 2 : 1,
        response.selectedPlayers[0],
        'top',
        fromId,
        this.Name,
      );
    }

    return true;
  }
}
