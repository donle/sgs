import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardDrawReason, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

// 豺月：锁定技，你每受到1点普通伤害后，你摸一张牌并将一张牌置于武将牌上，称为【碑】；摸牌阶段开始时，你摸X张牌；你的【杀】次数+X（X为【碑】数）

@CompulsorySkill({ name: 'pve_chaiyue', description: 'pve_chaiyue_description' })
export class PveChaiYue extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.toId === owner.Id && event.damageType === DamageType.Normal;
  }

  async onTrigger() {
    return true;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.damage;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    await room.drawCards(2, owner.Id, 'top', owner.Id, this.Name);

    if (owner.getPlayerCards().length > 0) {
      const skillUseEvent = {
        invokeSkillNames: [PveChaiYueShadow.Name],
        toId: owner.Id,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please put a hand card on your general card',
          this.Name,
        ).extract(),
        triggeredBySkills: [this.Name],
      };
      room.notify(
        GameEventIdentifiers.AskForSkillUseEvent,
        EventPacker.createUncancellableEvent<GameEventIdentifiers.AskForSkillUseEvent>(skillUseEvent),
        owner.Id,
      );

      const { cardIds } = await room.onReceivingAsyncResponseFrom(GameEventIdentifiers.AskForSkillUseEvent, owner.Id);
      const allCards = owner.getPlayerCards();
      const card = cardIds ? cardIds[0] : allCards[Math.floor(Math.random() * allCards.length)];

      await room.moveCards({
        movingCards: [{ card }],
        fromId: owner.Id,
        toId: owner.Id,
        toArea: PlayerCardsArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        toOutsideArea: this.GeneralName,
        isOutsideAreaInPublic: true,
        proposer: owner.Id,
        movedByReason: this.GeneralName,
      });
    }

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: PveChaiYue.Name, description: PveChaiYue.Description })
export class PveChaiYueShadow extends TriggerSkill {
  isTriggerable() {
    return false;
  }

  canUse() {
    return false;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public availableCardAreas(): PlayerCardsArea[] {
    return [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea];
  }

  async onTrigger() {
    return true;
  }

  async onEffect() {
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name:PveChaiYueShadow.Name, description: PveChaiYueShadow.Description })
export class PveChaiYueDraw extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return (
      owner.Id === event.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      event.bySpecialReason === CardDrawReason.GameStage
    );
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount += (room
      .getPlayerById(event.fromId)
      .getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length);
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveChaiYueDraw.Name, description: PveChaiYueDraw.Description })
export class PveChaiYueBuff extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? owner.getCardIds(PlayerCardsArea.OutsideArea, 'pve_chaiyue').length : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? owner.getCardIds(PlayerCardsArea.OutsideArea, 'pve_chaiyue').length : 0;
    }
  }
}
