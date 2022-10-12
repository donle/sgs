import { HongYi } from './hongyi';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, PlayerDiedStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { LimitSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'quanfeng', description: 'quanfeng_description' })
export class QuanFeng extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDiedStage.AfterPlayerDied || stage === PlayerDyingStage.RequestRescue;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent | GameEventIdentifiers.PlayerDyingEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PlayerDiedEvent) {
      return (
        owner.hasSkill(HongYi.Name) &&
        (content as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId !== owner.Id
      );
    } else if (identifier === GameEventIdentifiers.PlayerDyingEvent) {
      return (content as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying === owner.Id;
    }

    return false;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent | GameEventIdentifiers.PlayerDyingEvent>,
  ): PatchedTranslationObject {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.PlayerDiedEvent
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to lose skill ‘Hong Yi’ to gain {1}’s skills?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(
            room.getPlayerById((event as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId),
          ),
        ).extract()
      : TranslationPack.translationJsonPatcher('{0}: do you want to gain 2 max hp and recover 4 hp?').extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.PlayerDiedEvent | GameEventIdentifiers.PlayerDyingEvent
    >;

    if (EventPacker.getIdentifier(unknownEvent) === GameEventIdentifiers.PlayerDiedEvent) {
      const whoDead = (unknownEvent as ServerEventFinder<GameEventIdentifiers.PlayerDiedEvent>).playerId;
      const skillNames = room
        .getPlayerById(whoDead)
        .getPlayerSkills(undefined, true)
        .filter(skill => !skill.isShadowSkill() && !skill.isLordSkill() && !skill.isStubbornSkill())
        .map(skill => skill.Name);

      await room.loseSkill(fromId, HongYi.Name);

      for (const skillName of skillNames) {
        await room.obtainSkill(fromId, skillName, true);
      }

      await room.changeMaxHp(fromId, 1);
      await room.recover({
        toId: fromId,
        recoveredHp: 1,
        recoverBy: fromId,
      });
    } else {
      await room.changeMaxHp(fromId, 2);
      await room.recover({
        toId: fromId,
        recoveredHp: 4,
        recoverBy: fromId,
      });
    }

    return true;
  }
}
