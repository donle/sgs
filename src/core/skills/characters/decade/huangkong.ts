import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AimStage, AllStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill } from 'core/skills/skill_wrappers';

@CompulsorySkill({ name: 'huangkong', description: 'huangkong_description' })
export class HuangKong extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.AimEvent>, stage?: AllStage): boolean {
    return stage === AimStage.AfterAimmed;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.AimEvent>): boolean {
    return (
      content.toId === owner.Id &&
      room.CurrentPlayer !== owner &&
      owner.getCardIds(PlayerCardsArea.HandArea).length === 0 &&
      (Sanguosha.getCardById(content.byCardId).GeneralName === 'slash' ||
        Sanguosha.getCardById(content.byCardId).isCommonTrick())
    );
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name);

    return true;
  }
}
