import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { DamageType } from 'core/game/game_props';
import { AllStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'anyong', description: 'anyong_description' })
export class AnYong extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.DamageEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent &&
        event.fromId === room.CurrentPlayer.Id &&
        event.toId !== event.fromId,
      undefined,
      'round',
      undefined,
      1,
    );
    if (records.length > 0) {
      owner.setFlag<boolean>(AnYongShadow.Name, true);
      EventPacker.addMiddleware({ tag: this.Name, data: true }, records[0]);
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.fromId !== undefined &&
      room.CurrentPlayer.Id === content.fromId &&
      content.toId !== content.fromId &&
      content.damage === 1 &&
      EventPacker.getMiddleware<boolean>(this.Name, content) === true &&
      owner.getCardIds(PlayerCardsArea.HandArea).length > 0 &&
      !room.getPlayerById(content.toId).Dead
    );
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: PlayerId): boolean {
    return room.canDropCard(owner, cardId);
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to discard a card to deal 1 damage to {1} ?',
      this.Name,
      TranslationPack.patchPlayerInTranslation(room.getPlayerById(event.toId)),
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.cardIds) {
      return false;
    }

    await room.dropCards(CardMoveReason.SelfDrop, event.cardIds, event.fromId, event.fromId, this.Name);
    await room.damage({
      fromId: event.fromId,
      toId: (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId,
      damage: 1,
      damageType: DamageType.Normal,
      triggeredBySkills: [this.Name],
    });

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: AnYong.Name, description: AnYong.Description })
export class AnYongShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isAutoTrigger(): boolean {
    return true;
  }

  public isFlaggedSkill(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === DamageEffectStage.DamageDone || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = event as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.fromId !== undefined &&
        room.CurrentPlayer.Id === damageEvent.fromId &&
        damageEvent.toId !== damageEvent.fromId &&
        !owner.getFlag<boolean>(this.Name)
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = event as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.from === PlayerPhase.PhaseFinish && owner.getFlag<boolean>(this.Name);
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.DamageEvent) {
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
      EventPacker.addMiddleware({ tag: this.GeneralName, data: true }, unknownEvent);
    } else {
      room.removeFlag(event.fromId, this.Name);
    }

    return true;
  }
}
