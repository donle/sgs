import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: 'bahu', description: 'bahu_description' })
export class BaHu extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return owner.Id === content.playerId && content.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    await room.drawCards(1, fromId);
    return true;
  }

  get Muted() {
    return true;
  }
}

@ShadowSkill
@PersistentSkill({ stubbornSkill: true })
@CompulsorySkill({ name: BaHu.Name, description: BaHu.Description })
export class BaHuShadow extends RulesBreakerSkill {
  get Muted() {
    return true;
  }

  breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player) {
    if (cardId instanceof CardMatcher) {
      return cardId.match(new CardMatcher({ generalName: ['slash'] })) ? 1 : 0;
    } else {
      return Sanguosha.getCardById(cardId).GeneralName === 'slash' ? 1 : 0;
    }
  }
}
