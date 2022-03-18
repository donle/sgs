import { EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardUseStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { ShiBeiShadow } from '../yijiang2014/shibei';
import { ZhenGe } from './zhenge';

@CompulsorySkill({ name: 'xinghan', description: 'xinghan_description' })
export class XingHan extends TriggerSkill {
  public async whenObtainingSkill(room: Room, owner: Player) {
    const records = room.Analytics.getRecordEvents<GameEventIdentifiers.CardUseEvent>(
      event =>
        EventPacker.getIdentifier(event) === GameEventIdentifiers.CardUseEvent &&
        Sanguosha.getCardById(event.cardId).GeneralName === 'slash',
      undefined,
      'round',
      undefined,
      1,
    );
    if (records.length > 0 && !owner.getFlag<boolean>(XingHanShadow.Name)) {
      owner.setFlag<boolean>(ShiBeiShadow.Name, true);
      records[0].triggeredBySkills = [...(records[0].triggeredBySkills || []), this.Name];
    }
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamageEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      content.triggeredBySkills.includes(this.Name) &&
      content.cardIds !== undefined &&
      Sanguosha.getCardById(content.cardIds[0]).GeneralName === 'slash' &&
      content.fromId !== undefined &&
      owner.getFlag<PlayerId[]>(ZhenGe.ZhenGeTargets)?.includes(content.fromId)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const notRichest = room
      .getOtherPlayers(fromId)
      .find(
        player =>
          room.getPlayerById(fromId).getCardIds(PlayerCardsArea.HandArea).length <=
          player.getCardIds(PlayerCardsArea.HandArea).length,
      );

    await room.drawCards(
      notRichest
        ? Math.min(
            room
              .getPlayerById((event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!)
              .getAttackRange(room),
            5,
          )
        : 1,
      fromId,
      'top',
      fromId,
      this.Name,
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CompulsorySkill({ name: XingHan.Name, description: XingHan.Description })
export class XingHanShadow extends TriggerSkill implements OnDefineReleaseTiming {
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
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage?: AllStage,
  ) {
    return stage === CardUseStage.BeforeCardUseEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(event);
    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = event as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      return !owner.getFlag<boolean>(this.Name) && Sanguosha.getCardById(cardUseEvent.cardId).GeneralName === 'slash';
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
      GameEventIdentifiers.CardUseEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardUseEvent) {
      const cardUseEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardUseEvent>;
      room.getPlayerById(event.fromId).setFlag<boolean>(this.Name, true);
      cardUseEvent.triggeredBySkills = [...(cardUseEvent.triggeredBySkills || []), this.GeneralName];
    } else {
      room.removeFlag(event.fromId, this.Name);
    }

    return true;
  }
}
