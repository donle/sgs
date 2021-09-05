import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xunxian', description: 'xunxian_description' })
export class XunXian extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>, stage?: AllStage): boolean {
    return stage === CardMoveStage.AfterCardMoved;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>): boolean {
    return (
      room.CurrentPlayer !== owner &&
      !owner.hasUsedSkill(this.Name) &&
      content.infos.find(
        info =>
          (info.moveReason === CardMoveReason.CardUse || info.moveReason === CardMoveReason.CardResponse) &&
          info.proposer === owner.Id &&
          info.toArea === CardMoveArea.DropStack &&
          info.movingCards.find(card => room.isCardInDropStack(card.card)) !== undefined,
      ) !== undefined &&
      room
        .getOtherPlayers(owner.Id)
        .find(
          player =>
            player.getCardIds(PlayerCardsArea.HandArea).length > owner.getCardIds(PlayerCardsArea.HandArea).length,
        ) !== undefined
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, targetId: PlayerId): boolean {
    return (
      room.getPlayerById(targetId).getCardIds(PlayerCardsArea.HandArea).length >
      room.getPlayerById(owner).getCardIds(PlayerCardsArea.HandArea).length
    );
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.MoveCardEvent>,
  ): PatchedTranslationObject {
    const cardIds: CardId[] = [];
    if (event.infos.length === 1) {
      cardIds.push(
        ...event.infos[0].movingCards.filter(card => room.isCardInDropStack(card.card)).map(card => card.card),
      );
    } else {
      const infos = event.infos.filter(
        info =>
          (info.moveReason === CardMoveReason.CardUse || info.moveReason === CardMoveReason.CardResponse) &&
          info.proposer === owner.Id &&
          info.toArea === CardMoveArea.DropStack &&
          info.movingCards.find(card => room.isCardInDropStack(card.card)) !== undefined,
      );

      for (const info of infos) {
        cardIds.push(...info.movingCards.filter(card => room.isCardInDropStack(card.card)).map(card => card.card));
      }
    }

    const promptCardIds = cardIds.length > 1 ? cardIds.slice(0, 2) : [cardIds[0]];
    return TranslationPack.translationJsonPatcher(
      cardIds.length > 1
        ? '{0}: do you want to give {1} to another player with the number of hand cards more than you?'
        : '{0}: do you want to give {1} cards to another player with the number of hand cards more than you?',
      this.Name,
      TranslationPack.patchCardInTranslation(...promptCardIds),
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

    const moveCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
    const cardIds: CardId[] = [];
    if (moveCardEvent.infos.length === 1) {
      cardIds.push(
        ...moveCardEvent.infos[0].movingCards.filter(card => room.isCardInDropStack(card.card)).map(card => card.card),
      );
    } else {
      const infos = moveCardEvent.infos.filter(
        info =>
          (info.moveReason === CardMoveReason.CardUse || info.moveReason === CardMoveReason.CardResponse) &&
          info.proposer === fromId &&
          info.toArea === CardMoveArea.DropStack &&
          info.movingCards.find(card => room.isCardInDropStack(card.card)) !== undefined,
      );

      for (const info of infos) {
        cardIds.push(...info.movingCards.filter(card => room.isCardInDropStack(card.card)).map(card => card.card));
      }
    }

    if (cardIds.length > 0) {
      await room.moveCards({
        movingCards: cardIds.map(card => ({ card, fromArea: CardMoveArea.DropStack })),
        toId: toIds[0],
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
