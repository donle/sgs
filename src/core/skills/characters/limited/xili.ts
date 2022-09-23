import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DamageEffectStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'xili', description: 'xili_description' })
export class XiLi extends TriggerSkill {
  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase): boolean {
    return stage === PlayerPhase.PhaseBegin;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.DamageEffect;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      !owner.hasUsedSkill(this.Name) &&
      !!event.fromId &&
      event.fromId !== owner.Id &&
      !room.getPlayerById(event.fromId).Dead &&
      room.getPlayerById(event.fromId).hasSkill(this.Name) &&
      room.CurrentPlayer === room.getPlayerById(event.fromId) &&
      !room.getPlayerById(event.toId).hasSkill(this.Name) &&
      owner.getPlayerCards().length > 0
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard a card to increase the damage to {2} which dealt by {1} by 1, then you and {1} will draw 2 cards?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.fromId!)),
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);

    const damageEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
    damageEvent.damage++;

    for (const toId of [damageEvent.fromId, event.fromId]) {
      await room.drawCards(2, toId, 'top', event.fromId, this.Name);
    }

    return true;
  }
}
