import { CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { DamageType } from 'core/game/game_props';
import { AllStage, PlayerDyingStage } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, LimitSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@LimitSkill({ name: 'wanlan', description: 'wanlan_description' })
export class WanLan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PlayerDyingStage.PlayerDying;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>): boolean {
    return !room.getPlayerById(event.dying).Dead && room.getPlayerById(event.dying).Hp <= 0;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to use this skill, discard all your hand cards, then let {1} recover to 1 hp, and deal 1 damage to current player?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.dying)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.dropCards(
      CardMoveReason.SelfDrop,
      room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.HandArea),
      event.fromId,
      event.fromId,
      this.Name,
    );

    const dying = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PlayerDyingEvent>).dying;
    await room.recover({
      toId: dying,
      recoveredHp: 1 - room.getPlayerById(dying).Hp,
      recoverBy: event.fromId,
    });

    EventPacker.addMiddleware(
      { tag: this.Name, data: true },
      event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: WanLan.Name, description: WanLan.Description })
export class WanLanShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
      EventPacker.getMiddleware<boolean>(this.GeneralName, event) === true &&
      !owner.Dead &&
      room.CurrentPlayer !== undefined &&
      !room.CurrentPlayer.Dead
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    await room.damage({
      fromId: event.fromId,
      toId: room.CurrentPlayer.Id,
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}
