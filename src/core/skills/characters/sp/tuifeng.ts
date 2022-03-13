import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'tuifeng', description: 'tuifeng_description' })
export class TuiFeng extends TriggerSkill implements OnDefineReleaseTiming {
  public async whenDead(room: Room, owner: Player) {
    room.removeFlag(owner.Id, this.Name);
  }

  public isAutoTrigger(room: Room, owner: Player, event?: ServerEventFinder<GameEventIdentifiers>): boolean {
    return event !== undefined && EventPacker.getIdentifier(event) === GameEventIdentifiers.PhaseStageChangeEvent;
  }

  public isTriggerable(
    event: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
    stage?: AllStage,
  ): boolean {
    return stage === DamageEffectStage.AfterDamagedEffect || stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DamageEvent | GameEventIdentifiers.PhaseStageChangeEvent>,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      return (
        (content as ServerEventFinder<GameEventIdentifiers.DamageEvent>).toId === owner.Id &&
        owner.getPlayerCards().length > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart &&
        owner.getCardIds(PlayerCardsArea.OutsideArea, this.Name).length > 0
      );
    }

    return false;
  }

  public triggerableTimes(event: ServerEventFinder<GameEventIdentifiers.DamageEvent>) {
    return EventPacker.getIdentifier(event) === GameEventIdentifiers.DamageEvent ? event.damage : 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableCard() {
    return true;
  }

  public getSkillLog(): PatchedTranslationObject {
    return TranslationPack.translationJsonPatcher(
      '{0}: do you want to put a card on your general card as ‘Feng’?',
      this.Name,
    ).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const identifier = EventPacker.getIdentifier(event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers>);
    if (identifier === GameEventIdentifiers.DamageEvent) {
      if (!event.cardIds) {
        return false;
      }

      await room.moveCards({
        movingCards: [
          { card: event.cardIds[0], fromArea: room.getPlayerById(event.fromId).cardFrom(event.cardIds[0]) },
        ],
        fromId: event.fromId,
        toId: event.fromId,
        toArea: CardMoveArea.OutsideArea,
        moveReason: CardMoveReason.ActiveMove,
        proposer: event.fromId,
        isOutsideAreaInPublic: true,
        toOutsideArea: this.Name,
        triggeredBySkills: [this.Name],
      });
    } else {
      const feng = room.getPlayerById(event.fromId).getCardIds(PlayerCardsArea.OutsideArea, this.Name).slice();
      await room.moveCards({
        movingCards: feng.map(card => ({ card, fromArea: CardMoveArea.OutsideArea })),
        fromId: event.fromId,
        toArea: CardMoveArea.DropStack,
        moveReason: CardMoveReason.PlaceToDropStack,
        proposer: event.fromId,
        triggeredBySkills: [this.Name],
      });

      await room.drawCards(feng.length * 2, event.fromId, 'top', event.fromId, this.Name);

      room.setFlag<number>(
        event.fromId,
        this.Name,
        feng.length,
        TranslationPack.translationJsonPatcher('tuifeng: {0}', feng.length).toString(),
      );
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TuiFeng.Name, description: TuiFeng.Description })
export class TuiFengBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    if (!room.getFlag<number>(owner.Id, this.GeneralName)) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return room.getFlag<number>(owner.Id, this.GeneralName);
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: TuiFengBuff.Name, description: TuiFengBuff.Description })
export class TuiFengShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return (
      owner.Id === event.fromPlayer &&
      event.from === PlayerPhase.PhaseFinish &&
      owner.getFlag<number>(this.GeneralName) !== undefined
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
