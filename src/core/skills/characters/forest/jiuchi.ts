import { VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'jiuchi', description: 'jiuchi_description' })
export class JiuChi extends ViewAsSkill {
  public static readonly Used = 'JiuChi_Used';

  public canViewAs(): string[] {
    return ['alcohol'];
  }

  public canUse(room: Room, owner: Player) {
    return (
      owner.canUseCard(room, new CardMatcher({ name: ['alcohol'] })) &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(room: Room, owner: Player, pendingCardId: CardId): boolean {
    return Sanguosha.getCardById(pendingCardId).Suit === CardSuit.Spade;
  }

  public viewAs(selectedCards: CardId[]) {
    return VirtualCard.create<Alcohol>(
      {
        cardName: 'alcohol',
        bySkill: this.Name,
      },
      selectedCards,
    );
  }
}

@ShadowSkill
@CommonSkill({ name: JiuChi.GeneralName, description: JiuChi.Description })
export class JiuChiDrunk extends TriggerSkill implements OnDefineReleaseTiming {
  public isAutoTrigger() {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    const drunkLevel = EventPacker.getMiddleware<number>('drunkLevel', event);
    const { fromId, cardIds } = event;
    if (!fromId || !cardIds || !drunkLevel) {
      return false;
    }

    return (
      fromId === owner.Id &&
      Sanguosha.getCardById(cardIds[0]).GeneralName === 'slash' &&
      drunkLevel > 0 &&
      !owner.hasUsedSkill(this.Name)
    );
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PrepareStage;
  }

  public whenRefresh(room: Room, owner: Player) {
    if (room.getFlag<boolean>(owner.Id, JiuChi.Used) === true) {
      room.removeFlag(owner.Id, JiuChi.Used);
    }
  }

  public async whenDead(room: Room, owner: Player) {
    this.whenRefresh(room, owner);
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.setFlag<boolean>(event.fromId, JiuChi.Used, true, true);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: JiuChiDrunk.Name, description: JiuChi.Description })
export class JiuChiExtra extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ name: ['alcohol'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).Name === 'alcohol' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}
