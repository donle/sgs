import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { CardMoveArea, CardMoveReason, EventPacker, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { Sanguosha } from 'core/game/engine';
import { DamageType } from 'core/game/game_props';
import {
  AllStage,
  DamageEffectStage,
  GameBeginStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { MarkEnum } from 'core/shares/types/mark_list';
import { ActiveSkill, FilterSkill, TriggerSkill } from 'core/skills/skill';
import { OnDefineReleaseTiming } from 'core/skills/skill_hooks';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'xionghuo', description: 'xionghuo_description' })
export class XiongHuo extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.getMark(MarkEnum.BaoLi) > 0;
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner && room.getMark(target, MarkEnum.BaoLi) === 0;
  }

  public isAvailableCard(): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    if (!event.toIds) {
      return false;
    }

    room.addMark(event.fromId, MarkEnum.BaoLi, -1);
    room.addMark(event.toIds[0], MarkEnum.BaoLi, 1);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: XiongHuo.Name, description: XiongHuo.Description })
export class XiongHuoShadow extends TriggerSkill {
  public isAutoTrigger(): boolean {
    return true;
  }

  public isTriggerable(
    event: ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.DamageEvent
    >,
    stage?: AllStage,
  ): boolean {
    return (
      stage === GameBeginStage.AfterGameBegan ||
      stage === PhaseStageChangeStage.StageChanged ||
      stage === DamageEffectStage.DamageEffect
    );
  }

  public canUse(
    room: Room,
    owner: Player,
    content: ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.DamageEvent
    >,
  ): boolean {
    const identifier = EventPacker.getIdentifier(content);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const phaseStageChangeEvent = content as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>;
      return (
        phaseStageChangeEvent.playerId !== owner.Id &&
        phaseStageChangeEvent.toStage === PlayerPhaseStages.PlayCardStageStart &&
        room.getPlayerById(phaseStageChangeEvent.playerId).getMark(MarkEnum.BaoLi) > 0
      );
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = content as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      return (
        damageEvent.fromId === owner.Id &&
        damageEvent.toId !== owner.Id &&
        room.getPlayerById(damageEvent.toId).getMark(MarkEnum.BaoLi) > 0
      );
    }

    return identifier === GameEventIdentifiers.GameBeginEvent;
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId } = event;
    const unknownEvent = event.triggeredOnEvent as ServerEventFinder<
      | GameEventIdentifiers.GameBeginEvent
      | GameEventIdentifiers.PhaseStageChangeEvent
      | GameEventIdentifiers.DamageEvent
    >;

    const identifier = EventPacker.getIdentifier(unknownEvent);
    if (identifier === GameEventIdentifiers.PhaseStageChangeEvent) {
      const playerId = (unknownEvent as ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>).playerId;
      room.setMark(playerId, MarkEnum.BaoLi, 0);

      const options = ['fire', 'lose', 'prey'];
      const randomOption = options[Math.floor(Math.random() * options.length)];
      if (randomOption === options[0]) {
        await room.damage({
          fromId,
          toId: playerId,
          damage: 1,
          damageType: DamageType.Fire,
          triggeredBySkills: [this.GeneralName],
        });

        room.setFlag<PlayerId>(fromId, this.GeneralName, playerId);
      } else if (randomOption === options[1]) {
        await room.loseHp(playerId, 1);

        room.syncGameCommonRules(playerId, user => {
          room.CommonRules.addAdditionalHoldCardNumber(user, -1);
          user.addInvisibleMark(this.GeneralName, 1);
        });
      } else {
        for (const area of [PlayerCardsArea.EquipArea, PlayerCardsArea.HandArea]) {
          const cards = room.getPlayerById(playerId).getCardIds(area);
          cards.length > 0 &&
            (await room.moveCards({
              movingCards: [{ card: cards[Math.floor(Math.random() * cards.length)], fromArea: area }],
              fromId: playerId,
              toId: fromId,
              toArea: CardMoveArea.HandArea,
              moveReason: CardMoveReason.ActivePrey,
              proposer: fromId,
              triggeredBySkills: [this.Name],
            }));
        }
      }
    } else if (identifier === GameEventIdentifiers.DamageEvent) {
      const damageEvent = unknownEvent as ServerEventFinder<GameEventIdentifiers.DamageEvent>;
      damageEvent.damage++;
    } else {
      room.addMark(fromId, MarkEnum.BaoLi, 3);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XiongHuoShadow.Name, description: XiongHuoShadow.Description })
export class XiongHuoFilter extends FilterSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public canBeUsedCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId, attacker?: PlayerId): boolean {
    if (
      room.getFlag<PlayerId>(owner, this.GeneralName) === undefined ||
      room.getFlag<PlayerId>(owner, this.GeneralName) !== attacker
    ) {
      return true;
    }

    if (cardId instanceof CardMatcher) {
      return !new CardMatcher({ generalName: ['slash'] }).match(cardId);
    } else {
      return Sanguosha.getCardById(cardId).GeneralName !== 'slash';
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XiongHuoFilter.Name, description: XiongHuoFilter.Description })
export class XiongHuoRemover extends TriggerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public get Muted() {
    return true;
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
      event.from === PlayerPhase.PhaseFinish &&
      (room.getFlag<PlayerId>(owner.Id, this.GeneralName) !== undefined ||
        (event.fromPlayer !== undefined && room.getPlayerById(event.fromPlayer).getInvisibleMark(this.GeneralName) > 0))
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.GeneralName);

    const toId = (event.triggeredOnEvent as ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>).fromPlayer;
    toId &&
      room.syncGameCommonRules(toId, user => {
        room.CommonRules.addAdditionalHoldCardNumber(user, user.getInvisibleMark(this.GeneralName));
        user.removeInvisibleMark(this.GeneralName);
      });

    return true;
  }
}
