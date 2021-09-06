import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bingzheng', description: 'bingzheng_description' })
export class BingZheng extends TriggerSkill {
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
      content.toStage === PlayerPhaseStages.PlayCardStageEnd &&
      room.getAlivePlayersFrom().find(player => player.getCardIds(PlayerCardsArea.HandArea).length !== player.Hp) !==
        undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    const target = room.getPlayerById(targetId);
    return target.Hp !== target.getCardIds(PlayerCardsArea.HandArea).length;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to let him draw a card or drop a hand card?',
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
    const to = room.getPlayerById(toIds[0]);

    const options = ['bingzheng:draw'];
    to.getCardIds(PlayerCardsArea.HandArea).length > 0 && options.push('bingzheng:drop');
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        options,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please choose bingzheng options: {1}',
          this.Name,
          TranslationPack.patchPlayerInTranslation(to),
        ).extract(),
        toId: fromId,
        triggeredBySkills: [this.Name],
      },
      fromId,
      true,
    );

    response.selectedOption = response.selectedOption || options[0];

    if (response.selectedOption === options[0]) {
      await room.drawCards(1, toIds[0], 'top', fromId, this.Name);
    } else {
      const response = await room.askForCardDrop(
        toIds[0],
        1,
        [PlayerCardsArea.HandArea],
        true,
        undefined,
        this.Name,
        TranslationPack.translationJsonPatcher('{0}: please drop a hand card', this.Name).extract(),
      );

      response.droppedCards.length > 0 &&
        (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toIds[0], toIds[0], this.Name));
    }

    if (to.Hp === to.getCardIds(PlayerCardsArea.HandArea).length) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);

      if (fromId !== toIds[0] && room.getPlayerById(fromId).getPlayerCards().length > 0) {
        const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 1,
            toId: fromId,
            reason: this.Name,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: you can to give a card to {1}',
              this.Name,
              TranslationPack.patchPlayerInTranslation(to),
            ).extract(),
            fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
            triggeredBySkills: [this.Name],
          },
          fromId,
        );

        if (response.selectedCards && response.selectedCards.length > 0) {
          await room.moveCards({
            movingCards: [{ card: response.selectedCards[0], fromArea: to.cardFrom(response.selectedCards[0]) }],
            moveReason: CardMoveReason.ActiveMove,
            fromId,
            toId: toIds[0],
            toArea: CardMoveArea.HandArea,
            proposer: fromId,
            triggeredBySkills: [this.Name],
          });
        }
      }
    }

    return true;
  }
}
