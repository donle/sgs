import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'jiqiao', description: 'jiqiao_description' })
export class JiQiao extends TriggerSkill {
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
    return owner.Id === content.playerId && owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return Sanguosha.getCardById(cardId).is(CardType.Equip) && room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard at least 1 equip card, then display the double cards and gain all unequip cards from these cards?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, cardIds } = event;
    if (!cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);
    const topCards = room.getCards(cardIds.length * 2, 'top');

    const cardDisplayEvent: ServerEventFinder<GameEventIdentifiers.CardDisplayEvent> = {
      displayCards: topCards,
      fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} used skill {1}, display cards: {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(fromId)),
        this.Name,
        TranslationPack.patchCardInTranslation(...topCards),
      ).extract(),
    };
    room.broadcast(GameEventIdentifiers.CardDisplayEvent, cardDisplayEvent);

    const unequips = topCards.filter(id => !Sanguosha.getCardById(id).is(CardType.Equip));
    unequips.length > 0 &&
      (await room.moveCards({
        movingCards: unequips.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      }));

    const leftCards = topCards.filter(id => !unequips.includes(id) && room.isCardOnProcessing(id));
    leftCards.length > 0 &&
      (await room.moveCards({
        movingCards: leftCards.map(card => ({ card, fromArea: CardMoveArea.ProcessingArea })),
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
