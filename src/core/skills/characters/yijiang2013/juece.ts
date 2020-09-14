import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { CommonSkill, TriggerSkill } from 'core/skills/skill';

@CommonSkill({ name: 'juece', description: 'juece_description' })
export class JueCe extends TriggerSkill {
  isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.BeforeStageChange;
  }

  canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      owner.Id === content.playerId &&
      PlayerPhaseStages.FinishStageStart === content.toStage &&
      room.getOtherPlayers(owner.Id).find(player => player.getCardIds(PlayerCardsArea.HandArea).length === 0) !==
        undefined
    );
  }
  public numberOfTargets() {
    return 1;
  }
  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId) {
    return target !== owner && room.getPlayerById(target).getCardIds(PlayerCardsArea.HandArea).length === 0;
  }
  async onTrigger() {
    return true;
  }

  async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, toIds } = skillUseEvent;
    await room.damage({
      fromId,
      toId: toIds![0],
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });
    return true;
  }
}
