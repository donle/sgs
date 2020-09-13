import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { ClientEventFinder, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseChangeStage, PlayerPhase, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, LimitSkill, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@LimitSkill({ name: 'qimou', description: 'qimou_description' })
export class QiMou extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public numberOfTargets() {
    return 0;
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return false;
  }

  isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  async onUse(room: Room, event: ClientEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);

    const options: string[] = [];
    for (let i = 0; i < from.Hp; i++) {
      options.push((i + 1).toString());
    }

    const askForLosingHpAmount: ServerEventFinder<GameEventIdentifiers.AskForChoosingOptionsEvent> = {
      toId: fromId,
      options,
      conversation: 'please choose the amount of hp to lose',
    };
    room.notify(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForChoosingOptionsEvent>(askForLosingHpAmount),
      fromId,
    );

    const response = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForChoosingOptionsEvent, fromId);
    const lostHp = parseInt(response.selectedOption!, 10);

    await room.loseHp(fromId, lostHp);
    await room.drawCards(lostHp, fromId, undefined, fromId, this.Name);
    room.setFlag(fromId, this.Name, lostHp, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiMou.Name, description: QiMou.Description })
export class QiMouShadow extends TriggerSkill implements OnDefineReleaseTiming {
  afterLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PhaseFinishEnd;
  }

  isAutoTrigger() {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return true;
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage) {
    return stage === PhaseChangeStage.AfterPhaseChanged && event.to === PlayerPhase.PhaseFinish;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.toPlayer === owner.Id && room.getFlag(owner.Id, this.GeneralName) !== undefined;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    room.removeFlag(content.fromId, this.GeneralName);
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: QiMouShadow.Name, description: QiMou.Description })
export class QiMouBlocker extends RulesBreakerSkill {
  breakOffenseDistance(room: Room, owner: Player) {
    return room.getFlag<number>(owner.Id, this.GeneralName) || 0;
  }

  breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    const additionalTimes = room.getFlag<number>(owner.Id, this.GeneralName) || 0;
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? additionalTimes : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? additionalTimes : 0;
    }
  }
}
