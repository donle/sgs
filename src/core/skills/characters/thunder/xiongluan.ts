import { CardMatcher } from 'core/cards/libs/card_matcher';
import { CardId } from 'core/cards/libs/card_props';
import { GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { INFINITE_DISTANCE, INFINITE_TRIGGERING_TIMES } from 'core/game/game_props';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import {
  ActiveSkill,
  CommonSkill,
  FilterSkill,
  LimitSkill,
  OnDefineReleaseTiming,
  PersistentSkill,
  RulesBreakerSkill,
  ShadowSkill,
  TriggerSkill,
} from 'core/skills/skill';

@LimitSkill({ name: 'xiongluan', description: 'xiongluan_description' })
export class XiongLuan extends ActiveSkill {
  public canUse(room: Room, owner: Player): boolean {
    return owner.AvailableEquipSections.length > 0 && !owner.judgeAreaDisabled();
  }

  public numberOfTargets(): number {
    return 1;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return owner !== target;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId): boolean {
    return false;
  }

  public async onUse(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    const { fromId, toIds } = event;
    if (!toIds) {
      return false;
    }

    const from = room.getPlayerById(fromId);
    const equipSections = from.AvailableEquipSections;
    if (equipSections.length > 0) {
      await room.abortPlayerEquipSections(fromId, ...equipSections);
    }
    if (!from.judgeAreaDisabled()) {
      await room.abortPlayerJudgeArea(fromId);
    }

    room.setFlag<PlayerId>(toIds[0], this.Name, fromId, this.Name);
    from.setFlag<boolean>(XiongLuanShadow.Name, true);
    await room.obtainSkill(toIds[0], XiongLuanDeBuff.Name);

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XiongLuan.Name, description: XiongLuan.Description })
export class XiongLuanShadow extends TriggerSkill implements OnDefineReleaseTiming {
  public afterDead(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
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
      owner.Id === event.fromPlayer && event.from === PlayerPhase.PlayCardStage && owner.getFlag<boolean>(this.Name)
    );
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>): Promise<boolean> {
    room.removeFlag(event.fromId, this.Name);
    for (const other of room.getOtherPlayers(event.fromId)) {
      if (room.getFlag<PlayerId>(other.Id, this.GeneralName)) {
        room.removeFlag(other.Id, this.GeneralName);
        if (other.hasShadowSkill(XiongLuanDeBuff.Name)) {
          await room.loseSkill(other.Id, XiongLuanDeBuff.Name);
        }
      }
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: XiongLuanShadow.Name, description: XiongLuanShadow.Description })
export class XiongLuanBuff extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakCardUsableDistanceTo(
    cardId: CardId | CardMatcher | undefined,
    room: Room,
    owner: Player,
    target: Player,
  ): number {
    if (target.getFlag<PlayerId>(this.GeneralName) === owner.Id) {
      return INFINITE_DISTANCE;
    } else {
      return 0;
    }
  }

  public breakCardUsableTimesTo(cardId: CardId | CardMatcher, room: Room, owner: Player, target: Player): number {
    if (target.getFlag<PlayerId>(this.GeneralName) === owner.Id) {
      return INFINITE_TRIGGERING_TIMES;
    } else {
      return 0;
    }
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: 's_xiongluan_debuff', description: 's_xiongluan_debuff_description' })
export class XiongLuanDeBuff extends FilterSkill {
  canUseCard(cardId: CardId | CardMatcher, room: Room, owner: PlayerId) {
    return cardId instanceof CardMatcher
      ? true
      : room.getPlayerById(owner).cardFrom(cardId) !== PlayerCardsArea.HandArea;
  }
}
