import { CardChoosingOptions } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'youdi', description: 'youdi_description' })
export class YouDi extends TriggerSkill {
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
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return targetId !== owner;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose another player to let him drop a hand card from you?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    const options: CardChoosingOptions = {
      [PlayerCardsArea.HandArea]: from.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      {
        fromId: toIds[0],
        toId: fromId,
        options,
        triggeredBySkills: [this.Name],
      },
      toIds[0],
      true,
    );

    if (response.selectedCardIndex !== undefined) {
      const cardIds = from.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    } else if (response.selectedCard === undefined) {
      const cardIds = from.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    const isSlash = Sanguosha.getCardById(response.selectedCard).GeneralName === 'slash';
    const isBlack = Sanguosha.getCardById(response.selectedCard).isBlack();
    await room.dropCards(CardMoveReason.SelfDrop, [response.selectedCard], fromId, toIds[0], this.Name);

    const to = room.getPlayerById(toIds[0]);
    if (!isSlash && to.getPlayerCards().length > 0) {
      const newOptions: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
      };

      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        {
          fromId,
          toId: toIds[0],
          options: newOptions,
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      if (resp.selectedCardIndex !== undefined) {
        const ids = to.getCardIds(PlayerCardsArea.HandArea);
        resp.selectedCard = ids[Math.floor(Math.random() * ids.length)];
      } else if (resp.selectedCard === undefined) {
        const ids = to.getPlayerCards();
        resp.selectedCard = ids[Math.floor(Math.random() * ids.length)];
      }

      await room.moveCards({
        movingCards: [{ card: resp.selectedCard, fromArea: to.cardFrom(resp.selectedCard) }],
        fromId: toIds[0],
        toId: fromId,
        toArea: PlayerCardsArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    }

    isBlack || (await room.drawCards(1, fromId, 'top', fromId, this.Name));

    return true;
  }
}
