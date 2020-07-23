import { VirtualCard } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { WuXieKeJi } from 'core/cards/standard/wuxiekeji';
import {
  CardMoveReason,
  ClientEventFinder,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, TurnOverStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jiewei', description: 'jiewei_description' })
export class JieWei extends ViewAsSkill {
  public canViewAs(): string[] {
    return ['wuxiekeji'];
  }

  public canUse(room: Room, owner: Player): boolean {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['wuxiekeji'] })) &&
      owner.getCardIds(PlayerCardsArea.EquipArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.EquipArea];
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<WuXieKeJi>(
      {
        cardName: 'wuxiekeji',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: JieWei.GeneralName, description: JieWei.Description })
export class JieWeiShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>, stage: AllStage): boolean {
    return stage === TurnOverStage.TurnedOver;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerTurnOverEvent>,
  ): boolean {
    return owner.Id === event.toId && owner.isFaceUp();
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 2;
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
  ): boolean {
    const to = room.getPlayerById(target);
    const equiprCardIds = to.getCardIds(PlayerCardsArea.EquipArea);
    const judgeCardIds = to.getCardIds(PlayerCardsArea.JudgeArea);

    if (selectedTargets.length === 0) {
      return equiprCardIds.length + judgeCardIds.length > 0;
    } else if (selectedTargets.length === 1) {
      let canBeTarget: boolean = false;
      const from = room.getPlayerById(selectedTargets[0]);

      const fromEquipArea = from.getCardIds(PlayerCardsArea.EquipArea);
      canBeTarget = canBeTarget || fromEquipArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      const fromJudgeArea = from.getCardIds(PlayerCardsArea.JudgeArea);
      canBeTarget = canBeTarget || fromJudgeArea.find(id => room.canPlaceCardTo(id, target)) !== undefined;

      return canBeTarget;
    }

    return false;
  }

  public getAnimationSteps(event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { fromId, toIds } = event;
    return [
      { from: fromId, tos: [toIds![0]] },
      { from: toIds![0], tos: [toIds![1]] },
    ];
  }

  public nominateForwardTarget(targets: PlayerId[]) {
    return [targets[0]];
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.animation = this.getAnimationSteps(event);
    return true;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    await room.dropCards(
      CardMoveReason.SelfDrop,
      skillUseEvent.cardIds!,
      skillUseEvent.fromId,
      skillUseEvent.fromId,
      this.Name,
    );
    const moveFrom = room.getPlayerById(skillUseEvent.toIds![0]);
    const moveTo = room.getPlayerById(skillUseEvent.toIds![1]);
    const canMovedEquipCardIds: CardId[] = [];
    const canMovedJudgeCardIds: CardId[] = [];

    const fromEquipArea = moveFrom.getCardIds(PlayerCardsArea.EquipArea);
    canMovedEquipCardIds.push(...fromEquipArea.filter(id => room.canPlaceCardTo(id, moveTo.Id)));

    const fromJudgeArea = moveFrom.getCardIds(PlayerCardsArea.JudgeArea);
    canMovedJudgeCardIds.push(...fromJudgeArea.filter(id => room.canPlaceCardTo(id, moveTo.Id)));

    const options: CardChoosingOptions = {
      [PlayerCardsArea.JudgeArea]: canMovedJudgeCardIds,
      [PlayerCardsArea.EquipArea]: canMovedEquipCardIds,
    };

    const chooseCardEvent = {
      fromId: skillUseEvent.fromId,
      toId: skillUseEvent.fromId,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      skillUseEvent.fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      skillUseEvent.fromId,
    );

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      moveReason: CardMoveReason.PassiveMove,
      toId: moveTo.Id,
      fromId: moveFrom.Id,
      toArea: response.fromArea!,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.Name,
    });

    return true;
  }
}
