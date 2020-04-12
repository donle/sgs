import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { CompulsorySkill, RulesBreakerSkill, ShadowSkill, TriggerSkill } from 'core/skills/skill';

@CompulsorySkill
export class YingZi extends TriggerSkill {
  constructor() {
    super('yingzi', 'yingzi_description');
  }

  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>) {
    return owner.Id === content.fromId && room.CurrentPlayerPhase === PlayerPhase.DrawCardStage;
  }

  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { triggeredOnEvent } = skillUseEvent;
    const drawCardEvent = triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount += 1;

    return true;
  }
}

@CompulsorySkill
@ShadowSkill
export class YingZiShadow extends RulesBreakerSkill {
  constructor() {
    super('yingzi', 'yingzi_description');
  }

  public breakCardHoldNumber(room: Room, owner: Player) {
    return owner.MaxHp;
  }
}
