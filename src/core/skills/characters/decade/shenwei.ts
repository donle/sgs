import { CardDrawReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, DrawCardStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'shenwei', description: 'shenwei_description' })
export class ShenWei extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>, stage?: AllStage) {
    return stage === DrawCardStage.CardDrawing;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent>): boolean {
    return (
      owner.Id === content.fromId &&
      room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
      content.bySpecialReason === CardDrawReason.GameStage
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const drawCardEvent = event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
    drawCardEvent.drawAmount += 2;

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ShenWei.GeneralName, description: ShenWei.Description })
export class ShenWeiShadow extends RulesBreakerSkill {
  public breakAdditionalCardHoldNumber(): number {
    return 2;
  }
}
