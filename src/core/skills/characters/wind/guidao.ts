import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, JudgeEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'guidao', description: 'guidao_description' })
export class GuiDao extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.JudgeEvent>, stage?: AllStage) {
    return stage === JudgeEffectStage.BeforeJudgeEffect;
  }

  canUse(room: Room, owner: Player) {
    return owner.getPlayerCards().length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }
  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return Sanguosha.getCardById(cardId).isBlack();
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent, cardIds } = skillUseEvent;
    const judgeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.JudgeEvent>;

    await room.responseCard({
      cardId: cardIds![0],
      fromId: skillUseEvent.fromId,
      translationsMessage: TranslationPack.translationJsonPatcher(
        '{0} responsed card {1} to replace judge card {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(skillUseEvent.fromId)),
        TranslationPack.patchCardInTranslation(cardIds![0]),
        TranslationPack.patchCardInTranslation(judgeEvent.judgeCardId),
      ).extract(),
      skipDrop: true,
      mute: true,
    });
    await room.moveCards({
      moveReason: CardMoveReason.ActiveMove,
      movingCards: [{ card: judgeEvent.judgeCardId, fromArea: CardMoveArea.ProcessingArea }],
      toId: skillUseEvent.fromId,
      toArea: PlayerCardsArea.HandArea,
      proposer: skillUseEvent.fromId,
      movedByReason: this.Name,
    });

    judgeEvent.judgeCardId = cardIds![0];
    room.addProcessingCards(judgeEvent.judgeCardId.toString(), cardIds![0]);

    const guidaoCard = Sanguosha.getCardById(judgeEvent.judgeCardId);
    if (guidaoCard.Suit === CardSuit.Spade && guidaoCard.CardNumber >= 2 && guidaoCard.CardNumber <= 9) {
      await room.drawCards(1, skillUseEvent.fromId, 'top', undefined, this.Name);
    }

    return true;
  }
}
