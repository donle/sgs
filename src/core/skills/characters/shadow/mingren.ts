import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, GameBeginStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'mingren', description: 'mingren_description' })
export class MingRen extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>, stage?: AllStage): boolean {
    return stage === GameBeginStage.AfterGameBegan;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.GameBeginEvent>): boolean {
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    await room.drawCards(2, fromId, 'top', fromId, this.Name);

    const hands = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea);
    if (hands.length === 0) {
      return false;
    }
    const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
      GameEventIdentifiers.AskForCardEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
        cardAmount: 1,
        toId: fromId,
        reason: this.Name,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please put a hand card on your general card as ‘Ren’',
          this.Name,
        ).extract(),
        fromArea: [PlayerCardsArea.HandArea],
        triggeredBySkills: [this.Name],
      }),
      fromId,
    );

    response.selectedCards = response.selectedCards || hands[0];

    await room.moveCards({
      movingCards: [{ card: response.selectedCards[0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: MingRen.Name, description: MingRen.Description })
export class MingRenShadow extends TriggerSkill {
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
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to exchange a hand card with a ‘Ren’?',
      this.GeneralName,
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

    const ren = room.getPlayerById(fromId).getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: fromId,
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.GeneralName,
      isOutsideAreaInPublic: true,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });

    await room.moveCards({
      movingCards: [{ card: ren[0], fromArea: CardMoveArea.OutsideArea }],
      fromId,
      toId: fromId,
      toArea: PlayerCardsArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}
