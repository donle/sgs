import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import { AllStage, PhaseChangeStage, PlayerPhase } from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { ActiveSkill, OnDefineReleaseTiming, RulesBreakerSkill, TriggerSkill } from 'core/skills/skill';
import { CommonSkill, PersistentSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'fenxun', description: 'fenxun_description' })
export class FenXun extends ActiveSkill {
  public canUse(room: Room, owner: Player) {
    return !owner.hasUsedSkill(this.Name);
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]): boolean {
    return cards.length === 0;
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(owner: PlayerId, room: Room, target: PlayerId): boolean {
    return target !== owner;
  }

  public isAvailableCard() {
    return false;
  }

  public async onUse(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillUseEvent>) {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    if (!event.toIds) {
      return false;
    }

    const originalTargets = room.getFlag<PlayerId[]>(event.fromId, this.Name) || [];
    if (!originalTargets.includes(event.toIds[0])) {
      originalTargets.push(event.toIds[0]);
      room.setFlag<PlayerId[]>(event.fromId, this.Name, originalTargets);
    }

    return true;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FenXun.Name, description: FenXun.Description })
export class FenXunShadow extends RulesBreakerSkill implements OnDefineReleaseTiming {
  public afterLosingSkill(
    room: Room,
    owner: PlayerId,
    content: ServerEventFinder<GameEventIdentifiers>,
    stage?: AllStage,
  ): boolean {
    return room.CurrentPlayerPhase === PlayerPhase.PhaseFinish && stage === PhaseChangeStage.PhaseChanged;
  }

  public breakDistanceTo(room: Room, owner: Player, target: Player): number {
    const targets = owner.getFlag<PlayerId[]>(this.GeneralName);
    return targets && targets.includes(target.Id) ? 1 : 0;
  }
}

@ShadowSkill
@PersistentSkill()
@CommonSkill({ name: FenXunShadow.Name, description: FenXunShadow.Description })
export class FenXunDiscard extends TriggerSkill implements OnDefineReleaseTiming {
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

  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers>, stage?: AllStage): boolean {
    return stage === PhaseChangeStage.PhaseChanged;
  }

  public canUse(room: Room, owner: Player, event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>): boolean {
    return event.from === PlayerPhase.PhaseFinish && !!owner.getFlag<PlayerId[]>(this.GeneralName);
  }

  public async onTrigger(): Promise<boolean> {
    return true;
  }

  public async onEffect(room: Room, event: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const damageRecords = room.Analytics.getDamageRecord(event.fromId, 'round');

    let dropNum = 0;
    for (const toId of room.getFlag<PlayerId[]>(event.fromId, this.GeneralName)) {
      damageRecords.find(event => event.toId === toId) && dropNum++;
    }

    if (dropNum > 0 && room.getPlayerById(event.fromId).getPlayerCards().length > 0) {
      const response = await room.askForCardDrop(
        event.fromId,
        dropNum,
        [PlayerCardsArea.HandArea, PlayerCardsArea.EquipArea],
        true,
        undefined,
        this.GeneralName,
      );
      response.droppedCards.length > 0 &&
        (await room.dropCards(
          CardMoveReason.SelfDrop,
          response.droppedCards,
          event.fromId,
          event.fromId,
          this.GeneralName,
        ));
    }

    room.removeFlag(event.fromId, this.GeneralName);

    return true;
  }
}
