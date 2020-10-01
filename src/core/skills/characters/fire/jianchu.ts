import { CardType } from 'core/cards/card';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardChoosingOptions, CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jianchu', description: 'jianchu_description' })
export class Jianchu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return (
      stage === AimStage.AfterAim &&
      event.byCardId !== undefined &&
      Sanguosha.getCardById(event.byCardId).GeneralName === 'slash'
    );
  }
  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    if (!event) {
      return false;
    }
    const { fromId, toId } = event;
    const target = room.getPlayerById(toId);

    return fromId === owner.Id && !target.Dead && target.getPlayerCards().length > 0;
  }

  async onTrigger(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const aimEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;

    const to = room.getPlayerById(aimEvent.toId);

    const options: CardChoosingOptions = {
      [PlayerCardsArea.EquipArea]: to.getCardIds(PlayerCardsArea.EquipArea),
      [PlayerCardsArea.HandArea]: to.getCardIds(PlayerCardsArea.HandArea).length,
    };

    const chooseCardEvent = {
      fromId: aimEvent.fromId!,
      toId: to.Id,
      options,
    };

    room.notify(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingCardFromPlayerEvent>(chooseCardEvent),
      aimEvent.fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(
      GameEventIdentifiers.AskForChoosingCardFromPlayerEvent,
      aimEvent.fromId!,
    );

    if (response.selectedCard === undefined) {
      const cardIds = to.getCardIds(PlayerCardsArea.HandArea);
      response.selectedCard = cardIds[Math.floor(Math.random() * cardIds.length)];
    }

    await room.dropCards(
      CardMoveReason.PassiveDrop,
      [response.selectedCard],
      chooseCardEvent.toId,
      chooseCardEvent.fromId,
      this.Name,
    );

    if (!Sanguosha.getCardById(response.selectedCard!).is(CardType.Basic)) {
      EventPacker.setDisresponsiveEvent(aimEvent);
      const additionalTimes = room.getFlag<number>(skillUseEvent.fromId, this.Name) || 0;
      room.setFlag<number>(skillUseEvent.fromId, this.Name, additionalTimes + 1, false);
    } else if (aimEvent.byCardId && room.getCardOwnerId(aimEvent.byCardId) === undefined) {
      await room.moveCards({
        movingCards: [{ card: aimEvent.byCardId, fromArea: CardMoveArea.ProcessingArea }],
        moveReason: CardMoveReason.ActivePrey,
        toArea: CardMoveArea.HandArea,
        toId: to.Id,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: Jianchu.Name, description: Jianchu.Description })
export class JianChuShadow extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    const additionalTimes = room.getFlag<number>(owner.Id, this.GeneralName);
    if (match && additionalTimes !== undefined && additionalTimes > 0) {
      return additionalTimes;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@CommonSkill({ name: JianChuShadow.Name, description: JianChuShadow.Description })
export class JianchuRemove extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(room: Room): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>,
    stage: PhaseChangeStage,
  ): boolean {
    return stage === PhaseChangeStage.PhaseChanged && event.from === PlayerPhase.PhaseFinish;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return content.fromPlayer === owner.Id && room.getFlag<number>(owner.Id, this.GeneralName) !== undefined;
  }

  public async onTrigger(): Promise<boolean> {
  return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    room.removeFlag(skillUseEvent.fromId, this.GeneralName);

    return true;
  }
}
