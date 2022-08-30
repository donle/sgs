import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { JueYong } from './jueyong';

@CommonSkill({ name: 'poxiang', description: 'poxiang_description' })
export class PoXiang extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return !owner.hasUsedSkill(this.Name) && owner.getCardIds(PlayerCardsArea.HandArea).length > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return true;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    const { fromId } = event;
    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(fromId).cardFrom(event.cardIds[0]) }],
      fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      triggeredBySkills: [this.Name],
    });

    const cardIdsDrawn = await room.drawCards(3, fromId, 'top', fromId, this.Name);

    room
      .getPlayerById(fromId)
      .getCardIds(PlayerCardsArea.OutsideArea, JueYong.Name)
      .map(card => ({ card, fromArea: CardMoveArea.OutsideArea })).length > 0 &&
      (await room.moveCards({
        movingCards: room
          .getPlayerById(fromId)
          .getCardIds(PlayerCardsArea.OutsideArea, JueYong.Name)
          .map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId,
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: fromId,
        triggeredBySkills: [this.Name],
      }));

    await room.loseHp(fromId, 1);

    const originalCardIds = room.getFlag<CardId[]>(fromId, this.Name) || [];
    originalCardIds.push(...cardIdsDrawn);
    room.getPlayerById(fromId).setFlag<CardId[]>(this.Name, originalCardIds);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: PoXiang.GeneralName, description: PoXiang.Description })
export class PoXiangShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return (
      EventPacker.getIdentifier(event) === GameEventIdentifiers.AskForCardDropEvent ||
      stage === PhaseChangeStage.PhaseChanged
    );
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    let canTrigger = false;
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.AskForCardDropEvent) {
      canTrigger = room.CurrentPlayerPhase === PlayerPhase.DropCardStage && room.CurrentPhasePlayer.Id === owner.Id;
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      canTrigger = owner.Id === phaseChangeEvent.fromPlayer && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && !!owner.getFlag<CardId[]>(this.GeneralName);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.AskForCardDropEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.AskForCardDropEvent) {
      const askForCardDropEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.AskForCardDropEvent>;
      const player = room.getPlayerById(askForCardDropEvent.toId);
      const cardIdsDrawn = player.getFlag<CardId[]>(this.GeneralName);

      if (cardIdsDrawn.length > 0) {
        const otherHandCards = player.getCardIds(PlayerCardsArea.HandArea).filter(card => !cardIdsDrawn.includes(card));
        const discardAmount = otherHandCards.length - player.getMaxCardHold(room);

        askForCardDropEvent.cardAmount = discardAmount;
        askForCardDropEvent.except = askForCardDropEvent.except
          ? [...askForCardDropEvent.except, ...cardIdsDrawn]
          : cardIdsDrawn;
      }
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      const { fromPlayer } = phaseChangeEvent;
      room.getPlayerById(fromPlayer!).removeFlag(this.GeneralName);
    }

    return true;
  }
}
