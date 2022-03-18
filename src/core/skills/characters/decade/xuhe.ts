import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, EventProcessSteps, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xuhe', description: 'xuhe_description' })
export class XuHe extends TriggerSkill {
  private readonly XuHeOptions = ['xuhe:draw', 'xuhe:discard'];

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      (content.toStage === PlayerPhaseStages.PlayCardStageStart ||
        (content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
          room.getOtherPlayers(owner.Id).find(player => player.MaxHp < owner.MaxHp) === undefined))
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const { fromId } = event;

    if (room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageStart) {
      const targets = room
        .getAlivePlayersFrom()
        .filter(player => room.distanceBetween(room.getPlayerById(fromId), player) <= 1);

      const options = this.XuHeOptions.slice();
      targets.find(target =>
        fromId === target.Id
          ? target.getPlayerCards().find(id => room.canDropCard(fromId, id))
          : target.getPlayerCards().length > 0,
      ) || options.shift();

      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose xuhe options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(...targets),
          ).extract(),
          toId: fromId,
          triggeredBySkills: [this.Name],
        },
        fromId,
      );

      if (response.selectedOption) {
        event.toIds = targets.map(player => player.Id);
        EventPacker.addMiddleware({ tag: this.Name, data: response.selectedOption }, event);
      } else {
        return false;
      }
    }

    return true;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): EventProcessSteps {
    return event.toIds ? [{ from: event.fromId, tos: event.toIds }] : [];
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;

    if (room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageStart && toIds) {
      await room.changeMaxHp(fromId, -1);

      for (const toId of toIds) {
        const chosen = EventPacker.getMiddleware<string>(this.Name, event);
        if (chosen === this.XuHeOptions[0]) {
          await room.drawCards(1, toId, 'top', fromId, this.Name);
        } else {
          const to = room.getPlayerById(toId);
          if (
            fromId === toId
              ? !to.getPlayerCards().find(id => room.canDropCard(fromId, id))
              : to.getPlayerCards().length === 0
          ) {
            continue;
          }

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

          const resp = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
          if (!resp) {
            continue;
          }

          await room.dropCards(
            fromId === toId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
            [resp.selectedCard!],
            toId,
            fromId,
            this.Name,
          );
        }
      }
    } else {
      await room.changeMaxHp(fromId, 1);
    }

    return true;
  }
}
