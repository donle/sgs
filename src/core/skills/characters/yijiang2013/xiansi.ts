import { Card, VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  CardResponseStage,
  CardUseStage,
  GameStartStage,
  PhaseStageChangeStage,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { TargetGroupUtil } from 'core/shares/libs/utils/target_group';
import { TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill, SideEffectSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'xiansi', description: 'xiansi_description' })
export class XianSi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return content.playerId === owner.Id;
  }

  targetFilter(room: Room, owner: Player, targets: PlayerId[]) {
    return targets.length >= 1 && targets.length <= 2;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return owner !== target && room.getPlayerById(target).getCardIds().length > 0;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, fromId } = event;

    for (const toId of toIds!) {
      const options: CardChoosingOptions = {
        [PlayerCardsArea.EquipArea]: room.getPlayerById(toId).getCardIds(PlayerCardsArea.EquipArea),
        [PlayerCardsArea.HandArea]: room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea).length,
      };

      const askForChoosingCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        fromId,
        toId,
        options,
        triggeredBySkills: [this.Name],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChoosingCardEvent,
        ),
        fromId,
      );

      const response = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        event.fromId!,
      );

      if (response.selectedCard === undefined) {
        const cardIds = room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea);
        response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
      }

      await room.moveCards({
        movingCards: [{ card: response.selectedCard, fromArea: response.fromArea }],
        fromId: toId,
        moveReason: CardMoveReason.ActivePrey,
        toId: fromId,
        toArea: PlayerCardsArea.OutsideArea,
        isOutsideAreaInPublic: true,
        toOutsideArea: this.Name,
      });
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XianSi.Name, description: XianSi.Description })
export class XianSiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  isAutoTrigger() {
    return true;
  }

  isFlaggedSkill() {
    return true;
  }

  async whenLosingSkill(room: Room) {
    room.uninstallSideEffectSkill(System.SideEffectSkillApplierEnum.XianSi);
  }

  async whenObtainingSkill(room: Room, owner: Player) {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.XianSi, XianSiShadow.Name, owner.Id);
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.GameStartEvent>, stage?: AllStage) {
    return stage === GameStartStage.BeforeGameStart;
  }

  canUse() {
    return true;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    room.installSideEffectSkill(System.SideEffectSkillApplierEnum.XianSi, XianSiSlash.Name, event.fromId);
    return true;
  }
}

@SideEffectSkill
@CommonSkill({ name: XianSi.GeneralName, description: XianSi.Description })
export class XianSiSlash extends ViewAsSkill {
  canUse(room: Room, owner: Player, contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId) {
    // Now SideEffectSkill Don't Support Multiple Same Skill
    // See in room.ts
    const target = room
      .getOtherPlayers(owner.Id)
      .find(player => player.getCardIds(PlayerCardsArea.OutsideArea, XianSi.Name).length >= 2);

    if (target === undefined) {
      return false;
    }

    if (typeof contentOrContainerCard === 'object') {
      const identifier = EventPacker.getIdentifier(contentOrContainerCard);
      switch (identifier) {
        case GameEventIdentifiers.AskForPlayCardsOrSkillsEvent:
          return owner.canUseCardTo(room, new CardMatcher({ generalName: ['slash'] }), target.Id);
        case GameEventIdentifiers.AskForCardResponseEvent:
        case GameEventIdentifiers.AskForCardUseEvent:
          const content = contentOrContainerCard as ServerEventFinder<
            GameEventIdentifiers.AskForCardResponseEvent | GameEventIdentifiers.AskForCardUseEvent
          >;
          return (
            content.toId === target.Id &&
            CardMatcher.match(content.cardMatcher, new CardMatcher({ generalName: ['slash'] }))
          );
      }
    }

    return owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }));
  }

  canViewAs() {
    return ['slash'];
  }

  viewAs() {
    return VirtualCard.create({ cardName: 'slash', cardSuit: CardSuit.NoSuit, bySkill: XianSi.Name });
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XianSiSlash.Name, description: XianSiSlash.Description })
export class XianSiSlashShadow extends TriggerSkill {
  isAutoTrigger() {
    return true;
  }

  get Muted() {
    return true;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
    stage?: AllStage,
  ) {
    return (
      (stage === CardUseStage.PreCardUse || stage === CardResponseStage.PreCardResponse) &&
      Card.isVirtualCardId(event.cardId)
    );
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.CardResponseEvent>,
  ) {
    return Sanguosha.getCardById<VirtualCard>(content.cardId).findByGeneratedSkill(XianSi.Name);
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const actualEvent = event.triggeredOnEvent;
    let fromId: PlayerId;
    let toId: PlayerId;
    if (EventPacker.getIdentifier(actualEvent!) === GameEventIdentifiers.CardUseEvent) {
      fromId = (actualEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
      toId = TargetGroupUtil.getRealTargets(
        (actualEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup,
      )[0];
    } else if (EventPacker.getIdentifier(actualEvent!) === GameEventIdentifiers.CardResponseEvent) {
      fromId = (actualEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).fromId;
      toId = TargetGroupUtil.getRealTargets(
        (actualEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>).targetGroup,
      )[0];
    } else {
      throw new Error('xiansi drop cards for slash failed');
    }

    const niCards = room.getPlayerById(toId).getCardIds(PlayerCardsArea.OutsideArea, XianSi.GeneralName);

    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: fromId,
      cardIds: niCards,
      amount: 2,
      triggeredBySkills: [this.GeneralName],
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForChooseCardEvent, fromId);

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      fromId,
    );

    const actualCards = selectedCards ? selectedCards : niCards.slice(0, 2);

    await room.moveCards({
      movingCards: actualCards.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
      fromId: toId,
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });
    return true;
  }
}
