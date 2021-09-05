import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, CardUseStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shenzhuo', description: 'shenzhuo_description' })
export class ShenZhuo extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.CardUseEvent>, stage?: AllStage): boolean {
    return stage === CardUseStage.CardUseFinishedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.CardUseEvent>): boolean {
    return (
      content.fromId === owner.Id &&
      Sanguosha.getCardById(content.cardId).GeneralName === 'slash' &&
      !Sanguosha.isVirtualCardId(content.cardId)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.drawCards(1, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShenZhuo.Name, description: ShenZhuo.Description })
export class ShenZhuoShadow extends RulesBreakerSkill {
  public breakCardUsableTimes(cardId: CardId | CardMatcher) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? INFINITE_TRIGGERING_TIMES : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? INFINITE_TRIGGERING_TIMES : 0;
    }
  }
}
