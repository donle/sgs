import { CardType } from 'core/cards/card';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import { AllStage, CardEffectStage, DamageEffectStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { OnDefineReleaseTiming, TriggerSkill } from 'core/skills/skill';
import { CompulsorySkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { TranslationPack } from 'core/translations/translation_json_tool';

@CompulsorySkill({ name: 'zhichi', description: 'zhichi_description' })
export class ZhiChi extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>, stage?: AllStage): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.DamageEvent>): boolean {
    return (
      owner.Id === content.toId && room.CurrentPlayer !== owner && room.getFlag<boolean>(owner.Id, this.Name) !== true
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(
    room: Room,
    skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>,
  ): Promise<boolean> {
    room.setFlag(skillUseEvent.fromId, this.Name, true, this.Name);

    return true;
  }
}

@ShadowSkill
@CompulsorySkill({ name: ZhiChi.Name, description: ZhiChi.Description })
export class ZhiChiShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.PhaseChangeEvent>,
    stage: AllStage,
  ): boolean {
    return stage === CardEffectStage.PreCardEffect || stage === PhaseChangeStage.PhaseChanged;
  }

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage) {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ) {
    let canTrigger = false;
    if (EventPacker.getIdentifier(content) === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = content as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      const card = Sanguosha.getCardById(cardEffectEvent.cardId);
      canTrigger =
        cardEffectEvent.toIds !== undefined &&
        cardEffectEvent.toIds.includes(owner.Id) &&
        (card.GeneralName === 'slash' || (card.is(CardType.Trick) && !card.is(CardType.DelayedTrick)));
    } else if (EventPacker.getIdentifier(content) === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      canTrigger = phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return canTrigger && room.getFlag<boolean>(owner.Id, this.GeneralName) === true;
  }

  public async onTrigger(room: Room, content: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = content.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      content.translationsMessage = TranslationPack.translationJsonPatcher(
        '{0} triggered skill {1}, nullify {2}',
        TranslationPack.patchPlayerInTranslation(room.getPlayerById(content.fromId)),
        this.GeneralName,
        TranslationPack.patchCardInTranslation(cardEffectEvent.cardId),
      ).extract();
    }

    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>): Promise<boolean> {
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.CardEffectEvent | GameEventIdentifiers.PhaseChangeEvent
    >;
    const identifier = EventPacker.getIdentifier(unknownEvent);

    if (identifier === GameEventIdentifiers.CardEffectEvent) {
      const cardEffectEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.CardEffectEvent>;
      cardEffectEvent.nullifiedTargets?.push(event.fromId);
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      room.removeFlag(event.fromId, this.GeneralName);
    }

    return true;
  }
}
