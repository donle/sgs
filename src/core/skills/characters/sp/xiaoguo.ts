import { CardType } from 'core/cards/card';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'xiaoguo', description: 'xiaoguo_description' })
export class XiaoGuo extends TriggerSkill {
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
      content.playerId !== owner.Id &&
      content.toStage === PlayerPhaseStages.FinishStageStart &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      !room.getPlayerById(content.playerId).Dead
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return Sanguosha.getCardById(cardId).is(CardType.Basic) && room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      'do you want to discard a basic card to use {0} to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.playerId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    if (room.getPlayerById(toId).getPlayerCards().length > 0) {
      const response = await room.askForCardDrop(
        toId,
        1,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        false,
        room
          .getPlayerById(toId)
          .getPlayerCards()
          .filter(id => !Sanguosha.getCardById(id).is(CardType.Equip)),
        this.Name,
        TranslationPack.translationJsonPatcher(
          '{0}: please discard a equip card, or you will take 1 damage from {1} ?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId)),
        ).extract(),
      );

      if (response.droppedCards.length > 0) {
        await room.dropCards(CardMoveReason.SelfDrop, response.droppedCards, toId, toId, this.Name);
        await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

        return true;
      }
    }

    await room.damage({
      fromId: event.fromId,
      toId,
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
