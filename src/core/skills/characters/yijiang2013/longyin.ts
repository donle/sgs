import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import { AllStage, CardUseStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, PersistentSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';

@CommonSkill({ name: 'longyin', description: 'longyin_description' })
export class LongYin extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage) {
    return stage === CardUseStage.CardUsing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>) {
    const event = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    return (
      room.CurrentPhasePlayer.Id === event.fromId &&
      Sanguosha.getCardById(event.cardId).GeneralName === 'slash' &&
      owner.getPlayerCards().length > 0
    );
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, triggeredOnEvent } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const event = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.Name);
    from.setFlag<PlayerId>(this.Name, event.fromId);
    room.syncGameCommonRules(event.fromId, target => {
      GameCommonRules.addCardUsableTimes(
        new CardMatcher({ generalName: ['slash'] }),
        1,
        room.getPlayerById(event.fromId),
      );
      from.addInvisibleMark(this.Name, 1);
    });
    if (Sanguosha.getCardById(event.cardId).isRed()) {
      await room.drawCards(1, fromId, 'top', fromId, this.Name);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: LongYin.Name, description: LongYin.Description })
export class LongYinClear extends TriggerSkill implements OnDefineReleaseTiming {
  get Muted() {
    return true;
  }

  public isFlaggedSkill() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.AfterStageChanged;
  }

  isAutoTrigger() {
    return true;
  }

  afterLosingSkill(room: Room) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  afterDead(room: Room) {
    return room.CurrentPlayerStage === PlayerPhaseStages.PlayCardStageEnd;
  }

  private clearLongYinHistory(room: Room, from: Player) {
    const targetId = from.getFlag<PlayerId>(this.GeneralName);
    const extraUse = from.getInvisibleMark(this.GeneralName);
    if (extraUse === 0 || !targetId) {
      return;
    }

    room.syncGameCommonRules(targetId, target => {
      GameCommonRules.addCardUsableTimes(
        new CardMatcher({ generalName: ['slash'] }),
        -extraUse,
        room.getPlayerById(targetId),
      );
      from.removeInvisibleMark(this.GeneralName);
      from.removeFlag(this.GeneralName);
    });
    from.removeFlag(this.GeneralName);
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    const event = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
    return (
      event.toStage === PlayerPhaseStages.PlayCardStageEnd && owner.getFlag<PlayerId>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    event.translationsMessage = undefined;

    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    this.clearLongYinHistory(room, from);

    return true;
  }
}
