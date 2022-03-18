import { CardType } from 'core/cards/card';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'yinbing', description: 'yinbing_description' })
export class YinBing extends TriggerSkill {
  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return event !== undefined && EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.toStage === PlayerPhaseStages.FinishStageStart &&
        phaseStageChangeEvent.playerId === owner.Id &&
        owner.getPlayerCards().length > 0
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.toId === owner.Id &&
        damageEvent.cardIds !== undefined &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length > 0 &&
        (Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'slash' ||
          Sanguosha.getCardById(damageEvent.cardIds[0]).GeneralName === 'duel')
      );
    }

    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return !Sanguosha.getCardById(cardId).is(CardType.Basic);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put at least 1 un-basic cards on your general card as ‘Yin Bing’?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);

    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      if (!event.cardIds) {
        return false;
      }

      await room.moveCards({
        movingCards: event.cardIds.map(card => ({ card, fromArea: room.getPlayerById(event.fromId).cardFrom(card) })),
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.OutsideArea,
        isOutsideAreaInPublic: true,
        toOutsideArea: this.Name,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    } else {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.OutsideArea]: room
          .getPlayerById(event.fromId)
          .getCardIds(PlayerCardsArea.OutsideArea, this.Name),
      };

      const chooseCardEvent = {
        fromId: event.fromId,
        toId: event.fromId,
        options,
        triggeredBySkills: [this.Name],
      };

      const response = await room.askForChoosingPlayerCard(chooseCardEvent, event.fromId, true, true);
      if (!response) {
        return false;
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard!, fromArea: CardMoveArea.OutsideArea }],
        fromId: event.fromId,
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });
    }

    return true;
  }
}
