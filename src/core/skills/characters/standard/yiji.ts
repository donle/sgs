import { CardId } from 'core/cards/libs/card_props';
import {
  CardLostReason,
  CardObtainedReason,
  EventPacker,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { AllStage, CardLostStage, DamageEffectStage, DrawCardStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill
export class YiJi extends TriggerSkill {
  constructor() {
    super('yiji', 'yiji_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return owner.Id === content.toId;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const damagedEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    await room.drawCards(2, damagedEvent.toId, 'top', damagedEvent.toId, this.name);
    return true;
  }
}

@CommonSkill
@ShadowSkill()
export class YiJiShadow extends TriggerSkill {
  constructor() {
    super('yiji', 'yiji_description');
  }

  isAutoTrigger() {
    return false;
  }

  isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.CardLostEvent>,
    stage?: AllStage,
  ) {
    return stage === DrawCardStage.AfterDrawCardEffect || stage === CardLostStage.AfterCardLostEffect;
  }

  canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.CardLostEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      return owner.Id === content.fromId && !!content.triggeredBySkills?.includes(this.GeneralName);
    } else if (identifier === GameEventIdentifiers.CardLostEvent) {
      const from = room.getPlayerById(content.fromId);
      const usedTimes = from.getInvisibleMark(this.GeneralName);
      if (usedTimes >= 2) {
        from.removeInvisibleMark(this.GeneralName);
        return false;
      }

      return owner.Id === content.fromId && !!content.triggeredBySkills?.includes(this.GeneralName) && usedTimes < 2;
    }

    return false;
  }

  public targetFilter(room: Room, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }
  public cardFilter(room: Room, cards: CardId[]): boolean {
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
    return room.getPlayerById(owner).cardFrom(cardId) === PlayerCardsArea.HandArea;
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

    await room.moveCards(
      cardIds!,
      fromId,
      toIds![0],
      CardLostReason.ActiveMove,
      PlayerCardsArea.HandArea,
      PlayerCardsArea.HandArea,
      CardObtainedReason.PassiveObtained,
      fromId,
      this.GeneralName,
    );
    return true;
  }
}
