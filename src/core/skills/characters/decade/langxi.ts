import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'langxi', description: 'langxi_description' })
export class LangXi extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && event.toStage === PlayerPhaseStages.PrepareStageStart;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return (
      content.playerId === owner.Id &&
      room.getOtherPlayers(owner.Id).find(player => player.Hp <= owner.Hp) !== undefined
    );
  }

  public targetFilter(room: Room, owner: Player, targets: PlayerId[]): boolean {
    return targets.length === 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target && room.getPlayerById(target).Hp <= room.getPlayerById(owner).Hp;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose a target with hp less than your hp to deal 0-2 damage to him randomly?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    const randomDamage = Math.floor(Math.random() * 3);
    randomDamage > 0 &&
      (await room.damage({
        fromId: event.fromId,
        toId: event.toIds[0],
        damage: randomDamage,
        damageType: DamageType.Normal,
        triggeredBySkills: [this.Name],
      }));

    return true;
  }
}
