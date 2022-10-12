import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';
import { TunChu } from './tunchu';

@CommonSkill({ name: 'shuliang', description: 'shuliang_description' })
export class ShuLiang extends TriggerSkill {
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
      owner.getCardIds(PlayerCardsArea.OutsideArea, TunChu.Name).length > 0 &&
      room.getPlayerById(content.playerId).getCardIds(PlayerCardsArea.HandArea).length <
        room.getPlayerById(content.playerId).Hp
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).getCardIds(PlayerCardsArea.OutsideArea, TunChu.Name).includes(cardId);
  }

  public availableCardAreas() {
    return [PlayerCardsArea.OutsideArea];
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to remove a ‘liang’ to let {1} draws 2 cards?',
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

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: CardMoveArea.OutsideArea }],
      fromId: event.fromId,
      toArea: CardMoveArea.DropStack,
      moveReason: CardMoveReason.PlaceToDropStack,
      proposer: event.fromId,
      triggeredBySkills: [this.Name],
    });

    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
    await room.drawCards(2, toId, 'top', event.fromId, this.Name);

    return true;
  }
}
