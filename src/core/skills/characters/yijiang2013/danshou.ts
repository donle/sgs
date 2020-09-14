import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'danshou', description: 'danshou_description' })
export class DanShou extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage) {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>) {
    return (
      !owner.hasUsedSkill(this.Name) && content.allTargets.includes(owner.Id),
      Sanguosha.getCardById(content.byCardId!).is(CardType.Basic) ||
        Sanguosha.getCardById(content.byCardId!).is(CardType.Trick)
    );
  }

  public async onTrigger() {
    return true;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PrepareStage;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;

    const events = room.Analytics.getRecordEvents<GameEventIdentifiers.AimEvent>(
      event => {
        return (
          event.allTargets.includes(fromId) &&
          (Sanguosha.getCardById(event.byCardId!).is(CardType.Basic) ||
            Sanguosha.getCardById(event.byCardId!).is(CardType.Trick))
        );
      },
      undefined,
      true,
    );

    const numOfDrawing = events.length + 1;
    await room.drawCards(numOfDrawing, fromId, undefined, fromId, this.Name);

    return true;
  }
}
