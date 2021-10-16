import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId, PlayerRole } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { GameMode } from 'core/shares/types/room_props';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, LimitSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'xushen', description: 'xushen_description' })
export class XuShen extends TriggerSkill {
  public get RelatedSkills(): string[] {
    return ['zhennan'];
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return event.dying === owner.Id && owner.Hp <= 0;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.recover({
      toId: event.fromId,
      recoveredHp: 1,
      recoverBy: event.fromId,
    });

    await room.obtainSkill(event.fromId, this.RelatedSkills[0]);
    EventPacker.addMiddleware(
      { tag: this.Name, data: true },
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XuShen.Name, description: XuShen.Description })
export class XuShenShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return (
      EventPacker.getMiddleware<boolean>(this.GeneralName, content) === true &&
      stage === PlayerDyingStage.AfterPlayerDying
    );
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.AfterPlayerDying;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return (
      event.dying === owner.Id &&
      EventPacker.getMiddleware<boolean>(this.GeneralName, event) === true &&
      !owner.Dead &&
      !room.getAllPlayersFrom().find(player => player.Character.Name === 'guansuo')
    );
  }

  public numberOfTargets(): number {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to choose another player to let him change general to Guan Suo and draw 3 cards?',
      this.GeneralName,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { toIds } = event;
    if (!toIds) {
      return false;
    }

    const { selectedOption } = await room.doAskForCommonly<GameEventIdentifiers.AskForChoosingOptionsEvent>(
      GameEventIdentifiers.AskForChoosingOptionsEvent,
      {
        toId: toIds[0],
        options: ['yes', 'no'],
        conversation: TranslationPack.translationJsonPatcher(
          '{0}: do you want to change your general to Guan Suo and draw 3 cards?',
          this.Name,
        ).extract(),
      },
      toIds[0],
      true,
    );

    if (selectedOption === 'yes') {
      const guansuo = Sanguosha.getCharacterByCharaterName('guansuo');
      const maxHp =
        room.getPlayerById(toIds[0]).Role === PlayerRole.Lord &&
        room.getRoomInfo().gameMode === GameMode.Standard &&
        room.Players.length > 4
          ? guansuo.MaxHp + 1
          : guansuo.MaxHp;
      const playerPropertiesChangeEvent: ServerEventFinder<GameEventIdentifiers.PlayerPropertiesChangeEvent> = {
        changedProperties: [
          {
            toId: toIds[0],
            characterId: guansuo.Id,
            maxHp,
            hp: maxHp,
          },
        ],
      };

      await room.changeGeneral(playerPropertiesChangeEvent);

      await room.drawCards(3, toIds[0], 'top', event.fromId, this.Name);
    }

    return true;
  }
}
