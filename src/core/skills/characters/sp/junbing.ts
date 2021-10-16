import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'junbing', description: 'junbing_description' })
export class JunBing extends TriggerSkill {
  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return event !== undefined && event.playerId !== owner.Id;
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
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      room.getPlayerById(content.playerId).getCardIds(PlayerCardsArea.HandArea).length <= 1 &&
      !room.getPlayerById(content.playerId).Dead
    );
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const currentPlayer = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>)
      .playerId;
    if (currentPlayer !== event.fromId) {
      const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          toId: currentPlayer,
          options: ['yes', 'no'],
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: do you want to draw a card, and then give all your hand cards to {1} ?',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
          ).extract(),
        },
        currentPlayer,
        true,
      );

      if (selectedOption !== 'yes') {
        return false;
      }
    }

    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher('{0}: do you want to draw a card?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const currentPlayer = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>)
      .playerId;

    await room.drawCards(1, currentPlayer, 'top', currentPlayer, this.Name);

    const handCards = room.getPlayerById(currentPlayer).getCardIds(PlayerCardsArea.HandArea).slice();
    if (currentPlayer !== event.fromId && handCards.length > 0) {
      await room.moveCards({
        movingCards: handCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
        fromId: currentPlayer,
        toId: event.fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: currentPlayer,
        triggeredBySkills: [this.Name],
      });

      let toGive = room.getPlayerById(event.fromId).getPlayerCards();
      if (toGive.length > handCards.length) {
        const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: handCards.length,
            toId: event.fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} {2} card(s)',
              this.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(currentPlayer)),
              handCards.length,
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          event.fromId,
          true,
        );

        toGive =
          selectedCards.length === handCards.length ? selectedCards : Algorithm.randomPick(handCards.length, toGive);
      }

      toGive.length > 0 &&
        (await room.moveCards({
          movingCards: toGive.map(card => ({ card, fromArea: room.getPlayerById(event.fromId).cardFrom(card) })),
          fromId: event.fromId,
          toId: currentPlayer,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: event.fromId,
          triggeredBySkills: [this.Name],
        }));
    }

    return true;
  }
}
