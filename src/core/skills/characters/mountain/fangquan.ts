import { CardId } from 'core/cards/libs/card_props';
import { CardMoveReason, GameEventIdentifiers, ServerEventFinder } from 'core/event/event';
import {
  AllStage,
  PhaseChangeStage,
  PhaseStageChangeStage,
  PlayerPhase,
  PlayerPhaseStages,
} from 'core/game/stage_processor';
import { Player } from 'core/player/player';
import { PlayerCardsArea, PlayerId } from 'core/player/player_props';
import { Room } from 'core/room/room';
import { TriggerSkill } from 'core/skills/skill';
import { CommonSkill, ShadowSkill } from 'core/skills/skill_wrappers';

@CommonSkill({ name: 'fangquan', description: 'fangquan_description' })
export class FangQuan extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>, stage?: AllStage) {
    return event.to === PlayerPhase.PlayCardStage && stage === PhaseChangeStage.BeforePhaseChange;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseChangeEvent>) {
    return content.toPlayer === owner.Id;
  }

  public isRefreshAt(room: Room, owner: Player, stage: PlayerPhase) {
    return stage === PlayerPhase.PhaseBegin;
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId } = skillUseEvent;
    await room.skip(fromId, PlayerPhase.PlayCardStage);

    return true;
  }
}

@ShadowSkill
@CommonSkill({ name: FangQuan.GeneralName, description: FangQuan.Description })
export class FangQuanShadow extends TriggerSkill {
  public isTriggerable(event: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>, stage?: AllStage) {
    return stage === PhaseStageChangeStage.StageChanged;
  }

  public canUse(room: Room, owner: Player, content: ServerEventFinder<GameEventIdentifiers.PhaseStageChangeEvent>) {
    return (
      content.playerId === owner.Id &&
      content.toStage === PlayerPhaseStages.DropCardStageStart &&
      owner.hasUsedSkill(this.GeneralName)
    );
  }

  public numberOfTargets() {
    return 1;
  }

  public isAvailableTarget(ownerId: PlayerId, room: Room, targetId: PlayerId) {
    return targetId !== ownerId;
  }

  public cardFilter(room: Room, owner: Player, cards: CardId[]) {
    return cards.length === 1;
  }

  public isAvailableCard(owner: PlayerId, room: Room, cardId: CardId) {
    return true;
  }

  public availableCardAreas() {
    return [PlayerCardsArea.HandArea];
  }

  public getSkillLog(room: Room, owner: Player) {
    return 'fangquan: choose 1 card and 1 player to whom you ask play one round';
  }

  public async onTrigger() {
    return true;
  }

  public async onEffect(room: Room, skillUseEvent: ServerEventFinder<GameEventIdentifiers.SkillEffectEvent>) {
    const { fromId, cardIds, toIds } = skillUseEvent;

    await room.dropCards(CardMoveReason.SelfDrop, cardIds!, fromId, fromId, this.GeneralName);

    room.insertPlayerRound(toIds![0]);

    return true;
  }
}
