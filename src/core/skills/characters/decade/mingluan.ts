import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mingluan', description: 'mingluan_description' })
export class MingLuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
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
      owner.getPlayerCards().length > 0 &&
      room.Analytics.getRecordEvents<GameEventIdentifiers.RecoverEvent>(
        event => EventPacker.getIdentifier(event) === GameEventIdentifiers.RecoverEvent,
        undefined,
        'round',
        undefined,
        1,
      ).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: string, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(room: Room): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard a card to use this skill?',
      this.Name,
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

    const current = room.CurrentPlayer;
    if (current && !current.Dead) {
      const drawNum =
        Math.min(current.getCardIds(PlayerCardsArea.HandArea).length, 5) -
        room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea).length;
        
      drawNum > 0 && (await room.drawCards(drawNum, event.fromId, 'top', event.fromId, this.Name));
    }

    return true;
  }
}
