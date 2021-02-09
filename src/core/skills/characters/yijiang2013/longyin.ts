import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { GameCommonRules } from 'core/game/game_rules';
import {
  AllStage,
  CardUseStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'longyin', description: 'longyin_description' })
export class LongYin extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === CardUseStage.CardUsing || stage === PhaseStageChangeStage.AfterStageChanged;
  }

  isAutoTrigger(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ) {
    const identifier = EventPacker.getIdentifier(event);
    return identifier === GameEventIdentifiers.PhaseStageChangeEvent;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PlayCardStage;
  }

  public whenRefresh(room: Room, owner: Player) {
    this.clearLongYinHistory(room, owner);
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ) {
    if (owner.Dead) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const event = content as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return (
        room.CurrentPhasePlayer.Id === event.fromId &&
        Sanguosha.getCardById(event.cardId).GeneralName === 'slash' &&
        owner.getPlayerCards().length > 0
      );
    } else {
      const event = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return event.toStage === PlayerPhaseStages.PlayCardStageEnd && owner.getFlag<PlayerId>(this.Name) !== undefined;
    }
  }

  cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  private clearLongYinHistory(room: Room, from: Player) {
    const targetId = from.getFlag<PlayerId>(this.Name);
    const extraUse = from.getInvisibleMark(this.Name);
    if (extraUse === 0 || !targetId) {
      return;
    }

    room.syncGameCommonRules(targetId, target => {
      GameCommonRules.addCardUsableTimes(
        new CardMatcher({ generalName: ['slash'] }),
        -extraUse,
        room.getPlayerById(targetId),
      );
      from.removeInvisibleMark(this.Name);
      from.removeFlag(this.Name);
    });
    from.removeFlag(this.Name);
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const { triggeredOnEvent } = event;
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      event.translationsMessage = undefined;
    }
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, triggeredOnEvent } = skillUseEvent;
    const from = room.getPlayerById(fromId);
    const identifier = EventPacker.getIdentifier(triggeredOnEvent!);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      this.clearLongYinHistory(room, from);
    } else {
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
    }
    return true;
  }
}

// @ShadowSkill
// @CommonSkill({ name: 'longyinBlocker', description: 'longyin_description' })
// export class LongYinBlocker extends FilterSkill {
//   get Muted() {
//     return true;
//   }

//   excludeCardUseHistory(cardId: CardId | CardMatcher, room: Room, owner: PlayerId): boolean {
//     if (cardId instanceof CardMatcher) {
//       return cardId.match(new CardMatcher({ generalName: ['slash'] }));
//     } else {
//       return Sanguosha.getCardById(cardId).GeneralName === 'slash';
//     }
//   }
// }
