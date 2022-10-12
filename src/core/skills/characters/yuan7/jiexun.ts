import { FuNan, FuNanEX } from './funan';
import { CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jiexun', description: 'jiexun_description' })
export class JieXun extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target to use this skill(draw {1} card(s), discard {2} card(s))?',
      this.Name,
      room.AlivePlayers.reduce<number>(
        (sum, player) =>
          sum +
          [...player.getCardIds(PlayerCardsArea.EquipArea), ...player.getCardIds(PlayerCardsArea.JudgeArea)].filter(
            cardId => Sanguosha.getCardById(cardId).Suit === CardSuit.Diamond,
          ).length,
        0,
      ),
      owner.hasUsedSkillTimes(this.Name),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }
    const toId = event.toIds[0];

    const drawNum = room.AlivePlayers.reduce<number>(
      (sum, player) =>
        sum +
        [...player.getCardIds(PlayerCardsArea.EquipArea), ...player.getCardIds(PlayerCardsArea.JudgeArea)].filter(
          cardId => Sanguosha.getCardById(cardId).Suit === CardSuit.Diamond,
        ).length,
      0,
    );
    drawNum > 0 && (await room.drawCards(drawNum, toId, 'top', event.fromId, this.Name));

    const discardableCardIds = room
      .getPlayerById(toId)
      .getPlayerCards()
      .filter(cardId => room.canDropCard(toId, cardId));
    const discardNum = room.getPlayerById(event.fromId).hasUsedSkillTimes(this.Name) - 1;
    if (discardNum > 0) {
      if (discardableCardIds.length <= discardNum) {
        const canUpdate = discardableCardIds.length === room.getPlayerById(toId).getPlayerCards().length;
        await room.moveCards({
          movingCards: discardableCardIds.map(card => ({ card, fromArea: room.getPlayerById(toId).cardFrom(card) })),
          fromId: toId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.SelfDrop,
          proposer: toId,
          triggeredBySkills: [this.Name],
        });

        if (canUpdate) {
          await room.loseSkill(event.fromId, this.Name);
          await room.updateSkill(event.fromId, FuNan.Name, FuNanEX.Name);
        }
      } else {
        const response = await room.askForCardDrop(
          toId,
          discardNum,
          [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
          true,
          undefined,
          this.Name,
        );
        response.droppedCards.length > 0 &&
          (await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId, toId, this.Name));
      }
    }

    return true;
  }
}
