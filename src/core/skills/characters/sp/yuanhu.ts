import { CardType } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yuanhu', description: 'yuanhu_description' })
export class YuanHu extends TriggerSkill {
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
      owner.getPlayerCards().length > 0
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId, selectedCards: CardId[]): boolean {
    return selectedCards.length === 1 && room.canPlaceCardTo(selectedCards[0], target);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return Sanguosha.getCardById(cardId).is(CardType.Equip);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put a equip card into a player’s equip area?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds || !event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) }],
      fromId: event.fromId,
      toId: toIds[0],
      toArea: CardMoveArea.EquipArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    const card = Sanguosha.getCardById(event.cardIds[0]);
    if (card.is(CardType.Weapon)) {
      const targets = room
        .getOtherPlayers(toIds[0])
        .filter(
          player => room.distanceBetween(room.getPlayerById(toIds[0]), player) === 1 && player.getCardIds().length > 0,
        );

      if (targets.length > 0) {
        const players = targets.map(player => player.Id);
        const resp = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingPlayerEvent>(
          GameEventIdentifiers.AskForChoosingPlayerEvent,
          {
            players,
            toId: fromId,
            requiredAmount: 1,
            conversation: 'yuanhu: please choose a target to discard a card from his area',
            triggeredBySkills: [this.Name],
          },
          fromId,
          true,
        );

        resp.selectedPlayers = resp.selectedPlayers || [players[Math.floor(Math.random() * players.length)]];

        const to = room.getPlayerById(resp.selectedPlayers[0]);
        const options: CardChoosingOptions = {
          [PlayerCardsArea.JudgeArea]: to.getCardIds(PlayerCardsArea.JudgeArea),
          [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
          [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
        };

        const chooseCardEvent = {
          fromId,
          toId: resp.selectedPlayers[0],
          options,
          triggeredBySkills: [this.Name],
        };

        const response = await room.askForChoosingPlayerCard(chooseCardEvent, fromId, true, true);
        if (!response) {
          return false;
        }

        await room.dropCards(
          resp.selectedPlayers[0] === fromId ? CardMoveReason.SelfDrop : CardMoveReason.PassiveDrop,
          [response.selectedCard!],
          resp.selectedPlayers[0],
          fromId,
          this.Name,
        );
      }
    } else if (card.is(CardType.Shield)) {
      await room.drawCards(1, toIds[0], 'top', fromId, this.Name);
    } else if (card.is(CardType.DefenseRide) || card.is(CardType.OffenseRide)) {
      await room.recover({
        toId: toIds[0],
        recoveredHp: 1,
        recoverBy: fromId,
      });
    }

    return true;
  }
}
