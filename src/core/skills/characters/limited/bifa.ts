import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'bifa', description: 'bifa_description' })
export class BiFa extends TriggerSkill {
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
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, pendingCardId: CardId) {
    return true;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return (
      target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.OutsideArea, this.Name).length === 0
    );
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, player: Player): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put a hand card on another player’s general card?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds, cardIds } = event;
    if (!toIds || !cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: cardIds[0], fromArea: CardMoveArea.HandArea }],
      fromId,
      toId: toIds[0],
      toArea: PlayerCardsArea.OutsideArea,
      moveReason: CardMoveReason.ActiveMove,
      toOutsideArea: this.Name,
      isOutsideAreaInPublic: false,
      proposer: fromId,
      movedByReason: this.Name,
    });

    room.getPlayerById(toIds[0]).setFlag<PlayerId>(this.Name, fromId);
    room.getPlayerById(toIds[0]).hasShadowSkill(BiFaEffect.Name) || (await room.obtainSkill(toIds[0], BiFaEffect.Name));

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_bifa_effect', description: 's_bifa_effect_description' })
export class BiFaEffect extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return (
      content.toPlayer === owner &&
      content.to === PlayerPhase.PhaseBegin &&
      stage === PhaseChangeStage.AfterPhaseChanged
    );
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return owner.Id === event.toPlayer && event.to === PlayerPhase.PhaseBegin;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const bifa = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, BiFa.Name);
    if (bifa.length > 0) {
      const bifaUser = room.getFlag<PlayerId>(event.fromId, BiFa.Name);
      let selectedCard: CardId | undefined;
      if (bifaUser && !room.getPlayerById(bifaUser).Dead) {
        const observeCardsEvent: ServerEventFinder<GameEventIdentifiers.ObserveCardsEvent> = {
          cardIds: bifa,
          selected: [],
        };
        room.notify(GameEventIdentifiers.ObserveCardsEvent, observeCardsEvent, event.fromId);

        const { selectedCards } = await room.doAskForCommonly<GameEventIdentifiers.AskForCardEvent>(
          GameEventIdentifiers.AskForCardEvent,
          {
            cardAmount: 1,
            toId: event.fromId,
            reason: this.GeneralName,
            conversation: TranslationPack.translationJsonPatcher(
              '{0}: please give {1} a same type card, or you will lose 1 hp',
              BiFa.Name,
              TranslationPack.patchPlayerInTranslation(room.getPlayerById(bifaUser)),
            ).extract(),
            cardMatcher: new CardMatcher({ type: [Sanguosha.getCardById(bifa[0]).BaseType] }).toSocketPassenger(),
            fromArea: [PlayerCardsArea.HandArea],
            triggeredBySkills: [BiFa.Name],
          },
          event.fromId,
        );

        room.notify(GameEventIdentifiers.ObserveCardFinishEvent, {}, event.fromId);

        selectedCard = selectedCards[0];
      }

      if (selectedCard) {
        await room.moveCards({
          movingCards: [{ card: selectedCard, fromArea: CardMoveArea.HandArea }],
          fromId: event.fromId,
          toId: bifaUser,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActiveMove,
          proposer: event.fromId,
          triggeredBySkills: [BiFa.Name],
        });

        await room.moveCards({
          movingCards: [{ card: bifa[0], fromArea: CardMoveArea.OutsideArea }],
          fromId: event.fromId,
          toId: event.fromId,
          toArea: CardMoveArea.HandArea,
          moveReason: CardMoveReason.ActivePrey,
          proposer: event.fromId,
          triggeredBySkills: [BiFa.Name],
        });
      } else {
        await room.moveCards({
          movingCards: [{ card: bifa[0], fromArea: CardMoveArea.OutsideArea }],
          fromId: event.fromId,
          toArea: CardMoveArea.DropStack,
          moveReason: CardMoveReason.PlaceToDropStack,
          proposer: event.fromId,
          triggeredBySkills: [BiFa.Name],
        });

        await room.loseHp(event.fromId, 1);
      }
    }

    await room.loseSkill(event.fromId, this.Name);

    return true;
  }
}
