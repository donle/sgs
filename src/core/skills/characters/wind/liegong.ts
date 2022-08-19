import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'liegong', description: 'liegong_description' })
export class LieGong extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    return true;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    const canUse =
      content.fromId === owner.Id &&
      content.byCardId !== undefined &&
      Sanguosha.getCardById(content.byCardId).GeneralName === 'slash';
    if (!canUse) {
      return false;
    }

    const to = room.getPlayerById(content.toId);

    return (
      to.getCardIds(PlayerCardsArea.HandArea).length <= owner.getCardIds(PlayerCardsArea.HandArea).length ||
      to.Hp >= owner.Hp
    );
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const aimEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.AimEvent>;
    const from = room.getPlayerById(aimEvent.fromId);
    const to = room.getPlayerById(aimEvent.toId);

    if (to.getCardIds(PlayerCardsArea.HandArea).length <= from.getCardIds(PlayerCardsArea.HandArea).length) {
      EventPacker.setDisresponsiveEvent(aimEvent);
    }
    if (to.Hp >= from.Hp) {
      aimEvent.additionalDamage = aimEvent.additionalDamage ? aimEvent.additionalDamage++ : 1;
    }
    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: LieGong.Name, description: LieGong.Description })
export class LieGongShadow extends RulesBreakerSkill {
  breakAttackDistance(cardId: CardId | CardMatcher | undefined, room: Room, owner: Player) {
    if (cardId === undefined || cardId instanceof CardMatcher) {
      return 0;
    } else {
      return Math.max(0, Sanguosha.getCardById(cardId).CardNumber - owner.getAttackRange(room));
    }
  }
}
