import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseStageChangeStage, PlayerPhaseStages } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, CompulsorySkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'kunfen', description: 'kunfen_description' })
export class KunFen extends TriggerSkill {
  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    return content.playerId === owner.Id && content.toStage === PlayerPhaseStages.FinishStageStart;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    EventPacker.addMiddleware(
      { tag: this.Name, data: true },
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
    );

    await room.loseHp(event.fromId, 1);

    room.getPlayerById(event.fromId).Dead || (await room.drawCards(2, event.fromId, 'top', event.fromId, this.Name));

    return true;
  }
}

@CommonSkill({ name: 'kunfen_EX', description: 'kunfen_EX_description' })
export class KunFenEX extends KunFen {
  public get GeneralName() {
    return KunFen.Name;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === PhaseStageChangeStage.StageChanged && !EventPacker.getMiddleware<boolean>(this.GeneralName, event);
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to lose 1 hp to draw 2 cards?',
      this.Name,
    ).extract();
  }
}
