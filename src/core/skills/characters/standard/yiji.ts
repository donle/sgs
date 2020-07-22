import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, CardMoveStage, DamageEffectStage, DrawCardStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'yiji', description: 'yiji_description' })
export class YiJi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    await room.drawCards(2, damagedEvent.toId, 'top', damagedEvent.toId, this.Name);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: YiJi.GeneralName, description: YiJi.Description })
export class YiJiShadow extends TriggerSkill {
  isAutoTrigger() {
    return false;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.MoveCardEvent>,
    stage?: AllStage,
  ) {
    return stage === DrawCardStage.AfterDrawCardEffect || stage === CardMoveStage.AfterCardMoved;
  }

  public getSkillLog(room: Room, owner: Player) {
    return 'please assign others no more than 2 handcards';
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.MoveCardEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      return owner.Id === content.fromId && !!content.triggeredBySkills?.includes(this.GeneralName);
    } else if (identifier === GameEventIdentifiers.MoveCardEvent) {
      content = content as ServerEventFinder<GameEventIdentifiers.MoveCardEvent>;
      const from = content.fromId && room.getPlayerById(content.fromId);
      if (!from) {
        return false;
      }

      const usedTimes = from.getInvisibleMark(this.GeneralName);
      if (usedTimes >= 2) {
        from.removeInvisibleMark(this.GeneralName);
        return false;
      }

      return (
        owner.Id === content.fromId &&
        content.toArea === CardMoveArea.HandArea &&
        !!content.triggeredBySkills?.includes(this.GeneralName) &&
        usedTimes < 2
      );
    }

    return false;
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }
  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length > 0 && cards.length <= 2;
  }
  public isAvailableCard(
    owner: PlayerId,
    room: Room,
    cardId: CardId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return true;
  }
  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public isAvailableTarget(
    owner: PlayerId,
    room: Room,
    target: PlayerId,
    selectedCards: CardId[],
    selectedTargets: PlayerId[],
    containerCard?: CardId,
  ): boolean {
    return owner !== target;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { toIds, cardIds, fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    if (cardIds === undefined || cardIds.length === 0) {
      return true;
    }

    from.addInvisibleMark(this.GeneralName, cardIds!.length);

    await room.moveCards({
      movingCards: cardIds!.map(card => ({ card, fromArea: CardMoveArea.HandArea })),
      fromId,
      toId: toIds![0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      movedByReason: this.GeneralName,
    });
    return true;
  }
}
