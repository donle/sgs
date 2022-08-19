import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';
import { PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'kongsheng', description: 'kongsheng_description' })
export class KongSheng extends TriggerSkill {
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
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put at least 1 card on your general card as ‘Kong’?',
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

    await room.moveCards({
      movingCards: cardIds.map(card => ({ card, fromArea: room.getPlayerById(fromId).cardFrom(card) })),
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
@PersistentSkill()
@CommonSkill({ name: KongSheng.Name, description: KongSheng.Description })
export class KongShengShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

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
      owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length > 0
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const from = room.getPlayerById(fromId);
    const kong = from.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);

    const useableEquips = kong.filter(
      card => Sanguosha.getCardById(card).is(CardType.Equip) && from.canUseCardTo(room, card, fromId),
    );
    while (useableEquips.length > 0) {
      const response = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
        GameEventIdentifiers.AskForCardEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForCardEvent>({
          cardAmount: 1,
          toId: fromId,
          reason: this.GeneralName,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please use a equip from ‘Kong’',
            this.GeneralName,
          ).extract(),
          fromArea: [PlayerCardsArea.OutsideArea],
          cardMatcher: new CardMatcher({
            cards: useableEquips,
          }).toSocketPassenger(),
          triggeredBySkills: [this.GeneralName],
        }),
        fromId,
      );

      response.selectedCards = response.selectedCards || [useableEquips[0]];

      await room.useCard({ fromId, cardId: response.selectedCards[0] });

      const index = useableEquips.findIndex(equip => equip === response.selectedCards[0]);
      useableEquips.splice(index, 1);
    }

    const leftCards = from.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName);
    if (leftCards.length > 0) {
      await room.moveCards({
        movingCards: leftCards.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: fromId,
        triggeredBySkills: [this.GeneralName],
      });
    }

    return true;
  }
}
