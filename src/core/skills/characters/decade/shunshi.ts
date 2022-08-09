import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import {
  CardDrawReason,
  CardMoveArea,
  CardMoveReason,
  GameEventIdentifiers,
  ServerEventFinder,
} from 'core/event/event';
import { EventPacker } from 'core/event/event_packer';
import { Sanguosha } from 'core/game/engine';
import {
  AllStage,
  DamageEffectStage,
  DrawCardStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';
import { PatchedTranslationObject, TranslationPack } from 'core/translations/translation_json_tool';

@CommonSkill({ name: 'shunshi', description: 'shunshi_description' })
export class ShunShi extends TriggerSkill {
  public static readonly ShunShiBuff = 'shunshi_buff';

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseStageChangeStage.StageChanged || stage === DamageEffectStage.AfterDamagedEffect;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): boolean {
    if (owner.getPlayerCards().length === 0) {
      return false;
    }
    owner.getFlag<PlayerId>(this.Name) && room.removeFlag(owner.Id, this.Name);

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId === owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PrepareStageStart
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      const canUse =
        room.CurrentPlayer !== owner &&
        damageEvent.toId === owner.Id &&
        room.getOtherPlayers(owner.Id).find(player => player.Id !== damageEvent.fromId) !== undefined;

      if (canUse) {
        damageEvent.fromId !== undefined &&
          damageEvent.fromId !== owner.Id &&
          room.setFlag<PlayerId>(owner.Id, this.Name, damageEvent.fromId);
      }
    }

    return false;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 1;
  }

  public isAvailableTarget(owner: string, room: Room, target: string): boolean {
    return target !== owner && target !== room.getFlag<PlayerId>(owner, this.Name);
  }

  public isAvailableCard(): boolean {
    return true;
  }

  public getSkillLog(
    room: Room,
    owner: Player,
    event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent | GameEventIdentifiers.DamageEvent>,
  ): PatchedTranslationObject {
    return owner.getFlag<PlayerId>(this.Name)
      ? TranslationPack.translationJsonPatcher(
          '{0}: do you want to give another player except {1} a card?',
          this.Name,
          TranslationPack.patchPlayerInTranslation(
            room.getPlayerById((event as ServerEventFinder<GameEventIdentifiers.DamageEvent>).fromId!),
          ),
        ).extract()
      : TranslationPack.translationJsonPatcher('{0}: do you want to give another player a card?', this.Name).extract();
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    if (!event.toIds || !event.cardIds) {
      return false;
    }

    await room.moveCards({
      movingCards: [{ card: event.cardIds[0], fromArea: room.getPlayerById(fromId).cardFrom(event.cardIds[0]) }],
      fromId,
      toId: event.toIds[0],
      toArea: CardMoveArea.HandArea,
      moveReason: CardMoveReason.ActiveMove,
      proposer: fromId,
      triggeredBySkills: [this.Name],
    });

    let originalBuff = room.getFlag<number>(fromId, ShunShi.ShunShiBuff) || 0;
    originalBuff++;
    room.setFlag<number>(
      fromId,
      ShunShi.ShunShiBuff,
      originalBuff,
      TranslationPack.translationJsonPatcher('shunshi points: {0}', originalBuff).toString(),
    );

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShunShi.Name, description: ShunShi.Description })
export class ShunShiShadow extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isFlaggedSkill(room: Room, event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === DrawCardStage.CardDrawing || stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent>,
  ): boolean {
    const flag = owner.getFlag<number>(ShunShi.ShunShiBuff);
    if (flag === undefined) {
      return false;
    }

    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = content as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      return (
        drawCardEvent.fromId === owner.Id &&
        room.CurrentPlayerPhase === PlayerPhase.DrawCardStage &&
        drawCardEvent.bySpecialReason === CardDrawReason.GameStage &&
        flag > 0
      );
    } else if (identifier === GameEventIdentifiers.PhaseChangeEvent) {
      const phaseChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>;
      return phaseChangeEvent.fromPlayer === owner.Id && phaseChangeEvent.from === PlayerPhase.PhaseFinish;
    }

    return false;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const unkownEvent = event.triggeredOnEvent as ServerEventFinder<
      GameEventIdentifiers.DrawCardEvent | GameEventIdentifiers.PhaseChangeEvent
    >;

    const identifier = EventPacker.getIdentifier(unkownEvent);
    if (identifier === GameEventIdentifiers.DrawCardEvent) {
      const drawCardEvent = unkownEvent as ServerEventFinder<GameEventIdentifiers.DrawCardEvent>;
      drawCardEvent.drawAmount += room.getFlag<number>(event.fromId, ShunShi.ShunShiBuff);
    } else {
      room.removeFlag(event.fromId, ShunShi.ShunShiBuff);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: ShunShiShadow.Name, description: ShunShiShadow.Description })
export class ShunShiBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableTimes(cardId: CardId | CardMatcher, room: Room, owner: Player): number {
    const flag = room.getFlag<number>(owner.Id, ShunShi.ShunShiBuff);
    if (!flag || room.CurrentPlayerPhase !== PlayerPhase.PlayCardStage) {
      return 0;
    }

    let match = false;
    if (cardId instanceof CardMatcher) {
      match = cardId.match(new CardMatcher({ generalName: ['slash'] }));
    } else {
      match = Sanguosha.getCardById(cardId).GeneralName === 'slash';
    }

    if (match) {
      return flag;
    } else {
      return 0;
    }
  }

  public breakAdditionalCardHoldNumber(room: Room, owner: Player): number {
    const flag = room.getFlag<number>(owner.Id, ShunShi.ShunShiBuff);
    if (!flag || room.CurrentPlayerPhase !== PlayerPhase.DropCardStage) {
      return 0;
    }

    return flag;
  }
}
