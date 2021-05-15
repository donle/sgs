import { CompulsorySkill, ShadowSkill, CommonSkill } from 'core/skills/skill_wrappers';
import { TriggerSkill, RulesBreakerSkill } from 'core/skills/skill';
import { GameEventIdentifiers, ServerEventFinder, EventPacker, CardMoveReason, CardDrawReason } from 'core/event/event';
import { AllStage, DamageEffectStage, PlayerPhase, DrawCardStage } from 'core/game/stage_processor';
import { Room } from 'core/room/room';
import { Player } from 'core/player/player';
import { CardId } from 'core/cards/libs/card_props';
import { PlayerCardsArea } from 'core/player/player_props';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'pve_lingxi', description: 'pve_lingxi_description' })
export class PveLingXi extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage) {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return event.toId === owner.Id;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const owner = room.getPlayerById(event.fromId);
    await room.drawCards(1, owner.Id, 'top', owner.Id, this.Name);

    if (owner.getPlayerCards().length > 0) {
      const skillUseEvent = {
        invokeSkillNames: [PveLingXiShadow.Name],
        toId: owner.Id,
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: please put a hand card on your general card',
          this.Name,
        ).extract(),
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
@CommonSkill({ name: PveLingXi.Name, description: PveLingXi.Description })
export class PveLingXiShadow extends TriggerSkill {
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
@CompulsorySkill({ name: PveLingXiShadow.Name, description: PveLingXiShadow.Description })
export class PveLingXiDraw extends TriggerSkill {
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
    drawCardEvent.drawAmount += room
      .getPlayerById(event.fromId)
      .getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length;
    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: PveLingXiDraw.Name, description: PveLingXiDraw.Description })
export class PveLingXiBuff extends RulesBreakerSkill {
  breakAdditionalCardHoldNumber(room: Room, owner: Player) {
    return owner.getCardIds(PlayerCardsArea.OutsideArea, this.GeneralName).length;
  }
}
