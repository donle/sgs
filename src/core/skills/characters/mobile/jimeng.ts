import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Algorithm } from 'core/shares/libs/algorithm';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jimeng', description: 'jimeng_description' })
export class JiMeng extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PlayCardStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      owner.Id === content.playerId &&
      room.getOtherPlayers(owner.Id).find(player => player.getPlayerCards().length > 0) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getPlayerById(target).getPlayerCards().length > 0;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      'jimeng {0}: do you want to prey a card from another player?',
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
    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId,
      toId: toIds[0],
      options,
      triggeredBySkills: [this.Name],
    };

    const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, false, true);
    if (!response) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      fromId: toIds[0],
      toId: fromId,
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActivePrey,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    const hp = room.getPlayerById(fromId).Hp;
    if (hp < 1 || room.getPlayerById(toIds[0]).Dead) {
      return false;
    }

    let selectedCards: CardId[] = room.getPlayerById(fromId).getPlayerCards();
    if (selectedCards.length > hp) {
      const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        {
          cardAmount: hp,
          toId: fromId,
          reason: this.Name,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please give {1} {2} card(s)',
            this.Name,
            TranslationPack.patchPlayerInTranslation(room.getPlayerById(toIds[0])),
            hp,
          ).extract(),
          fromArea: [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          triggeredBySkills: [this.Name],
        },
        fromId,
        true,
      );

      selectedCards = resp.selectedCards.length > 0 ? resp.selectedCards : Algorithm.randomPick(hp, selectedCards);
    }

    selectedCards.length > 0 &&
      (await room.moveCards({
        movingCards: selectedCards.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
        fromId,
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
