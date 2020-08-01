import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase, StagePriority } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { Functional } from 'core/shares/libs/functional';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'qiaobian', description: 'qiaobian_description' })
export class QiaoBian extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return (
      stage === PhaseChangeStage.AfterPhaseChanged &&
      [
        PlayerPhase.JudgeStage,
        PlayerPhase.DrawCardStage,
        PlayerPhase.PlayCardStage,
        PlayerPhase.DropCardStage,
      ].includes(event.to)
    );
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    if (content.toPlayer !== owner.Id) {
      return false;
    }

    return owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
  ): PatchedTranslationObject | string {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to drop a hand card to skip {1} ?',
      this.Name,
      Functional.getPlayerPhaseRawText(event.to),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { triggeredOnEvent, fromId, cardIds } = skillUseEvent;
    const phaseChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    if (!cardIds || cardIds.length < 1) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, cardIds, fromId, fromId, this.Name);

    const from = room.getPlayerById(fromId);
    from.setFlag(this.Name, true);
    await room.skip(fromId, phaseChangeEvent.to);
    from.removeFlag(this.Name);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiaoBian.Name, description: QiaoBian.Description })
export class QiaoBianSkipDraw extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseSkippedEvent>): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseSkippedEvent &&
      event.skippedPhase === PlayerPhase.DrawCardStage
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseSkippedEvent>,
  ): boolean {
    return owner.Id === content.playerId && owner.getFlag<boolean>(this.GeneralName) === true;
  }

  public get Priority() {
    return StagePriority.Low;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length >= 1 && targets.length <= 2;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    const to = room.getPlayerById(target);
    return target !== owner && to.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject | string {
    return TranslationPack.translationJsonPatcher(
      '{0}: please choose one or two targets to obtain a hand card from each of them',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillUseEvent;

    for (const toId of toIds!) {
      const cardIds = room.getPlayerById(toId).getCardIds(PlayerCardsArea.HandArea);
      const askForChoosingCard: ServerEventFinder<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent> = {
        fromId,
        toId,
        options: {
          [PlayerCardsArea.HandArea]: cardIds.length,
        },
        triggeredBySkills: [this.GeneralName],
      };

      room.notify(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(
          askForChoosingCard,
        ),
        fromId,
      );
      let { selectedCard } = await room.onReceivingAsyncResponseFrom(
        GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
        fromId,
      );
      selectedCard = selectedCard !== undefined ? selectedCard : cardIds[Math.floor(Math.random() * cardIds.length)];

      await room.moveCards({
        movingCards: [{ card: selectedCard, fromArea: CardMoveArea.HandArea }],
        fromId: toId,
        toId: fromId,
        toArea: CardMoveArea.HandArea,
        moveReason: CardMoveReason.ActivePrey,
        proposer: fromId,
        movedByReason: this.GeneralName,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiaoBianSkipDraw.Name, description: QiaoBianSkipDraw.Description })
export class QiaoBianSkipPlay extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseSkippedEvent>): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseSkippedEvent &&
      event.skippedPhase === PlayerPhase.PlayCardStage
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseSkippedEvent>,
  ): boolean {
    return owner.Id === content.playerId && owner.getFlag<boolean>(this.GeneralName) === true;
  }

  public get Priority() {
    return StagePriority.Low;
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

  public getSkillLog(room: Room, owner: Player): PatchedTranslationObject | string {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to move a card in the battlefield?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.animation = this.getAnimationSteps(event);
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    const { fromId, toIds } = skillUseEvent;

    const moveFrom = room.getPlayerById(toIds![0]);
    const moveTo = room.getPlayerById(toIds![1]);
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
      fromId,
      toId: fromId,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      fromId,
    );

    await room.moveCards({
      movingCards: [{ card: response.selectedCard!, fromArea: response.fromArea }],
      moveReason: CardMoveReason.PassiveMove,
      toId: moveTo.Id,
      fromId: moveFrom.Id,
      toArea: response.fromArea!,
      proposer: chooseCardEvent.fromId,
      movedByReason: this.GeneralName,
    });

    return true;
  }
}
