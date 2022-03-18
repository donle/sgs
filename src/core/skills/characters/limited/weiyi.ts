import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { AllStage, DamageEffectStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'weiyi', description: 'weiyi_description' })
export class WeiYi extends TriggerSkill {
  private readonly WeiYiOptions = ['weiyi:loseHp', 'weiyi:recover'];

  public isAutoTrigger(
    room: Room,
    owner: Player,
    event?: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): boolean {
    return event !== undefined && room.getPlayerById(event.toId).Hp === owner.Hp;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return !owner.getFlag<PlayerId>(this.Name)?.includes(content.toId) && !room.getPlayerById(content.toId).Dead;
  }

  public async beforeUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    const victim = room.getPlayerById(
      (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId,
    );
    if (room.getPlayerById(event.fromId).Hp === victim.Hp) {
      const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
        GameEventIdentifiers.AskForChoosingOptionsEvent,
        {
          options: this.WeiYiOptions,
          conversation: TranslationPack.translationJsonPatcher(
            '{0}: please choose weiyi options: {1}',
            this.Name,
            TranslationPack.patchPlayerInTranslation(victim),
          ).extract(),
          toId: event.fromId,
          triggeredBySkills: [this.Name],
        },
        event.fromId,
      );

      if (selectedOption) {
        EventPacker.addMiddleware({ tag: this.Name, data: selectedOption }, event);
      } else {
        return false;
      }
    }

    return true;
  }

  public getSkillLog(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    const victim = room.getPlayerById(event.toId);
    return victim.Hp > owner.Hp
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to let {1} lose 1 hp?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(victim),
        ).extract()
      : TranslationPack.translationJsonPatcher(
          '{0}: do you want to let {1} recover 1 hp?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(victim),
        ).extract();
  }

  public async onTrigger(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    event.animation = [
      {
        from: event.fromId,
        tos: [(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId],
      },
    ];

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const victim = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId;
    const originalPlayers = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
    originalPlayers.includes(victim) || originalPlayers.push(victim);
    room.getPlayerById(event.fromId).setFlag<PlayerId[]>(this.Name, originalPlayers);

    const chosen = EventPacker.getMiddleware<string>(this.Name, event);
    if (chosen) {
      chosen === this.WeiYiOptions[0]
        ? await room.loseHp(victim, 1)
        : await room.recover({ toId: victim, recoveredHp: 1, recoverBy: event.fromId });
    } else if (room.getPlayerById(event.fromId).Hp < room.getPlayerById(victim).Hp) {
      await room.loseHp(victim, 1);
    } else {
      await room.recover({ toId: victim, recoveredHp: 1, recoverBy: event.fromId });
    }

    return true;
  }
}
