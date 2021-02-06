import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId, CardSuit } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, GameStartStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { System } from 'core/shares/libs/system';
import { GlobalFilterSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill, SideEffectSkill } from 'core/skills/skill_wrappers';

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

@ShadowSkill
@CommonSkill({ name: XianSiShadow.Name, description: XianSi.Description })
export class XianSiFilter extends GlobalFilterSkill {
  canUseCardTo(cardId: CardId | CardMatcher, room: Room, owner: Player, attacker: Player, target: Player) {
    if (!(cardId instanceof CardMatcher)) {
      if (
        VirtualCard.isVirtualCardId(cardId) &&
        Sanguosha.getCardById<VirtualCard>(cardId).GeneratedBySkill === XianSiSlash.Name
      ) {
        return target.hasSkill(XianSi.Name);
      }
    }

    return true;
  }
}

@SideEffectSkill
@CommonSkill({ name: XianSi.GeneralName, description: XianSi.Description })
export class XianSiSlash extends ViewAsSkill {
  canUse(room: Room, owner: Player, contentOrContainerCard?: ServerEventFinder<GameEventIdentifiers> | CardId) {
    if (
      room
        .getOtherPlayers(owner.Id)
        .find(player => player.getCardIds(PlayerCardsArea.OutsideArea, XianSi.Name).length >= 2) === undefined
    ) {
      return false;
    }

    if (typeof contentOrContainerCard === 'object') {
      const identifier = EventPacker.getIdentifier(contentOrContainerCard);
      if (identifier !== GameEventIdentifiers.AskForCardUseEvent) {
        return false;
      }

      const { toId, cardMatcher } = contentOrContainerCard as ServerEventFinder<
        GameEventIdentifiers.AskForCardUseEvent
      >;
      return (
        !!cardMatcher.generalName &&
        cardMatcher.generalName.includes('slash') &&
        room.getPlayerById(toId).hasSkill(XianSi.Name)
      );
    }

    return owner.canUseCard(room, new CardMatcher({ generalName: ['slash'] }));
  }

  canViewAs() {
    return ['slash'];
  }

  viewAs() {
    return VirtualCard.create({ cardName: 'slash', cardSuit: CardSuit.NoSuit, bySkill: XianSiSlash.Name });
  }

  isAvailableCard() {
    return false;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 0;
  }

  async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { toIds, fromId } = event;
    const to = room.getPlayerById(toIds![0]);
    const niCards = to.getCardIds(PlayerCardsArea.OutsideArea, XianSi.GeneralName);

    const askForChooseCardEvent: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardEvent> = {
      toId: fromId,
      cardIds: niCards,
      amount: 2,
    };

    room.notify(GameEventIdentifiers.AskForChoosingCardEvent, askForChooseCardEvent, fromId);

    const { selectedCards } = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardEvent,
      fromId,
    );

    if (selectedCards === undefined) {
      return false;
    }

    await room.moveCards({
      movingCards: selectedCards.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId: to.Id,
      moveReason: CardMoveReason.PlaceToDropStack,
      toArea: CardMoveArea.DropStack,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });
    return true;
  }
}
