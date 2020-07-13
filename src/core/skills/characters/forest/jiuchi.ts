import { VirtualCard } from 'core/cards/card';
import { Alcohol } from 'core/cards/legion_fight/alcohol';
import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId, CardSuit } from 'core/cards/libs/card_props';
import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, OnDefineReleaseTiming, ShadowSkill, TriggerSkill, ViewAsSkill } from 'core/skills/skill';

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
export class JiuChiShadow extends TriggerSkill {
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

    return fromId === owner.Id && Sanguosha.getCardById(cardIds[0]).GeneralName === 'slash' && drunkLevel > 0;
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
@CommonSkill({ name: JiuChiShadow.Name, description: JiuChiShadow.Description })
export class JiuChiRemove extends TriggerSkill implements OnDefineReleaseTiming {
  onLosingSkill(room: Room, playerId: PlayerId) {
    return room.CurrentPlayerPhase === PlayerPhase.FinishStage;
  }

  public isAutoTrigger() {
    return true;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return true;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage: AllStage): boolean {
    return event.from === PlayerPhase.FinishStage && stage === PhaseChangeStage.AfterPhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return room.getFlag<boolean>(owner.Id, JiuChi.Used) === true;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.translationsMessage = undefined;

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { triggeredOnEvent } = event;
    const phaseChangeEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;

    phaseChangeEvent.fromPlayer && room.removeFlag(phaseChangeEvent.fromPlayer, JiuChi.Used);

    return true;
  }
}
